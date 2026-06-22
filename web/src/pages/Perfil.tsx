import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { usePerfil, applyFontScale, type Modo, type FontScale } from '../lib/usePerfil'
import { User, LogOut, Wand2, ShieldCheck, Type } from 'lucide-react'

const MODOS: { v: Modo; label: string; desc: string; icon: typeof Wand2 }[] = [
  { v: 1, label: 'Conservador',  desc: 'Corrige só erros de digitação, sem mudar o sentido.', icon: ShieldCheck },
  { v: 2, label: 'Reconstrução', desc: 'Decodifica texto truncado e reconstrói a frase inteira.', icon: Wand2 },
]

const FONTES: { v: FontScale; label: string }[] = [
  { v: 'normal', label: 'Normal' },
  { v: 'grande', label: 'Grande' },
  { v: 'extra',  label: 'Extra'  },
]

export default function Perfil() {
  const [email, setEmail] = useState('')
  const { perfil, update } = usePerfil()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? '')
    })
  }, [])

  const nome = perfil?.nome ?? ''
  const modo = perfil?.modo_preferido ?? 2
  const fonte = perfil?.font_scale ?? 'normal'

  function trocarFonte(v: FontScale) {
    applyFontScale(v)         // aplica imediato
    update({ font_scale: v }) // persiste
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 480, margin: '0 auto' }}>

      {/* Card do usuario */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card)', padding: '20px 16px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--grad-from), var(--grad-to))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <User size={28} color="#0A1730" strokeWidth={2} />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <p style={{ fontWeight: 600, fontSize: '1rem' }}>{nome || 'Meu perfil'}</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {email}
          </p>
        </div>
      </div>

      {/* Modo de correção */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Wand2 size={16} /> Modo de correção
        </h2>
        {MODOS.map(({ v, label, desc, icon: Icon }) => {
          const ativo = modo === v
          return (
            <button
              key={v}
              onClick={() => update({ modo_preferido: v })}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                background: 'var(--surface)',
                border: `1.5px solid ${ativo ? 'var(--brand-green)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-card)', padding: '14px 16px',
                color: 'var(--text)', fontFamily: 'inherit', cursor: 'pointer', width: '100%',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: ativo ? 'linear-gradient(135deg, var(--grad-from), var(--grad-to))' : 'var(--surface-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} color={ativo ? '#0A1730' : 'var(--text-muted)'} strokeWidth={2.2} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{label}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>{desc}</p>
              </div>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${ativo ? 'var(--brand-green)' : 'var(--border)'}`,
                background: ativo ? 'var(--brand-green)' : 'transparent',
              }} />
            </button>
          )
        })}
      </section>

      {/* Tamanho da fonte */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Type size={16} /> Tamanho da fonte
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {FONTES.map(({ v, label }) => {
            const ativo = fonte === v
            return (
              <button
                key={v}
                onClick={() => trocarFonte(v)}
                style={{
                  flex: 1, minHeight: 52,
                  background: ativo ? 'linear-gradient(90deg, var(--grad-from), var(--grad-to))' : 'var(--surface)',
                  border: `1.5px solid ${ativo ? 'transparent' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-btn)',
                  color: ativo ? '#0A1730' : 'var(--text)',
                  fontFamily: 'inherit', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </section>

      {/* Sair */}
      <button
        onClick={() => supabase.auth.signOut()}
        aria-label="Sair da conta"
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-card)', padding: '0 16px', height: 64,
          color: 'var(--danger)', fontFamily: 'inherit', fontSize: '1rem', fontWeight: 600,
          cursor: 'pointer', width: '100%', textAlign: 'left', marginTop: 8,
        }}
      >
        <LogOut size={20} />
        Sair
      </button>
    </div>
  )
}
