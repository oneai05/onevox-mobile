import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth }    from './_lib/auth'
import { logUso }         from './_lib/logUso'
import { checkRateLimit } from './_lib/rateLimit'

// limite de payload: ~3MB de base64 (clipes curtos cabem com folga)
const MAX_BASE64 = 3_000_000

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cors = process.env.CORS_ORIGIN ?? '*'
  res.setHeader('Access-Control-Allow-Origin', cors)
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })

  try {
    const user = await requireAuth(req)
    checkRateLimit(user.id)

    const { audio, mimeType, segundos } = req.body as { audio?: string; mimeType?: string; segundos?: number }
    if (!audio || !mimeType) return res.status(400).json({ error: 'áudio obrigatório' })
    if (audio.length > MAX_BASE64) return res.status(413).json({ error: 'áudio muito longo (máx ~60s)' })

    const buf = Buffer.from(audio, 'base64')
    const ext = mimeType.includes('mp4') || mimeType.includes('mpeg') ? 'mp4' : 'webm'

    // FormData/Blob são globais no runtime Node da Vercel
    const form = new FormData()
    form.append('file', new Blob([buf], { type: mimeType }), `audio.${ext}`)
    form.append('model', 'gpt-4o-mini-transcribe')
    form.append('language', 'pt')
    form.append('response_format', 'json')

    const t0 = Date.now()
    const oaiRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form,
    })
    const latencia = Date.now() - t0

    if (!oaiRes.ok) {
      const detalhe = await oaiRes.text().catch(() => '')
      await logUso({ user_id: user.id, provedor: 'openai', operacao: 'stt', segundos_audio: segundos, latencia_ms: latencia, sucesso: false, detalhe: { status: oaiRes.status, detalhe } })
      return res.status(502).json({ error: 'erro na transcrição' })
    }

    const data = await oaiRes.json()
    const texto: string = (data.text ?? '').trim()

    await logUso({ user_id: user.id, provedor: 'openai', operacao: 'stt', segundos_audio: segundos, latencia_ms: latencia, sucesso: true })

    res.status(200).json({ texto })

  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message ?? 'erro interno' })
  }
}
