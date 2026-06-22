import { useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Keyboard, Mic, LayoutGrid, User } from 'lucide-react'
import { usePerfil, applyFontScale } from '../lib/usePerfil'

const tabs = [
  { to: 'teclado', icon: Keyboard,    label: 'Teclado' },
  { to: 'gravar',  icon: Mic,         label: 'Gravar'  },
  { to: 'frases',  icon: LayoutGrid,  label: 'Frases'  },
  { to: 'perfil',  icon: User,        label: 'Perfil'  },
]

export default function AppShell() {
  // aplica o tamanho de fonte salvo no perfil assim que carrega
  const { perfil } = usePerfil()
  useEffect(() => {
    if (perfil?.font_scale) applyFontScale(perfil.font_scale)
  }, [perfil?.font_scale])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>

      {/* Topbar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        flexShrink: 0,
      }}>
        <span className="brand" style={{ fontSize: '1.3rem' }}>
          One<span className="vox">Vox</span>
          <small>Mobile</small>
        </span>
      </header>

      {/* Conteudo com espaco para tab bar */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 88px' }}>
        <Outlet />
      </main>

      {/* Tab bar inferior */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: 'var(--surface-2)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        zIndex: 10,
      }}>
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            style={{ flex: 1, textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <span style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                color: isActive ? 'var(--brand-green)' : 'var(--text-muted)',
                fontSize: '0.68rem',
                fontWeight: isActive ? 600 : 400,
                minHeight: 64,
                transition: 'color 0.15s',
                width: '100%',
              }}>
                <Icon size={24} strokeWidth={isActive ? 2.2 : 1.8} />
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
