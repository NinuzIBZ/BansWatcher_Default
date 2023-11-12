const { EmbedBuilder } = require("discord.js");

function createPublicEmbed(player, steamID, reason, readableDate, serverName) {
  return new EmbedBuilder()
    .setColor("#0099cc")
    .setTitle(`${player} was Banned`)
    .setURL(`https://steamcommunity.com/profiles/${steamID}`)
    .setThumbnail("https://imgur.com/TsngBuj.png")
    .addFields(
      { name: "Reason", value: reason, inline: true },
      { name: "Expires", value: readableDate, inline: true },
      { name: "Server", value: serverName }
    )
    .setTimestamp()
    .setFooter({ text: "Trust Your Skill", iconURL: "https://imgur.com/TsngBuj.png" });
}

module.exports = createPublicEmbed;
