#!/bin/bash

# Test AI Call System
# This script tests the complete ElevenLabs + Twilio integration

echo "🎤 Testing AI Call System"
echo "=========================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    exit 1
fi

# Check if ElevenLabs API key is set
if ! grep -q "ELEVENLABS_API_KEY" .env; then
    echo "❌ Error: ELEVENLABS_API_KEY not found in .env"
    exit 1
fi

echo "✅ Environment configured"
echo ""

# Test ElevenLabs integration
echo "📝 Step 1: Testing ElevenLabs integration..."
npx tsx test-elevenlabs.ts

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ElevenLabs integration test passed!"
    echo ""
else
    echo ""
    echo "❌ ElevenLabs integration test failed!"
    exit 1
fi

# Check audio files
echo "📁 Step 2: Checking generated audio files..."
AUDIO_COUNT=$(ls -1 public/audio/*.mp3 2>/dev/null | wc -l)
echo "   Found $AUDIO_COUNT audio files"

if [ $AUDIO_COUNT -gt 0 ]; then
    echo "   Latest files:"
    ls -lht public/audio/*.mp3 | head -3
    echo ""
    echo "✅ Audio files generated successfully!"
else
    echo "❌ No audio files found!"
    exit 1
fi

echo ""
echo "🎉 All tests passed!"
echo ""
echo "📝 Next steps:"
echo "   1. Start the dev server: npm run dev"
echo "   2. Start ngrok: ngrok http 3000"
echo "   3. Update Twilio webhook URL"
echo "   4. Make a test call"
echo ""
echo "📚 See ELEVENLABS_TWILIO_INTEGRATION.md for full documentation"
echo ""
