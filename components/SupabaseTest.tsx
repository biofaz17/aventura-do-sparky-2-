import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

export default function SupabaseTest() {
    const [status, setStatus] = useState('Checking connection...')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    useEffect(() => {
        supabase.auth.getSession().then(({ data, error }) => {
            if (error) setStatus('Error connecting: ' + error.message)
            else setStatus('Connected to Supabase project: ' + (data.session ? 'Session active' : 'No session'))
        })
    }, [])

    const handleSignUp = async () => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })
        if (error) alert('Error signing up: ' + error.message)
        else alert('User signed up! Check your email (or users table if confirmation disabled).')
    }

    return (
        <div className="p-4 border rounded bg-gray-100 m-4 fixed bottom-4 right-4 z-50 max-w-sm shadow-lg">
            <h2 className="text-xl font-bold mb-2 text-black">Supabase Tester</h2>
            <p className="mb-4 text-sm text-gray-700">Status: <span className="font-mono">{status}</span></p>
            <div className="flex flex-col gap-2 mb-2">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="border p-2 rounded text-black"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="border p-2 rounded text-black"
                />
                <button
                    onClick={handleSignUp}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold"
                >
                    Sign Up Test User
                </button>
            </div>
        </div>
    )
}
