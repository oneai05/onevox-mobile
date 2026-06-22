import { useState } from 'react'
import { Share2, Loader2 } from 'lucide-react'

/**
 * Botão flutuante que aparece quando há um áudio gerado.
 * Compartilha o mp3 via Web Share API (mobile) com fallback de download (desktop).
 */
export default function FloatingShareButton({ audio }: { audio: Blob }) {
  const [busy, setBusy] = useState(false)

  async function compartilhar() {
    setBusy(true)
    try {
      const file = new File([audio], 'onevox-audio.mp3', { type: 'audio/mpeg' })
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: 'Áudio OneVox' })
      } else {
        const url = URL.createObjectURL(audio)
        const a = document.createElement('a')
        a.href = url
        a.download = 'onevox-audio.mp3'
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      }
    } catch { /* usuário cancelou o compartilhamento */ }
    setBusy(false)
  }

  return (
    <button
      onClick={compartilhar}
      aria-label="Compartilhar áudio"
      style={{
        position: 'fixed', right: 16, bottom: 80, zIndex: 20,
        width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer',
        background: 'linear-gradient(135deg, var(--grad-from), var(--grad-to))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 6px 18px rgba(0,0,0,0.4)',
      }}
    >
      {busy
        ? <Loader2 size={24} color="#0A1730" style={{ animation: 'spin 1s linear infinite' }} />
        : <Share2 size={24} color="#0A1730" strokeWidth={2.2} />}
    </button>
  )
}
