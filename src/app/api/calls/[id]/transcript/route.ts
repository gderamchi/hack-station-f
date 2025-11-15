import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const callSession = await prisma.call.findUnique({
      where: { id },
      select: {
        status: true,
        metadata: true,
      },
    });

    if (!callSession) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    // Extract transcript from metadata
    const metadata = callSession.metadata as any;
    const transcript = metadata?.transcript || [];

    return NextResponse.json({
      status: callSession.status,
      transcript,
    });

  } catch (error: any) {
    console.error('Error fetching transcript:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcript' },
      { status: 500 }
    );
  }
}
