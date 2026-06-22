import { useRef, useState } from 'react'
import { Mic, Square, Loader2, Volume2, Wand2, RotateCcw } from 'lucide-react'
import { apiFetch } from '../lib/api'
import { useFala } from '../lib/useFala'
import FloatingShareButton from '../components/FloatingShareButton'

type Fase = 'idle' | 'gravando' | 'transcrevendo' | 'erro'

function pickMime(): string {
  const cands = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/mpeg']
  for (const c of cands) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(c)) return c
  }
  return ''
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onloadend = () => resolve((r.result as string).split(',')[1] ?? '')
    r.onerror = reject
    r.readAsDataURL(blob)
  })
}

function mmss(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function Gravar() {
  const [fase, setFase]       = useState<Fase>('idle')
  const [erro, setErro]       = useState('')
  const [texto, setTexto]     = useState('')
  const [duracao, setDuracao] = useState(0)

  const recRef      = useRef<MediaRecorder | null>(null)
  const chunksRef   = useRef<Blob[]>([])
  const streamRef   = useRef<MediaStream | null>(null)
  const startRef    = useRef(0)
  const timerRef    = useRef<number | null>(null)
  const autoStopRef = useRef<number | null>(null)

  const { estado, erroMsg, ocupado, ultimoAudio, falar, corrigirEFalar, resetAudio } = useFala()

  async function iniciar() {
    setErro(''); setTexto(''); resetAudio()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mime = pickMime()
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
      chunksRef.current = []
      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      rec.onstop = () => finalizar(rec.mimeType || mime || 'audio/webm')
      recRef.current = rec
      rec.start()
      startRef.current = Date.now()
      setDuracao(0)
      setFase('gravando')
      timerRef.current = window.setInterval(
        () => setDuracao(Math.floor((Date.now() - startRef.current) / 1000)), 250)
      autoStopRef.current = window.setTimeout(parar, 60_000) // auto-parar em 60s
    } catch {
      setErro('Não consegui acessar o microfone. Permita o acesso e tente de novo.')
      setFase('erro')
    }
  }

  function parar() {
    if (timerRef.current)    { clearInterval(timerRef.current); timerRef.current = null }
    if (autoStopRef.current) { clearTimeout(autoStopRef.current); autoStopRef.current = null }
    if (recRef.current?.state === 'recording') recRef.current.stop()
  }

  async function finalizar(mimeType: string) {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setFase('transcrevendo')
    try {
      const blob = new Blob(chunksRef.current, { type: mimeType })
      const segundos = Math.round((Date.now() - startRef.current) / 1000)
      const audio = await blobToBase64(blob)
      const res = await apiFetch('/api/stt', { method: 'POST', body: JSON.stringify({ audio, mimeType, segundos }) })
      const { texto: t } = await res.json()
      setTexto(t)
      setFase('idle')
      if (!t) setErro('Não entendi o áudio. Tente falar mais perto do microfone.')
    } catch (e: any) {
      setErro(e.message ?? 'erro na transcrição')
      setFase('erro')
    }
  }

  async function handleCorrigir() {
    const c = await corrigirEFalar(texto)
    if (c) setTexto(c)
  }

  function gravarDeNovo() {
    setTexto(''); setErro(''); setFase('idle'); resetAudio()
  }

  // ---- render ----
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640, margin: '0 auto' }}>

      {/* Transcrevendo */}
      {fase === 'transcrevendo' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 280, justifyContent: 'center' }}>
          <Loader2 size={40} color="var(--brand-green)" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)' }}>Transcrevendo…</p>
        </div>
      )}

      {/* Gravador (sem transcrição ainda) */}
      {fase !== 'transcrevendo' && !texto && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, minHeight: 280, justifyContent: 'center' }}>
          {erro && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'center' }}>{erro}</p>}

          <button
            onClick={fase === 'gravando' ? parar : iniciar}
            aria-label={fase === 'gravando' ? 'Parar gravação' : 'Iniciar gravação'}
            style={{
              width: 120, height: 120, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: fase === 'gravando'
                ? 'var(--danger)'
                : 'linear-gradient(135deg, var(--grad-from), var(--grad-to))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: fase === 'gravando' ? '0 0 0 8px rgba(255,90,110,0.18)' : '0 6px 20px rgba(0,0,0,0.35)',
              animation: fase === 'gravando' ? 'pulse 1.4s ease-in-out infinite' : 'none',
            }}
          >
            {fase === 'gravando'
              ? <Square size={44} color="#fff" fill="#fff" />
              : <Mic size={52} color="#0A1730" strokeWidth={2} />}
          </button>

          <p style={{ color: 'var(--text)', fontSize: '1.05rem', fontWeight: 600 }}>
            {fase === 'gravando' ? mmss(duracao) : 'Toque para gravar'}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center' }}>
            {fase === 'gravando' ? 'Toque para parar (máx 1 min)' : 'Fale e converta sua voz em texto'}
          </p>
        </div>
      )}

      {/* Resultado: transcrição editável + ações */}
      {fase !== 'transcrevendo' && texto && (
        <>
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            rows={5}
            disabled={ocupado}
            style={{
              width: '100%', minHeight: 140, background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-card)',
              padding: 16, color: 'var(--text)', fontSize: '1.15rem', fontFamily: 'inherit',
              resize: 'vertical', outline: 'none', lineHeight: 1.6, opacity: ocupado ? 0.7 : 1,
            }}
          />

          {(erro || (estado === 'erro' && erroMsg)) && (
            <p style={{ color: 'var(--danger)', fontSize: '0.82rem', textAlign: 'center' }}>{erro || erroMsg}</p>
          )}

          <button
            className="btn-primary"
            disabled={!texto.trim() || ocupado}
            aria-label="Falar o texto"
            onClick={() => falar(texto)}
            style={{ minHeight: 64, fontSize: '1.1rem' }}
          >
            {estado === 'falando'
              ? <><Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} /> Falando…</>
              : <><Volume2 size={24} /> Falar</>}
          </button>

          <button
            disabled={!texto.trim() || ocupado}
            aria-label="Corrigir e falar"
            onClick={handleCorrigir}
            style={{
              minHeight: 56, width: '100%', border: '1px solid var(--brand-green)',
              borderRadius: 'var(--radius-btn)', background: 'transparent',
              color: texto.trim() && !ocupado ? 'var(--brand-green)' : 'var(--border)',
              fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: texto.trim() && !ocupado ? 'pointer' : 'not-allowed',
            }}
          >
            {estado === 'corrigindo'
              ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Corrigindo…</>
              : <><Wand2 size={18} /> Corrigir e Falar</>}
          </button>

          <button
            onClick={gravarDeNovo}
            disabled={ocupado}
            aria-label="Gravar de novo"
            style={{
              minHeight: 52, width: '100%', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-btn)', background: 'var(--surface)',
              color: 'var(--text-muted)', fontFamily: 'inherit', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: ocupado ? 'not-allowed' : 'pointer',
            }}
          >
            <RotateCcw size={18} /> Gravar de novo
          </button>
        </>
      )}

      {ultimoAudio && <FloatingShareButton audio={ultimoAudio} />}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
      `}</style>
    </div>
  )
}
