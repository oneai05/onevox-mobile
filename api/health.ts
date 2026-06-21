import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from './_lib/supabaseAdmin'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const cors = process.env.CORS_ORIGIN ?? '*'
  res.setHeader('Access-Control-Allow-Origin', cors)

  const deps: Record<string, boolean> = {
    supabase:    false,
    openai:      !!process.env.OPENAI_API_KEY,
    elevenlabs:  !!process.env.ELEVENLABS_API_KEY,
  }

  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 4000)
    )
    await Promise.race([
      supabaseAdmin.from('perfis').select('id').limit(1),
      timeout,
    ])
    deps.supabase = true
  } catch { /* mantém false */ }

  const ok = Object.values(deps).every(Boolean)
  return res.status(ok ? 200 : 503).json({ ok, deps })
}
