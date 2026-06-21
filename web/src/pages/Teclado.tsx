import { useState } from 'react'
import { Volume2, RotateCcw, X } from 'lucide-react'

export default function Teclado() {
  const [texto, setTexto] = useState('')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640, margin: '0 auto' }}>

      {/* Area de texto */}
      <textarea
        value={texto}
        onChange={e => setTexto(e.target.value)}
        placeholder="Sua mensagem aparecerá aqui..."
        rows={6}
        style={{
          width: '100%',
          minHeight: 160,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-card)',
          padding: 16,
          color: 'var(--text)',
          fontSize: '1.15rem',
          fontFamily: 'inherit',
          resize: 'vertical',
          outline: 'none',
          lineHeight: 1.6,
        }}
      />

      {/* Acoes rapidas */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => setTexto('')}
          disabled={!texto}
          aria-label="Limpar texto"
          style={{
            flex: 1,
            minHeight: 56,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-btn)',
            color: texto ? 'var(--text-muted)' : 'var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontFamily: 'inherit',
            fontSize: '0.85rem',
            cursor: texto ? 'pointer' : 'not-allowed',
          }}
        >
          <X size={18} />
          Limpar
        </button>

        <button
          onClick={() => setTexto(prev => prev.split(' ').slice(0, -1).join(' '))}
          disabled={!texto.trim()}
          aria-label="Desfazer ultima palavra"
          style={{
            flex: 1,
            minHeight: 56,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-btn)',
            color: texto.trim() ? 'var(--text-muted)' : 'var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontFamily: 'inherit',
            fontSize: '0.85rem',
            cursor: texto.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          <RotateCcw size={18} />
          Desfazer
        </button>
      </div>

      {/* Botao Falar — principal, maior */}
      <button
        className="btn-primary"
        disabled={!texto.trim()}
        aria-label="Falar o texto digitado"
        onClick={() => alert('TTS em breve — Fase 2')}
        style={{ minHeight: 64, fontSize: '1.1rem' }}
      >
        <Volume2 size={24} />
        Falar
      </button>
    </div>
  )
}
