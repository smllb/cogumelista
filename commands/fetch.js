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
 
        const oggString = `yt-dlp -f bestaudio --extract-audio --audio-format vorbis --audio-quality 5 -o F:/bot/music/${videoTitle} ${videoId}`
        //const oggString = `yt-dlp -f bestaudio --extract-audio --audio-format vorbis --audio-quality 5 -o F:/bot/music/"%(title)s.%(ext)s" ${videoId}`
        
        
        
        const child = exec(oggString, (err, res) => {
          console.log(`string: ${oggString} | ${videoTitle}\n`);
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




async function retrievePlaylistObject (playlistID) {

    //const baseURL = `https://www.googleapis.com/youtube/v3/playlistItems?` +
    `part=snippet,status` +
    `&fields=items(status(privacyStatus),snippet(title,resourceId)),nextPageToken` +
    `&playlistId=${playlistID}&maxResults=50&key=${apiKey}`;
    const baseURL = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,status&fields=items(status(privacyStatus),snippet(title,resourceId)),nextPageToken&playlistId=${playlistID}&maxResults=50&key=${apiKey}`;


    let query = await retrieveDataFromQuery(baseURL);
    const playlist = {};
    playlist.items = query.items;
    playlist.tokens = [query.nextPageToken];
    let nextIndex = playlist.tokens.length;
    playlist.tokens[nextIndex] = 'yeet';
    nextPageToken = playlist.tokens[0]
    //console.log(nextPageToken)
    
    
    console.log("test: " + playlist.tokens.length)
    if (playlist.tokens[0]) {
        console.log(`Token found ${nextPageToken}`)

        while (nextPageToken) {
           // console.log(`Entering with token: ${playlist.tokens[nextIndex]}`)
            let nextQuery = await retrieveDataFromQuery(baseURL, nextPageToken);
            playlist.tokens[nextIndex] = nextQuery.nextPageToken
            nextPageToken = playlist.tokens[nextIndex]
            //console.log(nextPageToken)
            console.log(`Leaving with token: ${nextQuery.nextPageToken}`)
            //console.log(nextQuery)
            
        }
    } else {
       console.log(`No token found ${playlist.tokens[0]}`)
        // downloadVideoAndConvert()

    }

}

retrievePlaylistObject('PLpuDUpB0osJmZQ0a3n6imXirSu0QAZIqF')



module.exports = {
	data: new SlashCommandBuilder()
		.setName('fetch')
		.setDescription('lorem ipsum xd'),
	async execute(interaction) {
		interaction.reply("wip!")
	},
};