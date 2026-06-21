import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { User, LogOut, Mic, Settings, ChevronRight } from 'lucide-react'

export default function Perfil() {
  const [email, setEmail] = useState('')
  const [nome, setNome] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      setEmail(user?.email ?? '')
      setNome(user?.user_metadata?.nome ?? '')
    })
  }, [])

  async function handleSair() {
    await supabase.auth.signOut()
  }

  const menuItems = [
    { icon: Mic,      label: 'Minha Voz Clonada',   desc: 'Treinar / atualizar voz' },
    { icon: Settings, label: 'Configurar IA',        desc: 'Modo de operação' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 480, margin: '0 auto' }}>

      {/* Card do usuario */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card)',
        padding: '20px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--grad-from), var(--grad-to))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
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

      {/* Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {menuItems.map(({ icon: Icon, label, desc }) => (
          <button
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card)',
              padding: '0 16px',
              height: 64,
              color: 'var(--text)',
              fontFamily: 'inherit',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--grad-from), var(--grad-to))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon size={18} color="#0A1730" strokeWidth={2.2} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{label}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{desc}</p>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </button>
        ))}
      </div>

      {/* Sair */}
      <button
        onClick={handleSair}
        aria-label="Sair da conta"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-card)',
          padding: '0 16px',
          height: 64,
          color: 'var(--danger)',
          fontFamily: 'inherit',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
          marginTop: 8,
        }}
      >
        <LogOut size={20} />
        Sair
      </button>
    </div>
  )
}
