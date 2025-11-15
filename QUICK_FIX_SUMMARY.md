# QUICK FIX SUMMARY

## THE PROBLEM
Setup API was failing with error:
```
Error: 400 Invalid model name passed in model=gpt-4o
```

## THE SOLUTION
Changed all model names to use correct Blackbox API format:

### Changes Made:
1. **Script Generation:** `gpt-4o` → `blackboxai/openai/gpt-4o-mini`
2. **Lead Finding:** `llama-3.1-sonar-large-128k-online` → `sonar-reasoning-pro`

### Files Modified:
- `/src/lib/ai/openai-client.ts` (1 change)
- `/src/app/api/setup/complete/route.ts` (1 change)
- `/src/lib/ai/lead-finder.ts` (2 changes)

## TEST NOW
1. Restart server: `npm run dev`
2. Go to: http://localhost:3000/dashboard/setup
3. Fill form and check "Call me now"
4. You should receive a call!

## STATUS: ✅ READY TO TEST
