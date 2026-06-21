import { supabaseAdmin } from './supabaseAdmin'

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
  const { error } = await supabaseAdmin.from('uso').insert({
    ...event,
    sucesso: event.sucesso ?? true,
  })
  if (error) console.error('[logUso]', error.message)
}
