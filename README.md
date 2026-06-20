# 🌤️ Weather Bot

Cloudflare Workers + Telegram Bot + Open-Meteo Weather API

Get daily weather alerts automatically or check weather on-demand with a simple command.

---

## ✨ Features

- 📍 **Real-time Weather Updates** - Current temperature, humidity, wind speed
- 📅 **5-Day Forecast** - Plan ahead with 5-day weather predictions
- 🔔 **Daily Auto-Alerts** - Get weather notifications every day at 11 PM UTC
- ⚡ **Instant Commands** - Ask for weather anytime with `/weather` command
- 💰 **Completely Free** - Cloudflare Workers free tier + Open-Meteo API
- 🚀 **Serverless** - No server to maintain, scales automatically

---

## 🛠️ Tech Stack

- **Serverless Compute:** Cloudflare Workers
- **Chat Platform:** Telegram Bot API
- **Weather Data:** Open-Meteo API (free, no key required)
- **Language:** JavaScript
- **Configuration:** Wrangler CLI

---

## 📋 Prerequisites

Before you start, make sure you have:

- [Node.js](https://nodejs.org/) (v16+)
- [npm](https://www.npmjs.com/) or yarn
- Cloudflare account (https://dash.cloudflare.com)
- Telegram account
- Git (optional, for GitHub)

---

## 🚀 Quick Start

### Phase 1: Telegram Bot Setup (5 minutes)

#### 1.1 Create Telegram Bot

1. Open Telegram app
2. Search for `@BotFather`
3. Send `/newbot` command
4. Follow the prompts:
   - Bot name: `WeatherBot`
   - Bot username: `weather_bot` (or your choice)
5. **Save the token** (looks like: `123456789:ABCdefGHIjklMNOpqrSTUvwxyzABCD`)

```
BOT_TOKEN = 123456789:ABCdefGHIjklMNOpqrSTUvwxyzABCD
```

#### 1.2 Get Your Telegram User ID

1. Search for `@userinfobot` on Telegram
2. Send `/start`
3. **Save your User ID** (looks like: `123456789`)

```
CHAT_ID = 123456789
```

---

### Phase 2: Connect Telegram Webhook (3 minutes)

**Set webhook to your Cloudflare Worker:**

```bash
BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrSTUvwxyzABCD"
WORKER_URL="https://weather-bot.YOUR_ACCOUNT.workers.dev"

curl "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -F "url=${WORKER_URL}/webhook"
```

**Expected response:**
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

**Verify webhook:**
```bash
curl "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo"
```

---

### Phase 6: Set Bot Commands (2 minutes)

**Set command list via BotFather or API:**

1. Message `@BotFather` on Telegram
2. Send `/setcommands`
3. Choose your bot
4. Send:
   ```
   start - Start the bot
   weather - Get current weather
   forecast - 5-day forecast
   ```
```

---

## 📱 Usage

### Send Commands to Your Bot

1. **Find your bot** on Telegram (search `@weather_bot_w133045` or your bot name)
2. **Send commands:**

   ```
   /start       # View help and GitHub link
   /weather     # Get current weather
   /forecast    # Get 5-day forecast
   ```

### Automatic Daily Alert

- **Time:** 11 PM UTC every day
- **Location:** Configured in `wrangler.toml` (default: Kuala Lumpur)
- **No action needed** - happens automatically!

### Change Alert Time or Location

**Edit `wrangler.toml`:**

```toml
[vars]
LOCATION = "Kuala Lumpur"           # Change your city

[[triggers.crons]]
cron = "0 8 * * *"            # Change to 8 AM UTC
```

**Redeploy:**
```bash
npx wrangler deploy
```

---

## 🐛 Troubleshooting

### Bot doesn't respond to commands

1. **Check secrets are set:**
   ```bash
   npx wrangler secret list
   ```

2. **Check webhook is set:**
   ```bash
   curl "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo"
   ```

3. **View logs:**
   ```bash
   npx wrangler tail
   ```

### Wrong location showing

- Edit `LOCATION` in `wrangler.toml`
- Redeploy: `npx wrangler deploy`

### Alert time is wrong

- Change `cron` value in `wrangler.toml`
- Format: `HH MM * * *` (UTC)
  - `0 8 * * *` = 8 AM UTC
  - `0 23 * * *` = 11 PM UTC

### Webhook deleted by mistake

```bash
BOT_TOKEN="YOUR_TOKEN"
WORKER_URL="YOUR_WORKER_URL"

curl "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -F "url=${WORKER_URL}/webhook"
```

---

## 📊 Project Structure

```
weather-bot/
├── src/
│   └── index.js              # Main worker code
├── wrangler.toml             # Cloudflare config
├── package.json              # Dependencies
├── README.md                 # This file
└── .gitignore               # Git ignore (optional)
```

---

## 💰 Cost

| Service | Cost |
|---------|------|
| Cloudflare Workers | FREE (100K requests/day) |
| Open-Meteo API | FREE (unlimited) |
| Telegram Bot | FREE |
| **Total Monthly Cost** | **$0** ✅ |

---

## 🔗 Links

- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **Telegram BotFather:** @BotFather
- **Open-Meteo API:** https://open-meteo.com
- **Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler

---

## 📄 License

MIT License - feel free to use and modify!

---

## 🤝 Contributing

Found a bug? Have suggestions? Feel free to:

1. Create an issue
2. Fork and submit a pull request
3. Share feedback

---

## 👨‍💻 Author

Created with ❤️ using Cloudflare Workers

GitHub: https://github.com/ChunKit99/weather-bot

---

## 📝 Notes

- Daily alerts are sent in UTC timezone
- Weather data updates every hour
- No database or storage - fully serverless
- Telegram webhook receives updates in real-time

---

**Enjoy your weather bot! 🌤️**
```