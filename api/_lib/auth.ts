import type { VercelRequest } from '@vercel/node'
import { supabaseAdmin } from './supabaseAdmin'

export async function requireAuth(req: VercelRequest) {
  const auth = (req.headers['authorization'] ?? '') as string
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) throw Object.assign(new Error('Unauthorized'), { status: 401 })

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) throw Object.assign(new Error('Unauthorized'), { status: 401 })

  return user
}
