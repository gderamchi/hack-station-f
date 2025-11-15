import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    const callDuration = formData.get('CallDuration') as string;
    const recordingUrl = formData.get('RecordingUrl') as string;
    const recordingSid = formData.get('RecordingSid') as string;
    const answeredBy = formData.get('AnsweredBy') as string;

    if (!callSid) {
      return NextResponse.json({ error: 'Missing CallSid' }, { status: 400 });
    }

    // Find the call by Twilio SID
    const call = await prisma.call.findUnique({
      where: { twilioCallSid: callSid },
    });

    if (!call) {
      console.log('Call not found for SID:', callSid);
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    // Update call status
    const updateData: any = {
      status: callStatus,
      updatedAt: new Date(),
    };

    if (callDuration) {
      updateData.duration = parseInt(callDuration, 10);
    }

    if (recordingUrl) {
      updateData.recordingUrl = recordingUrl;
    }

    if (recordingSid) {
      updateData.recordingSid = recordingSid;
    }

    if (answeredBy) {
      updateData.answeredBy = answeredBy;
    }

    if (callStatus === 'completed') {
      updateData.endedAt = new Date();
    } else if (callStatus === 'in-progress') {
      updateData.startedAt = new Date();
    }

    await prisma.call.update({
      where: { id: call.id },
      data: updateData,
    });

    // Update campaign stats
    if (callStatus === 'completed') {
      await prisma.campaign.update({
        where: { id: call.campaignId },
        data: {
          totalCalls: { increment: 1 },
          successfulCalls: { increment: 1 },
        },
      });
    } else if (callStatus === 'failed' || callStatus === 'busy' || callStatus === 'no-answer') {
      await prisma.campaign.update({
        where: { id: call.campaignId },
        data: {
          totalCalls: { increment: 1 },
          failedCalls: { increment: 1 },
        },
      });
    }

    console.log(`Updated call ${call.id} status to ${callStatus}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in status webhook:', error);
    return NextResponse.json(
      { error: 'Failed to update call status' },
      { status: 500 }
    );
  }
}
