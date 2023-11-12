const { EmbedBuilder } = require("discord.js");

function createPrivateEmbed(player, playerBMID, ban, uid, note, orgWide, reason, readableDate, serverName) {
  return new EmbedBuilder()
    .setColor("#0099cc")
    .setTitle(`${player} was Banned (Private Log)`)
    .setURL(`https://www.battlemetrics.com/rcon/players/${playerBMID}`)
    .setThumbnail("https://imgur.com/TsngBuj.png")
    .addFields(
      { name: "UID", value: uid, inline: true },
      {
        name: "Actions",
        value: `[Edit ban](https://www.battlemetrics.com/rcon/bans/edit/${ban.id})`,
        inline: true,
      },
      { name: "\u200b", value: "\u200b", inline: true },

      { name: "Reason", value: reason, inline: true },
      { name: "Expires", value: readableDate, inline: true },
      { name: "\u200b", value: "\u200b", inline: true },

      { name: "Server", value: serverName, inline: true },
      { name: "Org Wide", value: orgWide ? "Yes" : "No", inline: true },
      { name: "\u200b", value: "\u200b", inline: true },

      { name: "Note", value: `\`\`\`${note}\`\`\``, inline: false }
    )
    .setTimestamp()
    .setFooter({ text: "Trust Your Skill", iconURL: "https://imgur.com/TsngBuj.png" });
}

module.exports = createPrivateEmbed;
