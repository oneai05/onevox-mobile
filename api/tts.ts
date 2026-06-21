import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth }    from './_lib/auth'
import { checkRateLimit } from './_lib/rateLimit'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cors = process.env.CORS_ORIGIN ?? '*'
  res.setHeader('Access-Control-Allow-Origin', cors)
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const user = await requireAuth(req)
    checkRateLimit(user.id)
    // Fase 2: integração ElevenLabs (voice_id da sessão, nunca do payload)
    return res.status(501).json({ error: 'Not implemented — Fase 2' })
  } catch (err: unknown) {
    const e = err as Error & { status?: number }
    return res.status(e.status ?? 500).json({ error: e.message })
  }
}
