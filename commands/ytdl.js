const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const process = require("child_process");
const { exec } = require('child_process');
const fs = require("fs")
async function checkVideoName(url) {
  const command = `yt-dlp --print %(title)s "${url}"`;
  let output;
  try {
    output = await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  } catch (error) {
    console.log('exec error: ' + error);
  }
  return output.stdout;
}
canThisFileBeSentOverDiscord= (videoname) => {
	var stats = fs.statSync(`./music/${videoname}.mp3`)
	var fileSizeInBytes = stats.size;
// Convert the file size to megabytes (optional)
	var fileSizeInMegabytes = fileSizeInBytes / (1024*1024);
	console.log(`name: ${videoname} | filesize: ${fileSizeInMegabytes}`)
	if (fileSizeInBytes >=8) {
		console.log("Music too big to be sent through discord. File will remain solely in local storage")
		return false;
	} else {
		console.log("Sending file...");
		return true;
	}
}

module.exports = {
	data: new SlashCommandBuilder()	
		.setName('ytdl')
		.setDescription('Sends a random gif!')
		.addStringOption(option =>
			option.setName('filetype')
				.setDescription('Choose between music or video.')
				.setRequired(true)
				.addChoices(
					{ name: 'Music', value: 'mp3' },
					{ name: 'Video', value: 'mp4' },))
		.addStringOption(option =>
			option.setName('url')
				.setDescription('Video URL')
				.setRequired(true)),

	async execute(interaction) {
		const filetype = interaction.options.getString('filetype');
		const videoURL = interaction.options.getString('url');
		const commandMP3 = `yt-dlp -f bestaudio --extract-audio --audio-format mp3 --audio-quality 0 -o ./music/"%(title)s.%(ext)s" ${videoURL}`
		const commandMP4 = `yt-dlp -f -o "%(title)s.%(ext)s" ${videoURL}`
		const videoName = await checkVideoName(videoURL)
		const finalVideoName = videoName.substring(0, videoName.length - 1);

		if (filetype != 'mp3') {
			//wip
			return
			
		} else if (filetype === 'mp3'){
			try {
				interaction.channel.send('Download of: ' + finalVideoName + ' starting.');
				const child = exec(commandMP3, (err, res) => {
					interaction.channel.send('Download started.');
					console.log(`videoname: ` + finalVideoName);
					if (err) return console.log(err);
				
				})
				child.on('close', () => {
					if (canThisFileBeSentOverDiscord(finalVideoName)) {
						console.log(`./${finalVideoName}.mp3`)
						interaction.channel.send({ 
							content: "Download finished, uploading file.",
							files: [
							  `./music/${finalVideoName}.mp3`,
							]
						  });
					} else if (!canThisFileBeSentOverDiscord(finalVideoName)) {
						interaction.channel.send("Music file too big to be sent through discord.\nEnding Operation.")
						return
					}
					
	
				});
			} catch (error) {
				console.timeLog(error)
			}

		}
		await interaction.reply(`filetype chosen: ${filetype} | video url: ${videoURL}`);
		
	},
};
