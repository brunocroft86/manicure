"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

// Inicializa o cliente Supabase diretamente
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // O Supabase envia o e-mail de recuperação. redirectTo deve estar configurado no Supabase Dash.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/atualizar-senha`,
    });

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: "Erro ao enviar e-mail. Verifique se o e-mail está correto." });
    } else {
      setMessage({ type: 'success', text: "E-mail de recuperação enviado! Verifique sua caixa de entrada (e spam)." });
      setEmail(""); // Limpa o campo
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 font-sans">
      <div className="max-w-md w-full bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl shadow-pink-500/10">
        
        <Link href="/login" className="text-sm text-pink-400 hover:text-pink-300 mb-8 inline-block font-medium">
          &larr; Voltar para o login
        </Link>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20 mx-auto mb-6 ring-1 ring-white/10">
            <span className="text-white text-3xl font-black">?</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Esqueceu sua senha?</h1>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Digite seu e-mail abaixo e enviaremos um link mágico para você definir uma nova senha.
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium border ${message.type === 'success' ? 'bg-green-950/50 border-green-800 text-green-300' : 'bg-red-950/50 border-red-800 text-red-300'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">E-mail cadastrado</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition outline-none text-base"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Enviando..." : "Enviar link de recuperação"}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-600 text-xs border-t border-slate-800 pt-6">
            © BelezaPro • Acesso seguro
        </div>
      </div>
    </div>
  );
}