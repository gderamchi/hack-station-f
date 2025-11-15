import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';
import { generateConversationAudio } from '@/lib/voice/generate-audio';

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const callSessionId = searchParams.get('callSessionId');

    if (!callSessionId) {
      return new NextResponse('Missing callSessionId', { status: 400 });
    }

    const formData = await req.formData();
    const speechResult = formData.get('SpeechResult') as string;

    // Get call session with company info
    const callSession = await prisma.call.findUnique({
      where: { id: callSessionId },
      include: {
        campaign: {
          include: {
            script: true,
            user: {
              include: {
                companies: true,
              },
            },
          },
        },
        prospect: true,
      },
    });

    if (!callSession) {
      return new NextResponse('Call session not found', { status: 404 });
    }

    // Get company information
    const company = callSession.campaign.user.companies[0];
    const companyName = company?.name || callSession.campaign.script.companyName;
    const companyDescription = company?.description || callSession.campaign.script.description || 'our innovative solution';
    const voiceId = callSession.campaign.voiceId;

    // Store the transcript
    const metadata = (callSession.metadata as any) || {};
    const transcript = metadata.transcript || [];
    
    transcript.push({
      role: 'user',
      text: speechResult || '(no response)',
      timestamp: new Date().toISOString(),
    });

    await prisma.call.update({
      where: { id: callSessionId },
      data: {
        metadata: {
          ...metadata,
          transcript,
        },
      },
    });

    // Create TwiML response
    const twiml = new VoiceResponse();

    // Use AI for intelligent response
    let aiResponse = 'Thank you for your time. Have a great day!';
    let shouldContinue = false;
    
    if (speechResult) {
      try {
        // Build conversation context
        const conversationHistory = transcript.slice(-4).map((msg: any) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.text,
        }));

        // Call Mistral AI via Blackbox for intelligent response
        const mistralResponse = await fetch('https://api.blackbox.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.BLACKBOX_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'blackboxai/mistralai/mistral-large-2407',
            messages: [
              {
                role: 'system',
                content: `You are Sarah, a professional sales representative for ${companyName}. ` +
                  `We help companies with ${companyDescription}. ` +
                  `Keep responses under 30 words. Be conversational, helpful, and natural. ` +
                  `If prospect is interested, offer to schedule a meeting or send more information. ` +
                  `If they're not interested or busy, politely end the call. ` +
                  `If they have questions, answer them briefly and ask if they'd like to know more.`,
              },
              ...conversationHistory,
              {
                role: 'user',
                content: speechResult,
              },
            ],
            temperature: 0.7,
            max_tokens: 80,
          }),
        });

        if (mistralResponse.ok) {
          const data = await mistralResponse.json();
          aiResponse = data.choices[0]?.message?.content || aiResponse;
          
          // Determine if we should continue the conversation
          const lowerResponse = aiResponse.toLowerCase();
          const lowerSpeech = speechResult.toLowerCase();
          
          // Continue if prospect shows interest or asks questions
          shouldContinue = (
            lowerSpeech.includes('yes') ||
            lowerSpeech.includes('tell me more') ||
            lowerSpeech.includes('interested') ||
            lowerSpeech.includes('how') ||
            lowerSpeech.includes('what') ||
            lowerSpeech.includes('when') ||
            lowerSpeech.includes('why')
          ) && !lowerResponse.includes('goodbye') && !lowerResponse.includes('thank you for your time');
          
          // Save AI response to transcript
          transcript.push({
            role: 'assistant',
            text: aiResponse,
            timestamp: new Date().toISOString(),
          });
          
          await prisma.call.update({
            where: { id: callSessionId },
            data: {
              metadata: {
                ...metadata,
                transcript,
              },
            },
          });
        }
      } catch (aiError) {
        console.error('AI response error:', aiError);
        // Fallback to simple logic
        const lowerSpeech = speechResult.toLowerCase();
        if (lowerSpeech.includes('yes') || lowerSpeech.includes('interested')) {
          aiResponse = `Wonderful! I'll have someone from ${companyName} reach out to schedule a meeting. Thank you!`;
        } else if (lowerSpeech.includes('no') || lowerSpeech.includes('not interested') || lowerSpeech.includes('busy')) {
          aiResponse = 'I understand. Thank you for your time. Have a great day!';
        } else {
          aiResponse = `I'd love to tell you more about how ${companyName} can help. Would you like to schedule a quick call?`;
          shouldContinue = true;
        }
      }
    }
    
    // Generate audio response with ElevenLabs
    try {
      console.log(`Generating AI response audio: "${aiResponse}"`);
      const audioResult = await generateConversationAudio(aiResponse, voiceId);
      
      // Play the generated audio
      twiml.play(audioResult.audioUrl);
      
      // Store audio URL in metadata
      metadata.audioFiles = metadata.audioFiles || [];
      metadata.audioFiles.push({
        url: audioResult.audioUrl,
        path: audioResult.audioPath,
        timestamp: new Date().toISOString(),
      });
      
      await prisma.call.update({
        where: { id: callSessionId },
        data: { metadata },
      });
    } catch (audioError) {
      console.error('Error generating audio, falling back to TTS:', audioError);
      // Fallback to Twilio TTS
      twiml.say(
        {
          voice: 'Polly.Joanna',
          language: 'en-US',
        },
        aiResponse
      );
    }

    // If conversation should continue, gather more input
    if (shouldContinue && transcript.length < 10) { // Limit to 5 turns
      const gather = twiml.gather({
        input: ['speech', 'dtmf'],
        timeout: 5,
        speechTimeout: 'auto',
        action: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/gather?callSessionId=${callSessionId}`,
        method: 'POST',
      });
      
      gather.pause({ length: 1 });
    }

    twiml.hangup();

    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error: any) {
    console.error('Error in gather webhook:', error);
    
    const twiml = new VoiceResponse();
    twiml.say('Thank you. Goodbye.');
    twiml.hangup();

    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}
