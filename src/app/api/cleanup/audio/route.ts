import { NextRequest, NextResponse } from 'next/server';
import { cleanupOldAudioFiles } from '@/lib/voice/generate-audio';

/**
 * Cleanup endpoint for old audio files
 * Can be called manually or via cron job
 */
export async function POST(req: NextRequest) {
  try {
    // Optional: Add authentication here
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.CLEANUP_TOKEN || 'cleanup-secret';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await cleanupOldAudioFiles();

    return NextResponse.json({
      success: true,
      message: 'Audio files cleaned up successfully',
    });
  } catch (error) {
    console.error('Error in cleanup endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup audio files' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
