// ElevenLabs integration helpers (server-side only).
// The API key lives in ELEVENLABS_API_KEY and is never exposed to the client.
import { ENV } from "./_core/env";
import { storagePut } from "./storage";

const ELEVEN_BASE = "https://api.elevenlabs.io/v1";
const DEFAULT_MODEL = "eleven_multilingual_v2";

function getKey(): string {
  const key = ENV.elevenLabsApiKey;
  if (!key) throw new Error("ELEVENLABS_API_KEY is not configured");
  return key;
}

export type GenerateSpeechParams = {
  text: string;
  voiceId: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
};

/**
 * Generate speech with a (cloned) voice and persist the mp3 to storage.
 * Returns a storage url that the client can play directly.
 */
export async function generateSpeech(params: GenerateSpeechParams): Promise<{ url: string; key: string }> {
  const { text, voiceId, modelId = DEFAULT_MODEL, stability = 0.5, similarityBoost = 0.85, style = 0 } = params;

  const resp = await fetch(`${ELEVEN_BASE}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": getKey(),
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability,
        similarity_boost: similarityBoost,
        style,
        use_speaker_boost: true,
      },
    }),
  });

  if (!resp.ok) {
    const detail = await resp.text().catch(() => resp.statusText);
    throw new Error(`ElevenLabs TTS failed (${resp.status}): ${detail}`);
  }

  const arrayBuffer = await resp.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileKey = `tts/${voiceId}/${Date.now()}.mp3`;
  const { key, url } = await storagePut(fileKey, buffer, "audio/mpeg");
  return { key, url };
}

export type ElevenVoice = {
  voiceId: string;
  name: string;
  category?: string;
  previewUrl?: string;
};

/**
 * List voices available on the account (used by Profile to pick/confirm a clone).
 */
export async function listVoices(): Promise<ElevenVoice[]> {
  const resp = await fetch(`${ELEVEN_BASE}/voices`, {
    headers: { "xi-api-key": getKey() },
  });
  if (!resp.ok) {
    const detail = await resp.text().catch(() => resp.statusText);
    throw new Error(`ElevenLabs list voices failed (${resp.status}): ${detail}`);
  }
  const data = (await resp.json()) as { voices: any[] };
  return (data.voices ?? []).map((v) => ({
    voiceId: v.voice_id,
    name: v.name,
    category: v.category,
    previewUrl: v.preview_url,
  }));
}

/**
 * Get details for a specific voice (confirms a clone exists and is usable).
 */
export async function getVoice(voiceId: string): Promise<ElevenVoice | null> {
  const resp = await fetch(`${ELEVEN_BASE}/voices/${voiceId}`, {
    headers: { "xi-api-key": getKey() },
  });
  if (resp.status === 404) return null;
  if (!resp.ok) {
    const detail = await resp.text().catch(() => resp.statusText);
    throw new Error(`ElevenLabs get voice failed (${resp.status}): ${detail}`);
  }
  const v = (await resp.json()) as any;
  return { voiceId: v.voice_id, name: v.name, category: v.category, previewUrl: v.preview_url };
}
