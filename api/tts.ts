import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from './_lib/auth'
import { supabaseAdmin } from './_lib/supabaseAdmin'
import { logUso } from './_lib/logUso'
import { checkRateLimit } from './_lib/rateLimit'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = process.env.CORS_ORIGIN ?? '*'
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })

  try {
    const user = await requireAuth(req)
    checkRateLimit(user.id)

    const { texto } = req.body as { texto?: string }
    if (!texto?.trim()) return res.status(400).json({ error: 'texto obrigatório' })
    if (texto.length > 2000) return res.status(400).json({ error: 'texto muito longo (máx 2000 chars)' })

    // voice_id SEMPRE do perfil — nunca do payload do cliente
    const { data: perfil } = await supabaseAdmin
      .from('perfis')
      .select('elevenlabs_voice_id')
      .eq('id', user.id)
      .single()

    if (!perfil?.elevenlabs_voice_id) {
      return res.status(400).json({ error: 'voz não configurada no perfil' })
    }

    const t0 = Date.now()
    const elRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${perfil.elevenlabs_voice_id}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: texto,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    )

    const latencia = Date.now() - t0

    if (!elRes.ok) {
      const detalhe = await elRes.text().catch(() => '')
      await logUso({ user_id: user.id, provedor: 'elevenlabs', operacao: 'tts', caracteres: texto.length, latencia_ms: latencia, sucesso: false, detalhe: { status: elRes.status, detalhe } })
      return res.status(502).json({ error: 'erro na síntese de voz' })
    }

    const audio = Buffer.from(await elRes.arrayBuffer())
    await logUso({ user_id: user.id, provedor: 'elevenlabs', operacao: 'tts', caracteres: texto.length, latencia_ms: latencia, sucesso: true })

    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Content-Length', audio.length)
    res.status(200).end(audio)

  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message ?? 'erro interno' })
  }
}
