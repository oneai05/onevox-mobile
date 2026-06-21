import { LayoutGrid } from 'lucide-react'

export default function Frases() {
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
        borderRadius: 'var(--radius-tile)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <LayoutGrid size={40} color="var(--text-muted)" strokeWidth={1.5} />
      </div>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.95rem' }}>
        Frases rápidas — em breve (Fase 6)
      </p>
    </div>
  )
}
