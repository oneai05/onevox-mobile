import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'

// modo_preferido: 1 = conservador, 2 = reconstrução
export type Modo = 1 | 2
export type FontScale = 'normal' | 'grande' | 'extra'

export interface Perfil {
  modo_preferido:      Modo
  font_scale:          FontScale
  nome:                string | null
  elevenlabs_voice_id: string | null
}

// tamanho de fonte raiz por escala (o app usa rem/em, então escala tudo junto)
export const FONT_PX: Record<FontScale, string> = {
  normal: '18px',
  grande: '20px',
  extra:  '23px',
}

export function applyFontScale(scale: FontScale): void {
  document.documentElement.style.fontSize = FONT_PX[scale] ?? FONT_PX.normal
}

/** Carrega o perfil do usuário logado e expõe um update otimista (RLS protege a escrita). */
export function usePerfil() {
  const [perfil, setPerfil]   = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id
      if (!uid) { if (active) setLoading(false); return }
      const { data: row } = await supabase
        .from('perfis')
        .select('modo_preferido, font_scale, nome, elevenlabs_voice_id')
        .eq('id', uid)
        .single()
      if (active) { setPerfil((row as Perfil) ?? null); setLoading(false) }
    })
    return () => { active = false }
  }, [])

  const update = useCallback(async (patch: Partial<Perfil>) => {
    const { data } = await supabase.auth.getUser()
    const uid = data.user?.id
    if (!uid) return
    setPerfil(prev => (prev ? { ...prev, ...patch } : prev))
    await supabase.from('perfis').update(patch).eq('id', uid)
  }, [])

  return { perfil, loading, update }
}
