const fetch = require('node-fetch');
const { Console } = require('node:console');
const fs = require('node:fs');
const { apiKey } = require('../config.json') ;
const { exec } = require('child_process');
const util = require('util');
const { DataResolver } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const path = require('path');


buildQueryUrl = (baseURL, pageToken) => {
    const buildUrl = {
        base:  baseURL,
        token: `&pageToken=${pageToken}`
    }

    if (pageToken) {
        
        return buildUrl.base+buildUrl.token
    } 
    return buildUrl.base;
    
}

async function retrieveDataFromQuery(baseURL, pageToken) {
    let reg = /\||\\|\/|:|\\?|"|<|>/ig;
    
    let url = buildQueryUrl(baseURL, pageToken)
    
    return fetch(`${url}`)
        .then(console.log(`sFetching: ${url}}`))
        .then(response => response.json())
        .then(data =>  {
             const items = data.items
                .filter(item => item.status.privacyStatus === 'public')
                .map((item, i)=> ({
                    id: item.snippet.resourceId.videoId,
                    title: item.snippet.title.replace(reg, "")
                }))   
                return {
                    items: items,
                    nextPageToken: data.nextPageToken
                }
        })    
    } 

    async function downloadAudio (videoId, videoTitle, interaction) {
 
        const oggString = `yt-dlp -f bestaudio --extract-audio --audio-format vorbis --audio-quality 5 -o F:/bot/music/"${videoTitle}".ogg ${videoId}`
        
        console.log(`starting: ${videoTitle}`)
        const child = exec(oggString, (err, res) => {
          console.log(`string: ${oggString}\n`);
          if (err) return console.log(err);
        
        })
        const result = new Promise(resolve => {
        
          child.on('exit', () => {
            console.log(`Download finished at: F:/bot/music/${videoTitle}.ogg`)
            interaction.channel.send({ 
                content: `Download finished, uploading file at F:/bot/music/${videoTitle}.ogg`,
                files: [
                  `F:/bot/music/${videoTitle}.ogg`,
                ]
              });
              
            resolve()
        });
        })
        return result;
        
        }




async function downloadPlaylist (playlistID, interaction) {

    const baseURL = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,status&fields=items(status(privacyStatus),snippet(title,resourceId)),nextPageToken&playlistId=${playlistID}&maxResults=50&key=${apiKey}`;


    let query = await retrieveDataFromQuery(baseURL);
    nextPageToken = query.nextPageToken;
    
    console.log(query.items.length);
    for (let i=0;i<query.items.length;i++) {
        await downloadAudio(query.items[i].id, query.items[i].title, interaction)
    }

    if (query.nextPageToken) {
        console.log(`Token found ${nextPageToken}`)

        while (nextPageToken) {

            query = await retrieveDataFromQuery(baseURL, nextPageToken);
            nextPageToken = query.nextPageToken;

            await query.items.forEach((item, i) => {
                downloadAudio(query.items[i].id, query.items[i].title, interaction)
            })

            console.log(`Leaving with token: ${query.nextPageToken}`)
            
        }

    } else {
       console.log(`No token found`)
       return

    }

}





module.exports = {

    data: new SlashCommandBuilder()	
    .setName('ytp')
    .setDescription('Download, convert and upload audio files from youtube videos or playlists.')
    .addStringOption(option =>
        option.setName('type')
            .setDescription('Choose between mp3 or ogg.')
            .setRequired(true)
            .addChoices(
                { name: 'playlist', value: 'playlist' },
                { name: 'downloadmusic', value: 'video' },))
    .addStringOption(option =>
        option.setName('id')
            .setDescription('Video/Playlist ID')
            .setRequired(true)),


        async execute(interaction)  {

            const type = interaction.options.getString('type');
            const id = interaction.options.getString('id');
            try {
                interaction.reply('Download of: ' + id + ' starting, type of operation: ' + type);
                await downloadPlaylist(id, interaction)
            } catch (err){ 

                console.log(err)
            
            }

            }

}