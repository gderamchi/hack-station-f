/**
 * Audio Generation Service
 * Generates audio files using ElevenLabs and saves them to public directory
 */

import { getElevenLabsClient } from './elevenlabs-client';
import { VoiceSettings } from '@/types/voice';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const RACHEL_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

export interface GenerateAudioOptions {
  text: string;
  voiceId?: string;
  settings?: VoiceSettings;
  saveToFile?: boolean;
}

export interface GeneratedAudio {
  audioUrl: string;
  audioPath: string;
  duration: number;
}

/**
 * Generate audio using ElevenLabs and save to public directory
 */
export async function generateAudio(options: GenerateAudioOptions): Promise<GeneratedAudio> {
  const {
    text,
    voiceId = RACHEL_VOICE_ID,
    settings,
    saveToFile = true,
  } = options;

  try {
    // Validate input
    if (!text || text.trim().length === 0) {
      throw new Error('Text is required for audio generation');
    }

    // Get ElevenLabs client
    const client = getElevenLabsClient();

    // Default settings optimized for phone calls
    const defaultSettings: VoiceSettings = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0,
      use_speaker_boost: true,
    };

    const voiceSettings = settings || defaultSettings;

    // Generate audio with ElevenLabs
    console.log(`Generating audio with ElevenLabs for text: "${text.substring(0, 50)}..."`);
    const audioBuffer = await client.textToSpeech(text, voiceId, voiceSettings);

    if (!saveToFile) {
      // Return base64 encoded audio
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      return {
        audioUrl: `data:audio/mpeg;base64,${base64Audio}`,
        audioPath: '',
        duration: estimateAudioDuration(text),
      };
    }

    // Generate unique filename
    const filename = `call-audio-${randomUUID()}.mp3`;
    const publicDir = path.join(process.cwd(), 'public', 'audio');
    const filePath = path.join(publicDir, filename);

    // Ensure audio directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Save audio file
    fs.writeFileSync(filePath, Buffer.from(audioBuffer));
    console.log(`Audio saved to: ${filePath}`);

    // Get the public URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const audioUrl = `${baseUrl}/audio/${filename}`;

    return {
      audioUrl,
      audioPath: filePath,
      duration: estimateAudioDuration(text),
    };
  } catch (error) {
    console.error('Error generating audio:', error);
    throw new Error(`Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate audio for a conversation turn
 */
export async function generateConversationAudio(
  text: string,
  voiceId?: string
): Promise<GeneratedAudio> {
  return generateAudio({
    text,
    voiceId,
    saveToFile: true,
  });
}

/**
 * Generate opening message audio with company context
 */
export async function generateOpeningMessage(
  prospectName: string,
  companyName: string,
  productDescription: string,
  voiceId?: string
): Promise<GeneratedAudio> {
  const openingText = `Hello ${prospectName}, this is Sarah calling from ${companyName}. ` +
    `I wanted to reach out because ${productDescription}. ` +
    `Do you have a moment to chat?`;

  return generateAudio({
    text: openingText,
    voiceId,
    saveToFile: true,
  });
}

/**
 * Estimate audio duration based on text length
 * Rough estimate: ~150 words per minute
 */
function estimateAudioDuration(text: string): number {
  const words = text.trim().split(/\s+/).length;
  const minutes = words / 150;
  return Math.ceil(minutes * 60); // Return seconds
}

/**
 * Clean up old audio files (older than 1 hour)
 */
export async function cleanupOldAudioFiles(): Promise<void> {
  try {
    const publicDir = path.join(process.cwd(), 'public', 'audio');
    
    if (!fs.existsSync(publicDir)) {
      return;
    }

    const files = fs.readdirSync(publicDir);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    for (const file of files) {
      if (!file.startsWith('call-audio-')) {
        continue;
      }

      const filePath = path.join(publicDir, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtimeMs;

      if (age > oneHour) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old audio file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up audio files:', error);
  }
}

/**
 * Delete a specific audio file
 */
export async function deleteAudioFile(audioPath: string): Promise<void> {
  try {
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
      console.log(`Deleted audio file: ${audioPath}`);
    }
  } catch (error) {
    console.error('Error deleting audio file:', error);
  }
}
