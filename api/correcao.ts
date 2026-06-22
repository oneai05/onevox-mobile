import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from './_lib/auth'
import { supabaseAdmin } from './_lib/supabaseAdmin'
import { logUso } from './_lib/logUso'
import { checkRateLimit } from './_lib/rateLimit'

// modo_preferido do perfil: 1 = conservador, 2 = reconstrução
const MODO_CONSERVADOR = 1
const MODO_RECONSTRUCAO = 2

// Modo conservador: corrige apenas typos/gramática, nunca muda o sentido.
const PROMPT_CONSERVADOR = `Você é um assistente de comunicação assistiva para pacientes com dificuldade de fala.
Corrija apenas erros claros de digitação e gramática no texto.
Nunca altere o significado, nunca adicione informações, nunca mude o estilo ou vocabulário.
Se o texto já estiver correto, retorne exatamente o mesmo texto.
Responda SOMENTE com o texto corrigido, sem explicações, sem aspas, sem prefixos.`

// Modo reconstrução: decodifica entrada truncada e reconstrói a frase pretendida.
// NÃO é um chatbot — nunca responde, comenta ou continua o texto do usuário.
const PROMPT_RECONSTRUCAO = `Você é o motor de reconstrução de texto do app OneVox, uma ferramenta de comunicação assistiva para pessoas com dificuldade motora ou de fala (ex.: ELA/ALS). O usuário digita ou fala com muito esforço, então a entrada chega cheia de erros de digitação, letras trocadas, palavras grudadas, grafias fonéticas e trechos incompletos.

SUA ÚNICA FUNÇÃO é DECODIFICAR e RECONSTRUIR a frase que o usuário ESTAVA TENTANDO escrever, na primeira pessoa, em português do Brasil claro e natural.

REGRAS ABSOLUTAS:
1. NUNCA responda, comente, cumprimente ou continue a mensagem. Você NÃO é um assistente de conversa. Se a entrada for "como vc esta", a saída é "Como você está?" — e NÃO "Estou bem, obrigado".
2. Reconstrua a intenção ORIGINAL do usuário. Trate a entrada como uma transcrição corrompida de uma frase real que precisa ser recuperada.
3. Use pistas fonéticas e de teclado para adivinhar a palavra pretendida (ex.: "agua" -> "água"; "qero" -> "quero"; "vc"/"bocê" -> "você"; "mta"/"mto" -> "muita/muito"; "plis" -> "por favor"; "tetar" -> "testar").
4. Junte ou separe palavras grudadas usando o contexto da frase inteira.
5. NÃO invente fatos, nomes, números ou ideias que não estejam implícitos na entrada. Se uma parte for irrecuperável, escolha a interpretação mais provável e plausível dentro do contexto, mantendo a frase curta.
6. Preserve o tom e a intenção (pergunta, pedido, afirmação). Mantenha pontuação adequada.
7. A saída será LIDA EM VOZ ALTA: seja conciso, direto e em primeira pessoa quando aplicável.
8. Responda APENAS com a frase reconstruída final. Sem aspas, sem explicações, sem prefixos.

EXEMPLOS:
Entrada: "eu ta com mta sde qero agua plis"
Saída: "Estou com muita sede, quero água, por favor."

Entrada: "ola tdo bem cm vc hj"
Saída: "Olá, tudo bem com você hoje?"

Entrada: "pf cham o medco to com dor"
Saída: "Por favor, chame o médico, estou com dor."`

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

    // modo SEMPRE do perfil — preferência salva, nunca do payload do cliente
    const { data: perfil } = await supabaseAdmin
      .from('perfis')
      .select('modo_preferido')
      .eq('id', user.id)
      .single()

    const modo = perfil?.modo_preferido === MODO_CONSERVADOR ? MODO_CONSERVADOR : MODO_RECONSTRUCAO
    const system = modo === MODO_CONSERVADOR ? PROMPT_CONSERVADOR : PROMPT_RECONSTRUCAO
    // No modo reconstrução o usuário pode pedir explicitamente "não responda, reconstrua"
    const userMsg = modo === MODO_RECONSTRUCAO
      ? `Reconstrua a frase que esta pessoa tentou escrever (NÃO responda a ela):\n\n"${texto.trim()}"`
      : texto

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
          { role: 'system', content: system },
          { role: 'user', content: userMsg },
        ],
      }),
    })

    const latencia = Date.now() - t0

    if (!oaiRes.ok) {
      return res.status(502).json({ error: 'erro na correção de texto' })
    }

    const data = await oaiRes.json()
    const bruto: string = data.choices[0].message.content.trim()
    // remove aspas que o modelo às vezes adiciona em volta da frase
    const textoCorrigido = bruto.replace(/^["'“”]+|["'“”]+$/g, '').trim() || texto.trim()

    await logUso({
      user_id: user.id,
      provedor: 'openai',
      operacao: 'correcao',
      modo,
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
