import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

export default function SupabaseTest() {
  const [status, setStatus] = useState('Verificando conexão...')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          setStatus('Erro de conexão: ' + error.message)
          return
        }

        setStatus(
          data.session
            ? 'Conectado ao Supabase: sessão ativa'
            : 'Conectado ao Supabase: sem sessão'
        )
      } catch (err) {
        setStatus('Erro inesperado: ' + (err?.message || 'desconhecido'))
      }
    }

    checkConnection()
  }, [])

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const handleSignUp = async () => {
    if (loading) return

    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()

    if (!cleanEmail || !cleanPassword) {
      alert('Preencha e-mail e senha.')
      return
    }

    if (!isValidEmail(cleanEmail)) {
      alert('Digite um e-mail válido.')
      return
    }

    if (cleanPassword.length < 6) {
      alert('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
      })

      if (error) {
        alert('Erro ao cadastrar: ' + error.message)
        return
      }

      const user = data?.user

      if (!user) {
        alert('Cadastro iniciado, mas nenhum usuário foi retornado.')
        return
      }

      // Tenta criar perfil se a tabela profiles existir
      // Se não existir, o Auth continua funcionando normalmente
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            email: user.email,
            created_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )

      if (profileError) {
        console.warn('Usuário criado no Auth, mas profile não foi criado:', profileError.message)

        alert(
          'Usuário criado no Auth com sucesso, mas não foi possível criar o perfil em "profiles". Verifique se a tabela existe e se o RLS/políticas permitem insert.'
        )
        return
      }

      alert(
        'Usuário criado com sucesso no Auth e em profiles. Verifique o e-mail, se a confirmação estiver ativada.'
      )

      setEmail('')
      setPassword('')
    } catch (err) {
      alert('Erro inesperado: ' + (err?.message || 'desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded bg-gray-100 m-4 fixed bottom-4 right-4 z-50 max-w-sm shadow-lg">
      <h2 className="text-xl font-bold mb-2 text-black">Supabase Tester</h2>

      <p className="mb-4 text-sm text-gray-700">
        Status: <span className="font-mono">{status}</span>
      </p>

      <div className="flex flex-col gap-2 mb-2">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded text-black"
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded text-black"
          disabled={loading}
        />

        <button
          onClick={handleSignUp}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Criando usuário...' : 'Sign Up Test User'}
        </button>
      </div>
    </div>
  )
}