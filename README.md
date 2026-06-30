# 🎬 Anime Bot - Mini Web App

Telegram Mini Web App for anime catalog with interactive interface.

## 🚀 Deploy to Vercel

1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Deploy (no configuration needed)
6. Copy the deployment URL (e.g., `https://your-app.vercel.app`)

## 🔧 Configuration

After deploying to Vercel:

1. Get your Vercel URL: `https://your-app.vercel.app`
2. Update `app.js` line 19:
   ```javascript
   const API_URL = 'https://your-railway-bot-url.up.railway.app';
   ```
3. In Telegram @BotFather:
   - Send: `/setmenubutton`
   - Select your bot
   - Send button name: `🎬 Anime Katalog`
   - Send Web App URL: `https://your-app.vercel.app`

## 📱 Features

- Interactive anime catalog
- Real-time search
- Genre and year filters
- Episode selector
- Profile page
- Telegram theme integration
- Responsive design

## 🛠️ Tech Stack

- HTML5
- CSS3 (with CSS Variables)
- Vanilla JavaScript
- Telegram WebApp API

## 📦 Files

- `index.html` - Main HTML structure
- `style.css` - Styles and animations
- `app.js` - JavaScript logic and API calls
- `vercel.json` - Vercel deployment config

## 🔗 API Integration

The Mini Web App connects to your Railway bot backend:

- `GET /api/animes` - Get all animes
- `GET /api/episodes/{anime_id}` - Get anime episodes
- `GET /api/profile?user_id={id}` - Get user profile
- `POST` data via Telegram WebApp API - Send episode selection to bot

## 🎨 Customization

### Change Colors:

Edit `style.css` lines 4-15 (CSS Variables):
```css
:root {
    --primary-color: #2481cc;
    --secondary-color: #6c5ce7;
    /* ... */
}
```

### Change API URL:

Edit `app.js` line 19:
```javascript
const API_URL = 'https://your-bot-backend.com';
```

## ✅ Vercel vs Railway Integration

### Why Separate?

✅ **Vercel** - Best for static sites (HTML/CSS/JS)
- Fast CDN
- Free tier
- Auto SSL
- Global edge network

✅ **Railway** - Best for bot backend (Python)
- Database
- Bot logic
- API endpoints
- Background jobs

### How They Work Together:

```
User → Telegram → Vercel (Mini Web App HTML/CSS/JS)
                     ↓
                  API calls
                     ↓
               Railway (Bot Backend)
                     ↓
                  Database
```

**Result:** Best of both worlds! Fast frontend + Powerful backend

## 📝 Environment Setup

No environment variables needed for Vercel deployment!

Just update the `API_URL` in `app.js` after deploying.

## 🚀 Quick Start

```bash
# 1. Initialize git
git init
git add .
git commit -m "Initial commit - Mini Web App"

# 2. Create GitHub repository and push
git remote add origin https://github.com/yourusername/hoshi-webapp.git
git branch -M main
git push -u origin main

# 3. Deploy on Vercel
# - Go to vercel.com
# - Import GitHub repo
# - Deploy
# - Copy URL

# 4. Update API_URL in app.js
# Edit app.js line 19 with your Railway URL

# 5. Configure in BotFather
# /setmenubutton → Bot → Name → Vercel URL
```

## 📄 License

MIT License

---

Made with ❤️ for anime fans
