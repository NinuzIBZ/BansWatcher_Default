const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const axios = require("axios");
const fs = require("fs");
const config = require("./config.json");

const createPublicEmbed = require("./publicEmbed.js");
const createPrivateEmbed = require("./privateEmbed.js");

const MAX_STORED_BAN_IDS = 1000;
let lastBanIdData = fs.existsSync("lastBanId.json")
  ? JSON.parse(fs.readFileSync("lastBanId.json", "utf-8"))
  : { lastBanIds: [] };

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  setInterval(checkBans, 30000);
});

async function checkBans() {
  console.log("Checking for bans...");

  try {
    const response = await axios.get(
      `https://api.battlemetrics.com/bans?filter[organization]=${config.ORG_ID}&sort=-timestamp&include=server`,
      {
        headers: {
          Authorization: `Bearer ${config.BEARER_TOKEN}`,
        },
      }
    );

    const bans = response.data.data;

    let newBansFound = false;
    let newBanIds = [];

    if (bans && bans.length > 0) {
      for (const ban of bans) {
        console.log(`Current Ban ID from API: ${ban.id}`); // Debug
        if (lastBanIdData.lastBanIds.includes(ban.id)) {
          continue;
        }

        const playerBMID = ban.relationships.player.data.id;
        const reason = ban.attributes.reason.split("|")[0].trim();
        const expires = ban.attributes.expires ? ban.attributes.expires : "Permanent";
        const steamID = ban.attributes.identifiers.find((id) => id.type === "steamID").identifier;
        const player = ban.meta.player;

        const serverInfo = config.SERVERS.find(
          (server) => server.serverID === (ban.relationships.server?.data?.id || null)
        );
        const serverName = serverInfo ? serverInfo.Name : "Unknown Server";

        let readableDate;
        if (expires !== "Permanent") {
          const date = new Date(expires);
          const timestamp = Math.floor(date.getTime() / 1000);
          readableDate = `<t:${timestamp}:R> (<t:${timestamp}:D>)`;
        } else {
          readableDate = "Never";
        }

        newBansFound = true;
        newBanIds.push(ban.id);
        console.log("New ban detected. Sending message...");

        // Public embed
        const publicChannel = client.channels.cache.get(config.PUBLIC_CHANNEL_ID);
        const embed = createPublicEmbed(player, steamID, reason, readableDate, serverName);
        publicChannel.send({ embeds: [embed] });

        // Private embed
        const privateChannel = client.channels.cache.get(config.PRIVATE_CHANNEL_ID);
        const uid = ban.attributes.uid;
        const note = ban.attributes.note || "No note provided";
        const orgWide = ban.attributes.orgWide;

        const privateEmbed = createPrivateEmbed(
          player,
          playerBMID,
          ban,
          uid,
          note,
          orgWide,
          reason,
          readableDate,
          serverName
        );
        privateChannel.send({ embeds: [privateEmbed] });

        await delay(2000);
      }

      if (newBansFound) {
        lastBanIdData.lastBanIds = [...new Set([...lastBanIdData.lastBanIds, ...newBanIds])].slice(-MAX_STORED_BAN_IDS);
        fs.writeFile("lastBanId.json", JSON.stringify(lastBanIdData), (err) => {
          if (err) {
            console.error("Error writing to file:", err);
          } else {
            console.log("Last processed ban IDs saved to file successfully.");
          }
        });
      } else {
        console.log("No new bans detected since the last check.");
      }
    } else {
      console.log("No bans found.");
    }
  } catch (error) {
    console.error("Error fetching bans for the organization:", error);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

client.login(config.DISCORD_BOT_TOKEN);
