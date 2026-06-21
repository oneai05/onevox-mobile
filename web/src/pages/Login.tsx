import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail]         = useState('')
  const [senha, setSenha]         = useState('')
  const [erro, setErro]           = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) setErro(error.message)
    setCarregando(false)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '48px 24px 32px',
    }}>

      {/* Topo: icone + wordmark */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

        {/* Icone da onda OneVox */}
        <div style={{
          width: 104,
          height: 104,
          borderRadius: 28,
          background: 'linear-gradient(145deg, #142544, #0F1E3A)',
          border: '1px solid #284067',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 40px rgba(79,204,170,0.18), 0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <img
            src="/icons/icon-192.png"
            alt="OneVox"
            style={{ width: 88, height: 88, borderRadius: 20 }}
          />
        </div>

        {/* Wordmark */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '2.6rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>
            <span style={{ color: '#fff' }}>One</span>
            <span style={{
              background: 'linear-gradient(90deg, #4FCCAA, #2EBFC2)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}>Vox</span>
          </div>
          <div style={{
            marginTop: 6,
            fontSize: '0.72rem',
            fontWeight: 500,
            letterSpacing: '0.18em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
          }}>
            Comunicação Assistiva
          </div>
        </div>
      </div>

      {/* Centro: formulario */}
      <form
        onSubmit={handleLogin}
        style={{
          width: '100%',
          maxWidth: 380,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <label htmlFor="email" style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 500 }}>
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              height: 56,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '0 18px',
              color: 'var(--text)',
              fontSize: '1rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = '#4FCCAA'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <label htmlFor="senha" style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 500 }}>
            Senha
          </label>
          <input
            id="senha"
            type="password"
            autoComplete="current-password"
            required
            value={senha}
            onChange={e => setSenha(e.target.value)}
            style={{
              height: 56,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '0 18px',
              color: 'var(--text)',
              fontSize: '1rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = '#4FCCAA'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {erro && (
          <p style={{ color: 'var(--danger)', fontSize: '0.82rem', textAlign: 'center', marginTop: 2 }}>
            {erro}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={carregando}
          style={{ marginTop: 8, fontSize: '1.05rem', letterSpacing: '0.02em' }}
        >
          {carregando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      {/* Rodape: Powered by OneAI */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        opacity: 0.55,
      }}>
        <img src="/oneai-emblem.png" alt="One AI" style={{ width: 22, height: 22, objectFit: 'contain' }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.04em' }}>
          Powered by <strong style={{ color: 'var(--text)' }}>One AI</strong>
        </span>
      </div>

    </div>
  )
}
