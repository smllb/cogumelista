const fetch = require('node-fetch');
const { Console } = require('node:console');
const fs = require('node:fs');
const { apiKey } = require('../config.json') ;
const { exec } = require('child_process');
const util = require('util');
const { DataResolver } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const path = require('path');

async function retrieveDataFromQuery(baseURL, pageToken) {
    let reg = /\||\\|\/|:|\\?|"|<|>/ig;

    return fetch(`${baseURL}&pageToken${pageToken}`)
        .then(console.log(`Fetching: ${baseURL}&pageToken${pageToken}`))
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




async function retrievePlaylistObject (playlistID) {

    const baseURL = `https://www.googleapis.com/youtube/v3/playlistItems?` +
    `part=snippet,status` +
    `&fields=items(status(privacyStatus),snippet(title,resourceId)), nextPageToken` +
    `&playlistId=${playlistID}&maxResults=50&key=${apiKey}`;


    let query = await retrieveDataFromQuery(baseURL);
    const playlist = {};
    playlist.tokens = [query.nextPageToken];

    console.log(query.nextPageToken)
    if (query.nextPageToken) {
        console.log(`Token found ${playlist.tokens[0]}`)
        
        while (query.nextPageToken) {

        }
    } else {
        // downloadVideoAndConvert()

    }

}

//retrievePlaylistObject('PL4fGSI1pDJn4Gs2meaJRo9O8PNYvhjHIg')



module.exports = {
	data: new SlashCommandBuilder()
		.setName('fetch')
		.setDescription('lorem ipsum xd'),
	async execute(interaction) {
		interaction.reply("wip!")
	},
};