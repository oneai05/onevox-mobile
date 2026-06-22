import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { apiFetch } from '../lib/api'
import { playAudio } from '../audio/player'
import { HandHeart, Cross, MessageCircle, AlertTriangle, Plus, X, Volume2, Loader2 } from 'lucide-react'

type Categoria = 'necessidades' | 'saude' | 'social' | 'emergencia'
interface Frase { id: string; texto: string; categoria: Categoria }

const CATEGORIAS: { key: Categoria; label: string; icon: typeof HandHeart; color: string }[] = [
  { key: 'necessidades', label: 'Necessidades', icon: HandHeart,     color: '#4FCCAA' },
  { key: 'saude',        label: 'Saúde',        icon: Cross,         color: '#71D2DC' },
  { key: 'social',       label: 'Social',       icon: MessageCircle, color: '#A78BFA' },
  { key: 'emergencia',   label: 'Emergência',   icon: AlertTriangle, color: '#FF5A6E' },
]

// frases-semente inseridas na primeira vez que o usuário abre a aba
const DEFAULT_PHRASES: { texto: string; categoria: Categoria }[] = [
  { texto: 'Sim, por favor.',              categoria: 'necessidades' },
  { texto: 'Não, obrigado.',               categoria: 'necessidades' },
  { texto: 'Estou com sede.',              categoria: 'necessidades' },
  { texto: 'Estou com fome.',              categoria: 'necessidades' },
  { texto: 'Preciso ir ao banheiro.',      categoria: 'necessidades' },
  { texto: 'Estou com dor.',               categoria: 'saude' },
  { texto: 'Preciso do meu remédio.',      categoria: 'saude' },
  { texto: 'Pode chamar o médico?',        categoria: 'saude' },
  { texto: 'Estou cansado, quero descansar.', categoria: 'saude' },
  { texto: 'Olá, tudo bem?',               categoria: 'social' },
  { texto: 'Obrigado por estar aqui.',     categoria: 'social' },
  { texto: 'Eu te amo.',                   categoria: 'social' },
  { texto: 'Pode repetir, por favor?',     categoria: 'social' },
  { texto: 'Preciso de ajuda agora!',      categoria: 'emergencia' },
  { texto: 'Chame uma ambulância!',        categoria: 'emergencia' },
  { texto: 'Estou me sentindo mal.',       categoria: 'emergencia' },
]

export default function Frases() {
  const [frases, setFrases]     = useState<Frase[]>([])
  const [activeCat, setActive]  = useState<Categoria>('necessidades')
  const [loading, setLoading]   = useState(true)
  const [falandoId, setFalando] = useState<string | null>(null)
  const [modalOpen, setModal]   = useState(false)
  const [novoTexto, setNovo]    = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    let { data } = await supabase
      .from('frases')
      .select('id, texto, categoria')
      .order('criado_em', { ascending: true })

    // primeira vez: semeia os defaults e recarrega
    if (!data || data.length === 0) {
      await supabase.from('frases').insert(
        DEFAULT_PHRASES.map(p => ({ ...p, user_id: user.id })),
      )
      const res = await supabase
        .from('frases')
        .select('id, texto, categoria')
        .order('criado_em', { ascending: true })
      data = res.data
    }
    setFrases((data as Frase[]) ?? [])
    setLoading(false)
  }

  async function falar(f: Frase) {
    setFalando(f.id)
    try {
      const res = await apiFetch('/api/tts', { method: 'POST', body: JSON.stringify({ texto: f.texto }) })
      await playAudio(await res.blob())
    } catch { /* silencioso na grade de frases */ }
    setFalando(null)
  }

  async function adicionar() {
    const texto = novoTexto.trim()
    if (!texto) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('frases')
      .insert({ texto, categoria: activeCat, user_id: user.id })
      .select('id, texto, categoria')
      .single()
    if (data) setFrases(prev => [...prev, data as Frase])
    setNovo(''); setModal(false)
  }

  async function remover(id: string) {
    setFrases(prev => prev.filter(f => f.id !== id))
    await supabase.from('frases').delete().eq('id', id)
  }

  const visiveis = useMemo(() => frases.filter(f => f.categoria === activeCat), [frases, activeCat])
  const corAtiva = CATEGORIAS.find(c => c.key === activeCat)!.color

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640, margin: '0 auto' }}>

      {/* Abas de categoria */}
      <div style={{ display: 'flex', gap: 8 }}>
        {CATEGORIAS.map(({ key, label, icon: Icon, color }) => {
          const ativo = activeCat === key
          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              aria-label={label}
              style={{
                flex: 1, minHeight: 64, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 4,
                background: ativo ? color : 'var(--surface)',
                border: `1px solid ${ativo ? color : 'var(--border)'}`,
                borderRadius: 'var(--radius-card)',
                color: ativo ? '#0A1730' : 'var(--text-muted)',
                fontFamily: 'inherit', fontSize: '0.66rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Icon size={22} strokeWidth={ativo ? 2.4 : 1.8} />
              {label}
            </button>
          )
        })}
      </div>

      {/* Grade de frases */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>Carregando…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visiveis.map(f => (
            <div
              key={f.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-card)', overflow: 'hidden',
              }}
            >
              <button
                onClick={() => falar(f)}
                disabled={falandoId === f.id}
                aria-label={`Falar: ${f.texto}`}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                  background: 'none', border: 'none', padding: '16px 16px', minHeight: 60,
                  color: 'var(--text)', fontFamily: 'inherit', fontSize: '1.02rem', cursor: 'pointer',
                }}
              >
                {falandoId === f.id
                  ? <Loader2 size={20} color={corAtiva} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                  : <Volume2 size={20} color={corAtiva} style={{ flexShrink: 0 }} />}
                {f.texto}
              </button>
              <button
                onClick={() => remover(f.id)}
                aria-label="Remover frase"
                style={{
                  background: 'none', border: 'none', padding: '0 14px', height: 60,
                  color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0,
                }}
              >
                <X size={18} />
              </button>
            </div>
          ))}

          {/* Adicionar frase */}
          <button
            onClick={() => setModal(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              minHeight: 56, background: 'transparent',
              border: `1.5px dashed var(--border)`, borderRadius: 'var(--radius-card)',
              color: 'var(--text-muted)', fontFamily: 'inherit', fontSize: '0.9rem', cursor: 'pointer',
            }}
          >
            <Plus size={18} /> Adicionar frase
          </button>
        </div>
      )}

      {/* Modal de nova frase */}
      {modalOpen && (
        <div
          onClick={() => setModal(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 640, background: 'var(--surface)',
              borderRadius: '20px 20px 0 0', padding: 20, paddingBottom: 32,
              display: 'flex', flexDirection: 'column', gap: 14,
            }}
          >
            <p style={{ fontWeight: 600, fontSize: '1rem' }}>Nova frase em {CATEGORIAS.find(c => c.key === activeCat)!.label}</p>
            <input
              autoFocus
              value={novoTexto}
              onChange={e => setNovo(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') adicionar() }}
              placeholder="Digite a frase…"
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-btn)', padding: 14, color: 'var(--text)',
                fontFamily: 'inherit', fontSize: '1rem', outline: 'none',
              }}
            />
            <button className="btn-primary" onClick={adicionar} disabled={!novoTexto.trim()}>
              Adicionar
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
