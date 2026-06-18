import { describe, expect, it } from "vitest";

const VOICE_ID = "GMafEIaeEWpGsrYrVqCX"; // Roberto Dias
const API_KEY = process.env.ELEVENLABS_API_KEY;

describe("ElevenLabs integration", () => {
  it("has the API key configured", () => {
    expect(API_KEY, "ELEVENLABS_API_KEY must be set").toBeTruthy();
  });

  it("confirms the cloned voice exists and is usable", async () => {
    const resp = await fetch(`https://api.elevenlabs.io/v1/voices/${VOICE_ID}`, {
      headers: { "xi-api-key": API_KEY as string },
    });
    expect(resp.status).toBe(200);
    const data = (await resp.json()) as { voice_id: string; name: string };
    expect(data.voice_id).toBe(VOICE_ID);
    expect(data.name).toBeTruthy();
  }, 30000);

  it("generates speech with the cloned voice (paid plan required)", async () => {
    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY as string,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: "Teste automatizado do OneVox.",
        model_id: "eleven_multilingual_v2",
      }),
    });
    expect(resp.status).toBe(200);
    const buf = Buffer.from(await resp.arrayBuffer());
    // A valid mp3 should be at least a few KB.
    expect(buf.length).toBeGreaterThan(2000);
  }, 60000);
});
