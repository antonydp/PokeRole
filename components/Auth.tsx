// components/Auth.tsx
import React, { useState } from 'react';
import { supabase } from '../src/services/supabaseClient.js';
import { PokeballIcon } from './Icons.js';

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const authMethod = isSignUp ? supabase.auth.signUp : supabase.auth.signInWithPassword;
        const { error } = await authMethod({ email, password });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage(isSignUp ? 'Registration successful! Please check your email to verify your account.' : '');
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
            <div className="w-full max-w-sm p-8 space-y-6 bg-slate-800 rounded-lg shadow-lg">
                <div className="text-center">
                    <PokeballIcon className="w-16 h-16 mx-auto text-poke-yellow" />
                    <h1 className="mt-4 text-3xl font-primary text-poke-yellow">Pokérole Team Builder</h1>
                    <p className="text-gray-400">{isSignUp ? 'Create a new account' : 'Sign in to your account'}</p>
                </div>
                {message && <p className={`text-center p-2 rounded ${message.includes('error') ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>{message}</p>}
                <form className="space-y-4" onSubmit={handleAuth}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-poke-blue"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-poke-blue"
                        required
                    />
                    <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-poke-blue text-white font-bold rounded-md hover:bg-blue-700 transition-colors disabled:bg-slate-600">
                        {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>
                <div className="text-center">
                    <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-poke-yellow hover:underline">
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;