import { Mic } from 'lucide-react'

export default function Gravar() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
      minHeight: 300,
    }}>
      <div style={{
        width: 96,
        height: 96,
        borderRadius: '50%',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Mic size={40} color="var(--text-muted)" strokeWidth={1.5} />
      </div>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.95rem' }}>
        Gravação de áudio — em breve (Fase 5)
      </p>
    </div>
  )
}
