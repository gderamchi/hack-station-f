# 🚀 Retell AI - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Purchase Phone Number (Required)

1. Go to: https://dashboard.retellai.com
2. Click **"Phone Numbers"** → **"Buy New Number"**
3. Select area code (optional)
4. Complete purchase (~$1-2/month)

### Step 2: Update Environment Variable

```bash
# Add to .env file
RETELL_PHONE_NUMBER="+1234567890"  # Your purchased number
```

### Step 3: Test the Integration

```bash
# Run test script
node test-retell-sdk.js
```

**Expected Output:**
```
✅ LLM created successfully!
✅ Agent created successfully!
```

### Step 4: Make Your First Call

1. Go to: http://localhost:3000/setup
2. Fill in company details
3. Enter YOUR phone number as test prospect
4. Check "Call Now"
5. Submit

**You should receive a call from your AI agent within seconds!**

---

## 🎯 What Happens

```
Setup Form → Retell AI → AI Agent → Phone Call → Your Phone Rings
```

1. **Company Profile** → Converted to AI instructions
2. **Retell LLM** → Created with custom prompt
3. **AI Agent** → Created with voice (Rachel)
4. **Phone Call** → Initiated to prospect
5. **Conversation** → AI speaks naturally, responds to questions

---

## 📊 Monitor Calls

### In Retell Dashboard
- https://dashboard.retellai.com/calls
- See all calls, transcripts, recordings
- Monitor performance and quality

### In Mirai Database
- All calls tracked in `calls` table
- Includes `retellCallId` and `retellAgentId`
- Status updates in real-time

---

## 🔧 Customize Agent

Edit `/src/lib/retell/retell-client.ts`:

```typescript
// Change voice
voice_id: '21m00Tcm4TlvDq8ikWAM',  // Rachel (default)
// Other options:
// 'AZnzlk1XvdvUeBnXmlld' - Domi
// 'EXAVITQu4vr4xnSDxMaL' - Bella
// 'ErXwobaYiN019PkySvjV' - Antoni (male)

// Adjust responsiveness
responsiveness: 1,  // 0-1 (higher = faster)

// Adjust interruption sensitivity
interruption_sensitivity: 0.8,  // 0-1 (higher = easier to interrupt)
```

---

## 💡 Tips

1. **Test with your own number first** - Verify quality before calling prospects
2. **Monitor first few calls** - Check Retell dashboard for issues
3. **Adjust prompts** - Improve agent instructions based on performance
4. **Use fallback** - Twilio automatically used if Retell fails

---

## 🐛 Common Issues

### "Agent creation failed: 404"
→ **Purchase phone number first**

### "Call not initiated"
→ **Check phone number format: +1234567890**

### "No response from agent"
→ **Check Retell dashboard for errors**

---

## 📞 Support

- **Retell Dashboard**: https://dashboard.retellai.com
- **Retell Docs**: https://docs.retellai.com
- **Email**: support@retellai.com

---

## ✅ Checklist

- [ ] Phone number purchased
- [ ] `.env` updated with phone number
- [ ] Test script runs successfully
- [ ] Made test call to own number
- [ ] Agent sounds natural
- [ ] Call tracked in database

**Once all checked, you're ready to call real prospects!**
