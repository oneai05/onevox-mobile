import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from './_lib/auth'
import { logUso } from './_lib/logUso'
import { checkRateLimit } from './_lib/rateLimit'

const SYSTEM = `Você é um assistente de comunicação assistiva para pacientes com dificuldade de fala.
Corrija apenas erros claros de digitação e gramática no texto.
Nunca altere o significado, nunca adicione informações, nunca mude o estilo ou vocabulário.
Se o texto já estiver correto, retorne exatamente o mesmo texto.
Responda SOMENTE com o texto corrigido, sem explicações, sem aspas, sem prefixos.`

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

    const t0 = Date.now()
    const oaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        max_tokens: 1024,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: texto },
        ],
      }),
    })

    const latencia = Date.now() - t0

    if (!oaiRes.ok) {
      return res.status(502).json({ error: 'erro na correção de texto' })
    }

    const data = await oaiRes.json()
    const textoCorrigido: string = data.choices[0].message.content.trim()

    await logUso({
      user_id: user.id,
      provedor: 'openai',
      operacao: 'correcao',
      tokens_in: data.usage.prompt_tokens,
      tokens_out: data.usage.completion_tokens,
      latencia_ms: latencia,
      sucesso: true,
    })

    res.status(200).json({ textoCorrigido })

  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message ?? 'erro interno' })
  }
}
