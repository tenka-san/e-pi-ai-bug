const {
  default: makeWASocket,
  prepareWAMessageMedia,
  removeAuthState,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  generateWAMessageFromContent,
  generateWAMessageContent,
  generateWAMessage,
  jidDecode,
  proto,
  delay,
  relayWAMessage,
  getContentType,
  generateMessageTag,
  getAggregateVotesInPollMessage,
  downloadContentFromMessage,
  fetchLatestWaWebVersion,
  InteractiveMessage,
  makeCacheableSignalKeyStore,
  Browsers,
  generateForwardMessageContent,
  MessageRetryMap
} = require("@whiskeysockets/baileys");
const axios = require('axios');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const Boom = require('@hapi/boom');
const express = require('express');
const cors = require('cors');
const pino = require('pino');
const crypto = require('crypto');

const question = (input) => {
  const zep = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(input, resolve)
  });
}
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;
const app = express();
const connection = false;

app.use(cors());
app.use(express.json());

async function connecBotToWhatsapp() {
  const { state, saveCreds } = useMultiFileAuthState("./sessions");
  const Zeppeli = makeWASocket({
    printQRInTerminal: false,
    auth: state,
    markOnlineOnSocket: true,
    browser: ["Mac Os", "Chrome", "14.4.1"],
    logger: pino({
      level: "silent",
      stream: "store"
    })
  });
  
  if(Zeppeli.authState.creds.registered) {
    const nomorBot = await question("Masukan nomor anda\nContoh : 6287250208");
    const codePairing = await Zeppeli.requestPairingCode(nomorBot, "DZEPPELI");
  }
  
  Zeppeli.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      connection = false;
      let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
      if (reason === DisconnectReason.badSession) {
        console.log(`bad session file, please delete session and scan again`);
        process.exit();
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log("connection closed, reconnecting....");
        connecBotToWhatsapp();
      } else if (reason === DisconnectReason.connectionLost) {
        console.log("connection lost from server, reconnecting...");
        connecBotToWhatsapp();
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log("connection replaced, another new session opened, please restart bot");
        process.exit();
      } else if (reason === DisconnectReason.loggedOut) {
        console.log(`device loggedout, please delete folder session and scan again.`);
        process.exit();
      } else if (reason === DisconnectReason.restartRequired) {
        console.log("restart required, restarting...");
        connecBotToWhatsapp();
      } else if (reason === DisconnectReason.timedOut) {
        console.log("connection timedout, reconnecting...");
        connecBotToWhatsapp();
      } else {
        console.log(`unknown disconnectReason: ${reason}|${connection}`);
        connecBotToWhatsapp();
      }
    } else if (connection === "open") {
      connection = true;
      const resp = await fetch("https://api.ipify.org?format=json");
      const hasil = resp.json;
      const ip = hasil.ip;
      console.log(`Zeppeli-API's has been started in http://${ip}:${PORT}`);
    }
  });
  Zeppeli.ev.on("creds.update", saveCreds);
}
// Functions place
async function pvBug(target) {
  await Zeppeli.sendMessage(target, {
    text: "D | 7eppeli-Exploration"
  })
}

async function gbBug(target) {
  await Zeppeli.sendMessage(target, {
    text: "D | 7eppeli-Exploration"
  })
}

async function chBug(target) {
  await Zeppeli.sendMessage(target, {
    text: "D | 7eppeli-Exploration"
  })
}
// End
app.get("/", async(res) => {
  res.sendFile(path.join(__dirname, "index.html"));
})

app.get("/bug", async(req, res) => {
  const { type, target } = req.query;
  if(!type || !target) {
    res.json({
      "status": false,
      "message": "Masukan type dan targetnya!!!"
    })
  };
  
  if(type === "fc") {
    await Zaza(target) // pakai @s.whatsapp.net
  } else if(type === "group") {
    const link = /https?:\/\/chat\.whatsapp\.com\/([A-Za-z0-9 -]{22})/;
    const match = target.match(link);
    if(match) {
      await gbBug(target) // pakai link
    } else if(type === "bugCh") {
      await chBug(target) // pakai @newsletter
    }
  }
})

app.listen(PORT);
connecBotToWhatsapp();
