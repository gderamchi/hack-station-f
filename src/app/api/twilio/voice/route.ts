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

    // Get call session and related data
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

    // Create TwiML response
    const twiml = new VoiceResponse();

    // Greet the prospect with personalized message
    const prospectName = callSession.prospect.firstName;
    const voiceId = callSession.campaign.voiceId;

    // Generate opening message with ElevenLabs
    const openingText = `Hello ${prospectName}, this is Sarah calling from ${companyName}. ` +
      `I wanted to reach out because we help companies like yours with ${companyDescription}. ` +
      `Do you have a moment to chat?`;

    console.log(`Generating opening audio for call ${callSessionId}`);
    
    try {
      // Generate audio with ElevenLabs
      const audioResult = await generateConversationAudio(openingText, voiceId);
      
      // Play the generated audio (works with trial accounts!)
      twiml.play(audioResult.audioUrl);
      
      // Store audio URL in metadata for cleanup later
      const metadata = (callSession.metadata as any) || {};
      metadata.audioFiles = metadata.audioFiles || [];
      metadata.audioFiles.push({
        url: audioResult.audioUrl,
        path: audioResult.audioPath,
        timestamp: new Date().toISOString(),
      });
      
      // Initialize transcript
      metadata.transcript = [{
        role: 'assistant',
        text: openingText,
        timestamp: new Date().toISOString(),
      }];
      
      await prisma.call.update({
        where: { id: callSessionId },
        data: { metadata },
      });
    } catch (audioError) {
      console.error('Error generating audio, falling back to TTS:', audioError);
      // Fallback to Twilio TTS if ElevenLabs fails
      twiml.say(
        {
          voice: 'Polly.Joanna',
          language: 'en-US',
        },
        openingText
      );
    }

    // Use speech input with Gather (works with trial accounts!)
    const gather = twiml.gather({
      input: ['speech', 'dtmf'], // Accept both speech and keypad
      timeout: 5,
      speechTimeout: 'auto',
      action: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/gather?callSessionId=${callSessionId}`,
      method: 'POST',
    });

    // Add a pause to give them time to respond
    gather.pause({ length: 1 });

    // If no response, say goodbye
    try {
      const goodbyeText = 'Thank you for your time. Have a great day!';
      const goodbyeAudio = await generateConversationAudio(goodbyeText, voiceId);
      twiml.play(goodbyeAudio.audioUrl);
    } catch (audioError) {
      console.error('Error generating goodbye audio:', audioError);
      twiml.say(
        {
          voice: 'Polly.Joanna',
          language: 'en-US',
        },
        'Thank you for your time. Have a great day!'
      );
    }

    twiml.hangup();

    // Return TwiML
    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error: any) {
    console.error('Error in voice webhook:', error);
    
    // Return a simple error TwiML
    const twiml = new VoiceResponse();
    twiml.say('We apologize, but there was an error. Goodbye.');
    twiml.hangup();

    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}
