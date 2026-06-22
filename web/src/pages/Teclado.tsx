import { useState } from 'react'
import { Volume2, RotateCcw, X, Wand2, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useFala } from '../lib/useFala'
import FloatingShareButton from '../components/FloatingShareButton'

export default function Teclado() {
  const [texto, setTexto]            = useState('')
  const [textoOriginal, setOriginal] = useState('')
  const { estado, erroMsg, ocupado, ultimoAudio, falar, corrigirEFalar, reset, resetAudio } = useFala()

  async function handleCorrigir() {
    const corrigido = await corrigirEFalar(texto)
    if (corrigido) { setOriginal(texto); setTexto(corrigido) }
  }

  function desfazerCorrecao() {
    if (textoOriginal) { setTexto(textoOriginal); setOriginal('') }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640, margin: '0 auto' }}>

      {/* Area de texto */}
      <textarea
        value={texto}
        onChange={e => { setTexto(e.target.value); setOriginal(''); reset() }}
        placeholder="Digite o que quer dizer..."
        rows={6}
        disabled={ocupado}
        style={{
          width: '100%',
          minHeight: 160,
          background: 'var(--surface)',
          border: `1px solid ${estado === 'erro' ? 'var(--danger)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-card)',
          padding: 16,
          color: 'var(--text)',
          fontSize: '1.15rem',
          fontFamily: 'inherit',
          resize: 'vertical',
          outline: 'none',
          lineHeight: 1.6,
          opacity: ocupado ? 0.7 : 1,
        }}
      />

      {/* Erro */}
      {estado === 'erro' && (
        <p style={{ color: 'var(--danger)', fontSize: '0.82rem', textAlign: 'center' }}>
          {erroMsg}
        </p>
      )}

      {/* Texto original disponivel para desfazer */}
      {textoOriginal && (
        <button
          onClick={desfazerCorrecao}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer', textAlign: 'left', padding: 0 }}
        >
          ↩ Desfazer correção
        </button>
      )}

      {/* Respostas rapidas Sim / Nao (falam direto) */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => falar('Sim.')}
          disabled={ocupado}
          aria-label="Falar Sim"
          style={{
            flex: 1, minHeight: 56,
            background: 'var(--surface)', border: '1px solid var(--brand-green)',
            borderRadius: 'var(--radius-btn)', color: 'var(--brand-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: 'inherit', fontSize: '1rem', fontWeight: 600,
            cursor: ocupado ? 'not-allowed' : 'pointer', opacity: ocupado ? 0.5 : 1,
          }}
        >
          <ThumbsUp size={20} /> Sim
        </button>
        <button
          onClick={() => falar('Não.')}
          disabled={ocupado}
          aria-label="Falar Não"
          style={{
            flex: 1, minHeight: 56,
            background: 'var(--surface)', border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-btn)', color: 'var(--danger)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: 'inherit', fontSize: '1rem', fontWeight: 600,
            cursor: ocupado ? 'not-allowed' : 'pointer', opacity: ocupado ? 0.5 : 1,
          }}
        >
          <ThumbsDown size={20} /> Não
        </button>
      </div>

      {/* Acoes rapidas */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => { setTexto(''); setOriginal(''); reset(); resetAudio() }}
          disabled={!texto || ocupado}
          aria-label="Limpar texto"
          style={{
            flex: 1, minHeight: 56,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-btn)', color: texto && !ocupado ? 'var(--text-muted)' : 'var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontFamily: 'inherit', fontSize: '0.85rem', cursor: texto && !ocupado ? 'pointer' : 'not-allowed',
          }}
        >
          <X size={18} /> Limpar
        </button>

        <button
          onClick={() => setTexto(prev => prev.trimEnd().split(' ').slice(0, -1).join(' '))}
          disabled={!texto.trim() || ocupado}
          aria-label="Desfazer ultima palavra"
          style={{
            flex: 1, minHeight: 56,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-btn)', color: texto.trim() && !ocupado ? 'var(--text-muted)' : 'var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontFamily: 'inherit', fontSize: '0.85rem', cursor: texto.trim() && !ocupado ? 'pointer' : 'not-allowed',
          }}
        >
          <RotateCcw size={18} /> Desfazer
        </button>
      </div>

      {/* Botao Falar direto */}
      <button
        className="btn-primary"
        disabled={!texto.trim() || ocupado}
        aria-label="Falar o texto digitado"
        onClick={() => falar(texto)}
        style={{ minHeight: 64, fontSize: '1.1rem' }}
      >
        {estado === 'falando'
          ? <><Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} /> Falando…</>
          : <><Volume2 size={24} /> Falar</>
        }
      </button>

      {/* Botao Corrigir + Falar */}
      <button
        disabled={!texto.trim() || ocupado}
        aria-label="Corrigir texto e falar"
        onClick={handleCorrigir}
        style={{
          minHeight: 56, width: '100%', border: '1px solid var(--brand-green)',
          borderRadius: 'var(--radius-btn)', background: 'transparent',
          color: texto.trim() && !ocupado ? 'var(--brand-green)' : 'var(--border)',
          fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          cursor: texto.trim() && !ocupado ? 'pointer' : 'not-allowed',
          transition: 'opacity 0.15s',
        }}
      >
        {estado === 'corrigindo'
          ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Corrigindo…</>
          : <><Wand2 size={18} /> Corrigir e Falar</>
        }
      </button>

      {/* Botao flutuante de compartilhar o ultimo audio gerado */}
      {ultimoAudio && <FloatingShareButton audio={ultimoAudio} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
