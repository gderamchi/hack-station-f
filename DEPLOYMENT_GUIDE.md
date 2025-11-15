# 🚀 MIRAI - Deployment Guide

## 📦 Deploy to Vercel (Recommended - 10 minutes)

### Step 1: Prepare for Deployment

```bash
cd /Users/guillaume_deramchi/Documents/hack-station-f

# Ensure all changes are committed
git add -A
git commit -m "feat: Complete Mirai AI call center implementation"
git push origin main
```

### Step 2: Deploy to Vercel

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Step 3: Configure Environment Variables in Vercel

Go to: https://vercel.com/your-project/settings/environment-variables

Add these variables:

```bash
# Database
DATABASE_URL=your-supabase-database-url

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-generate-with-openssl

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+15551234567

# ElevenLabs
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# Mistral
MISTRAL_API_KEY=your-mistral-api-key

# Blackbox AI
BLACKBOX_API_KEY=your-blackbox-api-key

# App URL (update after deployment)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

### Step 4: Update Twilio Webhooks

After deployment, update Twilio webhooks:

1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/active
2. Click on your phone number: +15705548338
3. Update webhooks:
   - **Voice URL**: `https://your-app.vercel.app/api/twilio/voice`
   - **Status Callback**: `https://your-app.vercel.app/api/twilio/status`

### Step 5: Test Production

1. Visit your Vercel URL
2. Register
3. Complete setup
4. **Phone will ring!** ✅

---

## 🔒 Security Checklist

### ✅ Secrets Protected:
- [x] `.env.local` in .gitignore
- [x] `.env` in .gitignore
- [x] `ngrok.log` in .gitignore
- [x] `.env.example` has placeholder values only
- [x] No API keys in code
- [x] All secrets in environment variables

### ✅ Production Ready:
- [x] Database migrations applied
- [x] Prisma client generated
- [x] All dependencies installed
- [x] Build succeeds
- [x] No hardcoded secrets

---

## 📝 Environment Variables Summary

### Required for Production:
```
DATABASE_URL          - Supabase PostgreSQL connection
NEXTAUTH_URL          - Your production URL
NEXTAUTH_SECRET       - Auth secret (keep secure!)
TWILIO_ACCOUNT_SID    - Twilio account
TWILIO_AUTH_TOKEN     - Twilio auth (keep secure!)
TWILIO_PHONE_NUMBER   - Your Twilio number
BLACKBOX_API_KEY      - Blackbox AI (keep secure!)
NEXT_PUBLIC_APP_URL   - Your production URL
```

### Optional:
```
ELEVENLABS_API_KEY    - For better voice quality
MISTRAL_API_KEY       - For advanced conversations
```

---

## 🎯 Current Setup (For Demo)

### Using ngrok (Development):
- **URL**: https://0f59dbac194f.ngrok-free.app
- **Status**: ✅ Active
- **Real Calls**: ✅ Working
- **Perfect for**: Hackathon demo

### For Production (After Hackathon):
- **Platform**: Vercel
- **URL**: https://mirai-ai.vercel.app (or custom domain)
- **Status**: Ready to deploy
- **Perfect for**: Real customers

---

## 🚀 Quick Deploy Commands

```bash
# Commit your code
git add -A
git commit -m "feat: Mirai AI call center ready for production"
git push

# Deploy to Vercel
vercel --prod

# Done! Your app is live
```

---

## 📊 What's Deployed

When you deploy, you get:
- ✅ Full Mirai application
- ✅ All 14 pages
- ✅ All 25+ API routes
- ✅ AI script generation
- ✅ AI lead finding
- ✅ Twilio integration
- ✅ Real-time calling
- ✅ Analytics dashboard
- ✅ Everything working!

---

## 🏆 YOU'RE READY!

**For Hackathon Demo**:
- Use ngrok URL: https://0f59dbac194f.ngrok-free.app
- Everything works!
- Real calls enabled!

**For Production**:
- Deploy to Vercel (10 min)
- Update environment variables
- Update Twilio webhooks
- Done!

---

**Current Status**: 🟢 DEMO READY
**Deployment**: ✅ READY TO PUSH
**Secrets**: ✅ SECURED

🎉 **GO WIN!** 🎉
