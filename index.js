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
} =   require("@whiskeysockets/baileys");
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
    await pvBug(target) // pakai @s.whatsapp.net
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

app.get("/toFigure", async(req, res) => {
  const { url } = req.query;
  if(!url) return res.json({
    "status": false,
    "message": "Format tidak valid"
  })
  
  async function generateImage(imgUrl) {
    let uploadedImageUrl = imgUrl;
  
    if (!imgUrl.startsWith('http')) {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(imgUrl));
    
      const uploadResponse = await axios.post('https://vondyapi-proxy.com/files/', formData, {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
          ...formData.getHeaders()
        }
      });
    
      uploadedImageUrl = uploadResponse.data.fileUrl || uploadResponse.data.data?.fileUrl;
    }

    const conversationData = {
      messages: [
        {
          sender: "user",
          name: "You",
          message: `Create a commercialized figure of the character in the illustration, in a realistic style and environment. Place the figure on a computer desk, using a circular transparent acrylic base without any text. On the computer screen, display the ZBrush modeling process of the figure. Next to the computer screen, place a BANDAI-style toy packaging box printed with the original artwork. @@hidden {} Reference images for "inputImageUrl": [Image 1]: ${uploadedImageUrl} @@hidden`,
          files: [
            {
              type: "image_url",
              image_url: {
                url: uploadedImageUrl
              }
            }
          ],
          image: null,
          type: 1
        }
      ]
    };

    const conversationResponse = await axios.post('https://vondyapi-proxy.com/bot/4d2da86f-d279-4425-8446-851f935c40f1/conversations/', conversationData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://www.vondy.com/ai-photo-generator-image-to-image--oev9VhNA?lc=5'
      }
    });

    const conversationId = conversationResponse.data.data?.id;

    const imageGenerationData = {
      model: "text-davinci-003",
      maxTokens: 3000,
      input: "mBn00gqQNYCVaFrtprf04Y41pGZ2xoR2oBI1r+h5LLmXGdv/xRCALmS3H6DBCdP1VsTpfXngY1BQhsfTq6rUna30E7uleY6aSbfNRc292LiCq1Q522sh0C0//DshIynJhCWTkEYKWhgyhtKQdPmPbUxC92bAfU4Royr6aaipcL+nTqie3cdscS7f2uBiHO53YxKFKhUb4Q8FNarEJLrUHIFQ+4GeslATgD/NZFak9OC3Vbnl/r09knYHInkAjeGx2uX/5qD0c6P0whSDS/ZVUqjWOiw6pEbsyQORkSe0ccfYmJlTXiE627PQx5d3+xFiL7PPOEG8uQ1ywtfBHghPV+TcxsmoMLdUmmymqGo0+FoIuv5PAUeQwqgaRYMYpaj0y2RTstl9kgnJlhnFCe08dXKLr8hDThSinEoNDFgyt5RJ8nlqWunowtfQ/UNWke8vZ0lq7BS6vZh16llBiDUMkfSs8Gom9i3X/LF1ZPrznysfZxO0+PMxRdv8YSvvKLjFhjlXCMzvn3Hjobpynk5RTbc2Um1q+ypGzeLPVIsKSis+BKLwvZpLXF9OdMiyeejU1N9aKHrP+j0gq4s283/7zMvhdTAS/HGuLZNfQRJ3Hp9q1WZWazch++EoMEJ4lovTfugNMP/G9XeYsJ8QtX1Fl2u7Z46F0Favilxgii9cu9M=",
      temperature: 0.5,
      e: true,
      summarizeInput: true,
      inHTML: false,
      size: "1024x1024",
      numImages: 1,
      useCredits: false,
      titan: false,
      quality: "standard",
      embedToken: null,
      edit: "Create a commercialized figure of the character in the illustration, in a realistic style and environment. Place the figure on a computer desk, using a circular transparent acrylic base without any text. On the computer screen, display the ZBrush modeling process of the figure. Next to the computer screen, place a BANDAI-style toy packaging box printed with the original artwork.",
      inputImageUrl: uploadedImageUrl,
      seed: Math.floor(Math.random() * 1000000),
      similarityStrength: 0.8084920830340128,
      flux: true,
      pro: false,
      face: false,
      useGPT: false
    };

    const imageResponse = await axios.post('https://vondyapi-proxy.com/images/', imageGenerationData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36'
      }
    });

    const generatedImageUrl = imageResponse.data.data?.[0] || imageResponse.data;

    const updateData = {
      messages: [
        {
          sender: "user",
          name: "You",
          message: `Create a commercialized figure of the character in the illustration, in a realistic style and environment. Place the figure on a computer desk, using a circular transparent acrylic base without any text. On the computer screen, display the ZBrush modeling process of the figure. Next to the computer screen, place a BANDAI-style toy packaging box printed with the original artwork. @@hidden {} Reference images for "inputImageUrl": [Image 1]: ${uploadedImageUrl} @@hidden`,
          files: [
            {
              type: "image_url",
              image_url: {
                url: uploadedImageUrl
              }
            }
          ],
          image: null,
          type: 1
        },
      {
        sender: "bot",
        name: "Ai Photo Generator Image To Image",
        message: `@@ImgGen { 
          "quality":"standard", 
          "edit":"Create a commercialized figure of the character in the illustration, in a realistic style and environment. Place the figure on a computer desk, using a circular transparent acrylic base without any text. On the computer screen, display the ZBrush modeling process of the figure. Next to the computer screen, place a BANDAI-style toy packaging box printed with the original artwork.", 
          "inputImageUrl": "${uploadedImageUrl}" 
        },
        A commercialized figure based on the reference image, displayed on a computer desk with a circular transparent acrylic base. The computer screen shows the ZBrush modeling process of the figure. Next to the screen is a BANDAI-style toy packaging box featuring the original artwork. The overall style is realistic with detailed rendering of the figure and environment.
@@ImgGen`,
          type: 1,
          title: "Ai Photo Generator Image To Image"
        }
      ]
    };

    await axios.put(`https://vondyapi-proxy.com/bot/conversations/${conversationId}/`, updateData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36'
      }
    });

    return {
      generatedImageUrl: generatedImageUrl,
      uploadedImageUrl: uploadedImageUrl,
      conversationId: conversationId,
      message: 'Image generated successfully'
    };
  }
  if(!url.startsWith("https://")) return res.json({
    "status": false,
    "message": "Only url kink"
  })
  const res = await generateImage(url);
  try {
    res.json({
      "status": true,
      "message": "Selesai mengunggah",
      "result": res
    })
  }
})

app.listen(PORT);
connecBotToWhatsapp();
