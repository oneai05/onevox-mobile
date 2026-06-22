import { supabaseAdmin } from './supabaseAdmin'
import { calcularCustoUsd } from './precos'

export interface UsoEvent {
  user_id:        string
  provedor:       'openai' | 'elevenlabs' | 'stt'
  operacao:       'correcao' | 'tts' | 'stt'
  modo?:          number
  tokens_in?:     number
  tokens_out?:    number
  caracteres?:    number
  segundos_audio?: number
  custo_usd?:     number
  latencia_ms?:   number
  sucesso?:       boolean
  detalhe?:       Record<string, unknown>
}

export async function logUso(event: UsoEvent): Promise<void> {
  // custo calculado no backend (preserva o preço histórico na própria linha)
  const custo_usd = event.custo_usd ?? calcularCustoUsd(event)
  const { error } = await supabaseAdmin.from('uso').insert({
    ...event,
    custo_usd,
    sucesso: event.sucesso ?? true,
  })
  if (error) console.error('[logUso]', error.message)
}
