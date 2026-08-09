"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Inicializa o cliente Supabase diretamente
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AtualizarSenhaPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isValidating, setIsValidating] = useState(true); // Estado para validar o token
  
  const router = useRouter();

  // Ao carregar a página, o Supabase verifica se o hash da URL é um token de recuperação válido
  useEffect(() => {
    const checkSession = async () => {
        // Pega a sessão atual, que o Supabase estabelece automaticamente através do token na URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
             // Se não houver sessão, o token expirou ou é inválido
             setMessage({ type: 'error', text: "Link de recuperação inválido ou expirado. Solicite um novo." });
        }
        // Se houver sessão, o token é válido e a usuária está autenticada temporariamente para trocar a senha
        setIsValidating(false);
    };
    checkSession();
  }, []);


  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      return setMessage({ type: 'error', text: "As senhas não coincidem." });
    }

    if (password.length < 6) {
        return setMessage({ type: 'error', text: "A senha deve ter pelo menos 6 caracteres." });
    }

    setLoading(true);

    // Atualiza a senha do usuário logado
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: "Erro ao atualizar senha: " + error.message });
    } else {
      setMessage({ type: 'success', text: "Senha atualizada com sucesso! Redirecionando para o login..." });
      
      // Logout automático por segurança e redireciona para o login após 2 segundos
      await supabase.auth.signOut();
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  // Tela de carregamento/validação do token
  if (isValidating) {
       return ( <div className="min-h-screen bg-slate-950 flex items-center justify-center text-pink-500 font-extrabold animate-pulse">Validando link...</div> );
  }

  // Tela de erro se o token for inválido
  if (message?.type === 'error' && !loading && !password) {
       return (
            <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
                 <div className="bg-red-950/50 border border-red-800 p-8 rounded-2xl text-center max-w-md">
                      <h2 className="text-xl font-bold text-red-300 mb-3">Ops...</h2>
                      <p className="text-red-400 text-sm mb-6">{message.text}</p>
                      <Link href="/recuperar-senha" className="bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold inline-block">
                           Solicitar nova recuperação
                      </Link>
                 </div>
            </div>
       );
  }


  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 font-sans">
      <div className="max-w-md w-full bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl shadow-pink-500/10">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mx-auto mb-6 ring-1 ring-white/10">
            <span className="text-white text-3xl font-black">✔</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Defina sua nova senha</h1>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Quase lá! Crie uma senha forte e segura para acessar sua agenda.
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium border ${message.type === 'success' ? 'bg-green-950/50 border-green-800 text-green-300' : 'bg-red-950/50 border-red-800 text-red-300'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nova senha (mínimo 6 caracteres)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none text-base"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirmar nova senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none text-base"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Atualizando..." : "Atualizar senha e acessar"}
          </button>
        </form>
      </div>
    </div>
  );
}