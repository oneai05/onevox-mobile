#!/usr/bin/env node
//
// Cria/atualiza usuários de teste no Supabase e amarra a voz clonada de cada um.
//
// Uso:
//   1. Crie as vozes no ElevenLabs e copie o voice_id de cada uma.
//   2. Preencha scripts/testadores.json (veja scripts/testadores.exemplo.json):
//        [{ "nome": "Maria Silva", "voiceId": "xxxxxxxx" }, ...]
//      (email e senha são opcionais — se faltar, geramos automaticamente)
//   3. Rode (a partir da raiz do projeto):
//        node --env-file=.env scripts/criar-testadores.mjs
//   4. Anote as credenciais impressas e repasse a cada testador.
//      NÃO comite o testadores.json nem as credenciais (já estão no .gitignore).
//
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { randomInt } from 'node:crypto'

const URL = process.env.VITE_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('Faltam VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Rode com: node --env-file=.env ...')
  process.exit(1)
}

const supa = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } })

const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/(^\.|\.$)/g, '')

const ALFA = 'abcdefghijkmnpqrstuvwxyz23456789' // sem caracteres ambíguos
const gerarSenha = () => Array.from({ length: 10 }, () => ALFA[randomInt(ALFA.length)]).join('')

async function acharUsuarioPorEmail(email) {
  // lista paginada — suficiente para uma POC com poucos testadores
  const { data } = await supa.auth.admin.listUsers({ page: 1, perPage: 1000 })
  return data?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null
}

const testadores = JSON.parse(readFileSync(new URL('./testadores.json', import.meta.url)))

console.log('nome\temail\tsenha\tvoice_id\tstatus')
for (const t of testadores) {
  const email = (t.email ?? `${slug(t.nome)}@onevox.app`).toLowerCase()
  const senha = t.senha ?? gerarSenha()
  let userId, status

  const { data, error } = await supa.auth.admin.createUser({
    email, password: senha, email_confirm: true, user_metadata: { nome: t.nome },
  })

  if (error) {
    // provavelmente já existe — localiza e atualiza a senha
    const existente = await acharUsuarioPorEmail(email)
    if (!existente) { console.log(`${t.nome}\t${email}\t-\t${t.voiceId}\tERRO: ${error.message}`); continue }
    userId = existente.id
    await supa.auth.admin.updateUserById(userId, { password: senha, user_metadata: { nome: t.nome } })
    status = 'atualizado'
  } else {
    userId = data.user.id
    status = 'criado'
  }

  // perfil é criado pelo trigger handle_new_user; amarra voz + nome
  const { error: perr } = await supa.from('perfis')
    .update({ elevenlabs_voice_id: t.voiceId, nome: t.nome, ativo: true })
    .eq('id', userId)
  if (perr) status += ` (perfil: ${perr.message})`

  console.log(`${t.nome}\t${email}\t${senha}\t${t.voiceId}\t${status}`)
}

console.log('\nPronto. Repasse login+senha a cada testador. Eles acessam https://onevox-mobile.vercel.app')
