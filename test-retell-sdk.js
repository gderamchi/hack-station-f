/**
 * Test script for Retell AI integration using official SDK
 * Run with: node test-retell-sdk.js
 */

require('dotenv').config();
const Retell = require('retell-sdk').default;

const RETELL_API_KEY = process.env.RETELL_API_KEY;

async function testRetellSDK() {
  console.log('🧪 Testing Retell AI with Official SDK...\n');
  
  if (!RETELL_API_KEY) {
    console.error('❌ RETELL_API_KEY not found in .env file');
    process.exit(1);
  }
  
  console.log('✅ API Key found:', RETELL_API_KEY.substring(0, 10) + '...');
  
  try {
    // Initialize Retell client
    const client = new Retell({
      apiKey: RETELL_API_KEY,
    });
    
    console.log('✅ Retell client initialized');
    
    // Test 1: Create a Retell LLM
    console.log('\n🧠 Test 1: Creating Retell LLM...');
    const llm = await client.llm.create({
      model: 'gpt-4o-mini',
      model_temperature: 0.7,
      start_speaker: 'agent',
      begin_message: 'Hello! This is a test call from Mirai. How are you today?',
      general_prompt: 'You are a friendly sales representative calling on behalf of a company. Keep responses under 40 words. Be professional, helpful, and conversational. If the prospect is not interested, politely end the call.',
      general_tools: [
        {
          type: 'end_call',
          name: 'end_call',
          description: 'End the call when the conversation is complete or if the prospect is not interested.',
        },
      ],
    });
    
    console.log('✅ LLM created successfully!');
    console.log('🆔 LLM ID:', llm.llm_id);
    
    // Test 2: Create an agent with the LLM
    console.log('\n🤖 Test 2: Creating agent with LLM...');
    const agent = await client.agent.create({
      agent_name: 'Mirai Test Agent',
      voice_id: '21m00Tcm4TlvDq8ikWAM', // Rachel - ElevenLabs
      response_engine: {
        type: 'retell-llm',
        llm_id: llm.llm_id,
      },
      language: 'en-US',
      responsiveness: 1,
      interruption_sensitivity: 0.8,
      enable_backchannel: true,
      backchannel_frequency: 0.8,
    });
    
    console.log('✅ Agent created successfully!');
    console.log('🆔 Agent ID:', agent.agent_id);
    console.log('📝 Agent Name:', agent.agent_name);
    
    console.log('\n🎉 All tests passed! Retell AI is ready to use.');
    console.log('\n📋 Summary:');
    console.log('   - API Key: Valid ✅');
    console.log('   - SDK Connection: Working ✅');
    console.log('   - LLM Creation: Working ✅');
    console.log('   - Agent Creation: Working ✅');
    console.log('\n💡 You can now make real AI phone calls through the Mirai setup flow!');
    console.log('\n📞 To make a test call, you need:');
    console.log('   1. A Retell phone number (purchase from dashboard)');
    console.log('   2. Or use your Twilio number with Retell');
    console.log('   3. Then call: client.call.createPhoneCall({ ... })');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Check if your API key is correct');
    console.error('   2. Verify you have internet connection');
    console.error('   3. Check Retell AI dashboard: https://app.retellai.com');
    process.exit(1);
  }
}

testRetellSDK();
