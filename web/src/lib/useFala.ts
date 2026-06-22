import { useState } from 'react'
import { apiFetch } from './api'
import { playAudio } from '../audio/player'

export type EstadoFala = 'idle' | 'corrigindo' | 'falando' | 'erro'

/**
 * Lógica compartilhada de falar (TTS) e corrigir+falar (OpenAI → ElevenLabs),
 * usada pelo Teclado e pela tela Gravar. Guarda o último áudio gerado para o
 * botão flutuante de compartilhar.
 */
export function useFala() {
  const [estado, setEstado]           = useState<EstadoFala>('idle')
  const [erroMsg, setErroMsg]         = useState('')
  const [ultimoAudio, setUltimoAudio] = useState<Blob | null>(null)

  const ocupado = estado === 'corrigindo' || estado === 'falando'

  async function falar(texto: string): Promise<void> {
    if (!texto.trim()) return
    setEstado('falando'); setErroMsg('')
    try {
      const res  = await apiFetch('/api/tts', { method: 'POST', body: JSON.stringify({ texto }) })
      const blob = await res.blob()
      setUltimoAudio(blob)
      await playAudio(blob)
      setEstado('idle')
    } catch (e: any) {
      setErroMsg(e.message ?? 'erro ao gerar voz')
      setEstado('erro')
    }
  }

  /** Corrige o texto com o modo do perfil e fala. Retorna o texto corrigido (ou null em erro). */
  async function corrigirEFalar(texto: string): Promise<string | null> {
    if (!texto.trim()) return null
    setEstado('corrigindo'); setErroMsg('')
    try {
      const res = await apiFetch('/api/correcao', { method: 'POST', body: JSON.stringify({ texto }) })
      const { textoCorrigido } = await res.json()
      await falar(textoCorrigido)
      return textoCorrigido
    } catch (e: any) {
      setErroMsg(e.message ?? 'erro na correção')
      setEstado('erro')
      return null
    }
  }

  /** Volta ao estado neutro (ex.: ao editar o texto). Não descarta o áudio. */
  function reset() { setEstado('idle'); setErroMsg('') }
  function resetAudio() { setUltimoAudio(null) }

  return { estado, erroMsg, ocupado, ultimoAudio, falar, corrigirEFalar, reset, resetAudio }
}
