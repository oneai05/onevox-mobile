import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import AppShell from './pages/AppShell'
import Teclado from './pages/Teclado'
import Gravar from './pages/Gravar'
import Frases from './pages/Frases'
import Perfil from './pages/Perfil'

function PrivateRoute({ session, children }: { session: Session | null; children: React.ReactNode }) {
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  // undefined = ainda carregando; null = sem sessao; Session = autenticado
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return null

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={session ? <Navigate to="/app/teclado" replace /> : <Login />}
        />
        <Route
          path="/app"
          element={
            <PrivateRoute session={session}>
              <AppShell />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="teclado" replace />} />
          <Route path="teclado" element={<Teclado />} />
          <Route path="gravar"  element={<Gravar />} />
          <Route path="frases"  element={<Frases />} />
          <Route path="perfil"  element={<Perfil />} />
        </Route>
        <Route path="*" element={<Navigate to={session ? '/app/teclado' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
