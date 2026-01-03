const axios = require("axios");
const fs = require("fs");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// TAKİP EDİLECEK HESAPLAR
const ACCOUNTS = [
  "instagram",
  "google",
  "meta"
];

const STATUS_FILE = "status.json";

// STATUS OKU
function readStatus() {
  if (!fs.existsSync(STATUS_FILE)) {
    return { opened: [], closed: [] };
  }
  return JSON.parse(fs.readFileSync(STATUS_FILE, "utf8"));
}

// STATUS YAZ
function writeStatus(data) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(data, null, 2));
}

// TELEGRAM MESAJ
async function sendTelegram(text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await axios.post(url, {
    chat_id: CHAT_ID,
    text
  });
}

// TEK HESAP KONTROL
async function checkAccount(username) {
  const status = readStatus();

  try {
    const res = await axios.get(
      `https://www.instagram.com/${username}/`,
      { validateStatus: () => true }
    );

    if (res.status === 200) {
      if (!status.opened.includes(username)) {
        status.opened.push(username);
        status.closed = status.closed.filter(u => u !== username);

        await sendTelegram(
          `✅ ACCOUNT RECOVERED\n\n@${username}\n⏱️ ${new Date().toLocaleString()}`
        );
      }
    } else {
      if (!status.closed.includes(username)) {
        status.closed.push(username);
      }
    }
  } catch (e) {
    if (!status.closed.includes(username)) {
      status.closed.push(username);
    }
  }

  writeStatus(status);
}

// TÜM HESAPLARI KONTROL
async function runMonitor() {
  for (const username of ACCOUNTS) {
    await checkAccount(username);
  }
}

// /totalunban KOMUTU
async function handleTotalCommand() {
  const status = readStatus();

  let message = `📊 DAILY UNBAN REPORT\n\n`;
  message += `✅ Opened (${status.opened.length}):\n`;

  status.opened.forEach(u => {
    message += `• @${u}\n`;
  });

  message += `\n❌ Still Closed (${status.closed.length}):\n`;

  status.closed.forEach(u => {
    message += `• @${u}\n`;
  });

  await sendTelegram(message);
}

// TELEGRAM KOMUT DİNLE
async function checkTelegramCommands() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`;
  const res = await axios.get(url);

  if (!res.data.result.length) return;

  const lastMessage = res.data.result.slice(-1)[0];
  const text = lastMessage.message?.text;

  if (text === "/totalunban") {
    await handleTotalCommand();
  }
}

// ÇALIŞTIR
(async () => {
  await runMonitor();
  await checkTelegramCommands();
})();
