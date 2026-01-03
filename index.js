// Telegram + Instagram Monitor Bot
// Simple version – no login required

const axios = require("axios");

const TELEGRAM_BOT_TOKEN = "BURAYA_BOT_TOKEN";
const TELEGRAM_CHAT_ID = "BURAYA_CHAT_ID";

const accounts = [
  "instagram",
  "google",
  "meta"
];

async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await axios.post(url, {
    chat_id: TELEGRAM_CHAT_ID,
    text: text
  });
}

async function checkAccounts() {
  for (const username of accounts) {
    try {
      const res = await axios.get(`https://www.instagram.com/${username}/?__a=1`);
      if (res.status === 200) {
        await sendTelegramMessage(`✅ ${username} aktif`);
      }
    } catch (e) {
      await sendTelegramMessage(`⚠️ ${username} erişilemiyor`);
    }
  }
}

checkAccounts();
