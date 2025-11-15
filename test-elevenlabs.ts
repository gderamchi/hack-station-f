/**
 * Test script for ElevenLabs integration
 * Run with: npx tsx test-elevenlabs.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { generateConversationAudio, generateOpeningMessage } from './src/lib/voice/generate-audio';

async function testElevenLabs() {
  console.log('🎤 Testing ElevenLabs Integration...\n');

  try {
    // Test 1: Generate simple audio
    console.log('Test 1: Generating simple conversation audio...');
    const simpleAudio = await generateConversationAudio(
      'Hello, this is a test of the ElevenLabs voice synthesis system.',
      '21m00Tcm4TlvDq8ikWAM' // Rachel voice
    );
    console.log('✅ Simple audio generated successfully!');
    console.log(`   URL: ${simpleAudio.audioUrl}`);
    console.log(`   Path: ${simpleAudio.audioPath}`);
    console.log(`   Duration: ${simpleAudio.duration}s\n`);

    // Test 2: Generate opening message
    console.log('Test 2: Generating personalized opening message...');
    const openingAudio = await generateOpeningMessage(
      'John',
      'TechFlow Solutions',
      'we help companies automate their sales processes with AI-powered voice calls',
      '21m00Tcm4TlvDq8ikWAM'
    );
    console.log('✅ Opening message generated successfully!');
    console.log(`   URL: ${openingAudio.audioUrl}`);
    console.log(`   Path: ${openingAudio.audioPath}`);
    console.log(`   Duration: ${openingAudio.duration}s\n`);

    // Test 3: Generate longer response
    console.log('Test 3: Generating AI response audio...');
    const aiResponse = await generateConversationAudio(
      'That sounds interesting! I would love to learn more about how your solution can help my business. Can you tell me more about the pricing?',
      '21m00Tcm4TlvDq8ikWAM'
    );
    console.log('✅ AI response audio generated successfully!');
    console.log(`   URL: ${aiResponse.audioUrl}`);
    console.log(`   Path: ${aiResponse.audioPath}`);
    console.log(`   Duration: ${aiResponse.duration}s\n`);

    console.log('🎉 All tests passed! ElevenLabs integration is working correctly.\n');
    console.log('📝 Next steps:');
    console.log('   1. Make sure ngrok is running to expose your local server');
    console.log('   2. Update Twilio webhook URL to point to your ngrok URL');
    console.log('   3. Test a real call to verify audio playback');
    console.log('   4. Audio files are saved in: public/audio/');
    console.log('   5. Audio files will be automatically cleaned up after 1 hour\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testElevenLabs();
