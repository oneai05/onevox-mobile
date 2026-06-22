// Preços estimados dos provedores, em USD.
// ⚠️ AJUSTE conforme seu plano/faturamento real — estes são valores de referência.
// Centralizado aqui para que o custo por chamada seja calculado em um só lugar.
export const PRECOS = {
  // OpenAI gpt-4o-mini (correção de texto) — por 1 milhão de tokens
  openai_correcao:   { inputPorMTok: 0.15, outputPorMTok: 0.60 },
  // OpenAI gpt-4o-mini-transcribe (STT) — por segundo de áudio (~US$0.006/min de ref.)
  openai_transcribe: { porSegundo: 0.0001 },
  // ElevenLabs TTS — por caractere (~US$0.18/1k chars; varia MUITO por plano)
  elevenlabs_tts:    { porCaractere: 0.00018 },
}

interface CustoInput {
  operacao:        'correcao' | 'tts' | 'stt'
  tokens_in?:      number
  tokens_out?:     number
  caracteres?:     number
  segundos_audio?: number
}

const round6 = (n: number) => Math.round(n * 1e6) / 1e6

/** Custo estimado da chamada em USD, a partir das métricas registradas. */
export function calcularCustoUsd(e: CustoInput): number | undefined {
  switch (e.operacao) {
    case 'correcao': {
      const i = (e.tokens_in  ?? 0) / 1e6 * PRECOS.openai_correcao.inputPorMTok
      const o = (e.tokens_out ?? 0) / 1e6 * PRECOS.openai_correcao.outputPorMTok
      return round6(i + o)
    }
    case 'stt':
      return round6((e.segundos_audio ?? 0) * PRECOS.openai_transcribe.porSegundo)
    case 'tts':
      return round6((e.caracteres ?? 0) * PRECOS.elevenlabs_tts.porCaractere)
    default:
      return undefined
  }
}
