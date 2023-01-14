const fetch = require('node-fetch');
const { Console } = require('node:console');
const fs = require('node:fs');
const { apiKey } = require('../config.json') ;
const { exec } = require('child_process');
const { SlashCommandBuilder } = require('discord.js');

async function retrieveBaseData(baseURL) {

return fetch(`${baseURL}`)
.then((response) => response.json())
.then((data) => {
    return data
});
}

async function retrieveIdAndTitle(baseURL, currentToken) {

return fetch(`${baseURL}&pageToken=${currentToken}`)
    .then(console.log(`Fetching: ${baseURL}&pageToken=${currentToken} `))
    .then(response => response.json())
    .then(data => ( 
      
      { // 
            tokenList: data.nextPageToken,
            idList: data.items.map(item => item.snippet.resourceId.videoId),
            videoTitles: data.items.map(item => item.snippet.title),
        }

    ));
}
pushBaseDataToPlaylistData = (baseData, playlistData) => {
playlistData.idList = baseData.items.map(item => item.snippet.resourceId.videoId)
playlistData.videoTitles = baseData.items.map(item => item.snippet.title)
playlistData.tokenList.push(baseData.nextPageToken);

}

presentPlaylistValues = (playlist) => {
console.log(`amount of videos in playlist: ${playlist.videoTitles.length} | amount of ids in playlist: ${playlist.idList.length}`)
setTimeout(random => {
playlist.videoTitles.forEach(function (element, i)  {
  console.log(`| ID: ${playlist.idList[i]} | videoTitle |  ${playlist.videoTitles[i]} `);
})
console.log(`tokens: ${playlist.tokenList}`);
console.log(`iterations: ${(playlist.tokenList.length > 0) ? playlist.tokenList.length+1 : 1} `);
},5500 )

}

async function fetchPlaylist (playlistID) {

const baseURL = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistID}&maxResults=100&key=${apiKey}`

let playlistData = {
  tokenList: [],
  idList: [],
  videoTitles: []
};

let baseData = await retrieveBaseData(baseURL);
let nextPageToken = baseData.nextPageToken
pushBaseDataToPlaylistData(baseData, playlistData);

console.log(`Fetching: ${baseURL}`)

if (nextPageToken) {
   console.log(`token found ${nextPageToken}`)
   
   while(true) {
    retrievedData = await retrieveIdAndTitle(baseURL, nextPageToken)
    nextPageToken = retrievedData.tokenList
  
    if (!retrievedData) break
  
    if (nextPageToken)  {
      playlistData.tokenList.push(retrievedData.tokenList);
    }

    playlistData.idList.push(...retrievedData.idList);
    playlistData.videoTitles.push(...retrievedData.videoTitles);
  
    if (!nextPageToken) break
  }
   console.log("OUTSIDE OF DO!!!!")
   
 // presentPlaylistValues(playlistData);
  
  
   

} else  {
    console.log("NO TOKEN!")
    //presentPlaylistValues(playlistData);

}
return playlistData
}

async function downloadAudio (videoId, videoTitle, interaction) {

//const mp3String = `yt-dlp -f bestaudio --extract-audio --audio-format mp3 --audio-quality 0 -o ./music/reggae/"%(title)s.%(ext)s" ${videoId}`
const mp3String = `yt-dlp -f bestaudio --extract-audio --audio-format vorbis --audio-quality 5 -o F:/bot/music/"%(title)s.%(ext)s" ${videoId}`
const oggString = `yt-dlp -f bestaudio --extract-audio --audio-format vorbis --audio-quality 5 -o F:/bot/music/"%(title)s.%(ext)s" ${videoId}`



const child = exec(mp3String, (err, res) => {
  console.log(`string: ${mp3String} | ${videoTitle}\n`);
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




async function downloadEntirePlaylist (playlistID, interaction) {

playlistData = await (fetchPlaylist(playlistID)) // returns all ids and titles from playlist

for (let i = 0; i<playlistData.idList.length;i++) {
  await downloadAudio(playlistData.idList[i], playlistData.videoTitles[i], interaction)
}


// download -> wait till completion -> start another download ->> ...finish entire playlist and return

}

//  downloadEntirePlaylist('PLo2x0xaD_xnLNMSlqjCdFWBcBArZleADv');
//fetchPlaylist('PL3817D41C7D841E23')


// PLFgA7tmgjurIAJkgyNdPD6n4H5UtPB_GR 4 videos

// PL3817D41C7D841E23 don't 
//PLpuDUpB0osJmZQ0a3n6imXirSu0QAZIqF has 
// PLJCXrsW_esBlb1BYfeNhY4kJQuNYoDpF_ 2 

module.exports = {

    data: new SlashCommandBuilder()	
    .setName('yt')
    .setDescription('Sends audio files')
    .addStringOption(option =>
        option.setName('filetype')
            .setDescription('Choose between mp3 or ogg.')
            .setRequired(true)
            .addChoices(
                { name: 'ogg', value: 'ogg' },
                { name: 'mp3', value: 'mp3' },))
    .addStringOption(option =>
        option.setName('id')
            .setDescription('Video/Playlist ID')
            .setRequired(true)),


        async execute(interaction)  {

            const filetype = interaction.options.getString('filetype');
            const id = interaction.options.getString('id');
            try {
                interaction.reply('Download of: ' + id + ' starting, filetype: ' + filetype);
                await downloadEntirePlaylist(id, interaction)
            } catch (err){ 

                console.log(err)
            
            }

            }

}