# 🚀 Render.com ga Deploy Qilish Qo'llanmasi

## 1-qadam: GitHub Repository yaratish

1. GitHub ga kiring: https://github.com
2. "New repository" tugmasini bosing
3. Repository nomi: `999-premium-tools`
4. "Create repository" bosing

## 2-qadam: Kodlarni GitHub ga yuklash

Terminal da:

```bash
cd "C:\Users\user\Desktop\999 Premium Tools"
git init
git add .
git commit -m "Initial commit with backend"
git branch -M main
git remote add origin https://github.com/SIZNING_USERNAME/999-premium-tools.git
git push -u origin main
```

## 3-qadam: Render.com da PostgreSQL yaratish

1. **Render.com** ga kiring: https://render.com (GitHub bilan)
2. Dashboard da **"New +"** tugmasini bosing
3. **"PostgreSQL"** ni tanlang
4. Settings:
   - **Name**: `premium-tools-db`
   - **Database**: `premium_tools`
   - **User**: `premium_tools_user`
   - **Region**: `Singapore` (yoki yaqin region)
   - **Plan**: **Free** ✅
5. **"Create Database"** tugmasini bosing
6. Database tayyor bo'lgach, **"Internal Database URL"** ni ko'chirib oling

## 4-qadam: Render.com da Web Service yaratish

1. Dashboard da **"New +"** → **"Web Service"**
2. **"Connect a repository"** → GitHub repository ni tanlang
3. Settings:
   - **Name**: `premium-tools-api`
   - **Region**: `Singapore` (database bilan bir xil)
   - **Branch**: `main`
   - **Root Directory**: (bo'sh qoldiring)
   - **Runtime**: `Python 3`
   - **Build Command**: 
     ```
     pip install -r backend/requirements.txt
     ```
   - **Start Command**:
     ```
     cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan**: **Free** ✅

4. **Environment Variables** qo'shing:
   - **Key**: `DATABASE_URL`
   - **Value**: (3-qadamda ko'chirilgan Internal Database URL)
   - **Key**: `TELEGRAM_BOT_TOKEN`
   - **Value**: BotFather bergan bot token
   - **Key**: `TELEGRAM_BOT_OWNER_IDS`
   - **Value**: bot yaratuvchisining Telegram chat ID si, masalan `123456789`
   - **Key**: `TELEGRAM_ADMIN_CHAT_IDS`
   - **Value**: buyurtma xabari boradigan admin chat ID lar, vergul bilan: `123456789,987654321`

5. **"Create Web Service"** tugmasini bosing

## 5-qadam: Deploy kutish

Render avtomatik deploy qiladi (3-5 daqiqa).

Deploy tugagach, sizga URL beriladi:
```
https://premium-tools-api.onrender.com
```

## 6-qadam: API ni test qilish

Brauzerda oching:
```
https://premium-tools-api.onrender.com/
```

Yoki API docs:
```
https://premium-tools-api.onrender.com/docs
```

## 7-qadam: Frontend ni backend bilan ulash

`.env` faylini yangilang:

```env
VITE_API_URL=https://premium-tools-api.onrender.com/api
```

## Telegram botni lokal ishga tushirish

Sayt -> backend -> Telegram bot zanjiri lokal ishlashi uchun uchta terminal oching:

1. Backend API:
```bash
npm run server
```

2. Telegram bot:
```bash
cd telegrambot
npm run dev
```

Yoki project rootdan:
```bash
npm run bot
```

3. Frontend site:
```bash
npm run dev
```

`.env` ichida lokal test uchun `VITE_API_URL=http://localhost:8000/api` bo'lishi kerak. Terminalda `Telegram bot polling started` chiqsa, Telegramda botga `/start` yuboring.

## 8-qadam: Frontend ni qayta build qilish

```bash
npm run build
copy dist\index.html dist\200.html
npx surge dist 999premiumtools.surge.sh
```

## ✅ Tayyor!

Endi **999premiumtools.surge.sh** saytingiz backend bilan ishlaydi!

Kimdir ro'yxatdan o'tsa, ma'lumotlar PostgreSQL database ga saqlanadi va siz Admin Panel da ko'rasiz! 🎉

---

## 🔧 Muammolar

### Database connection error

Agar "Database connection failed" xatosi chiqsa:

1. Render.com da Web Service → Environment → `DATABASE_URL` ni tekshiring
2. PostgreSQL database ishlab turishini tekshiring

### CORS error

Agar brauzerda CORS xatosi chiqsa:

`backend/main.py` da `allow_origins` ni yangilang:

```python
allow_origins=["https://999premiumtools.surge.sh"],
```

---

## 📊 Monitoring

Render.com Dashboard da:
- **Logs** - Backend loglarini ko'rish
- **Metrics** - CPU, Memory ishlatilishi
- **Events** - Deploy tarixi

---

## 💰 Narx

**100% BEPUL!** ✅

- PostgreSQL: 1GB storage (bepul)
- Web Service: 750 soat/oy (bepul)

Agar sayt 15 daqiqa ishlatilmasa, "sleep" rejimiga o'tadi. Birinchi request 30 soniya kutadi, keyin tez ishlaydi.
