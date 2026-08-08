"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const whatsAppNumber = "5521978308046";
  const whatsAppMessage = encodeURIComponent("Olá! Estou na tela de login do BelezaPro e quero contratar o sistema para o meu salão!");
  const whatsAppUrl = `https://wa.me/${whatsAppNumber}?text=${whatsAppMessage}`;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("E-mail ou senha incorretos.");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-xl max-w-md w-full border border-white">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-2xl mx-auto flex items-center justify-center shadow-md shadow-pink-200 mb-4">
            <span className="text-white text-3xl font-extrabold">$</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Área do Cliente</h1>
          <p className="text-slate-500 text-sm font-medium">Acesse o painel do seu estúdio.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-xl text-center border border-red-100">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 pl-1">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-300 transition-all text-slate-900 font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 pl-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-300 transition-all text-slate-900 font-medium"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-extrabold text-lg py-4 rounded-2xl shadow-lg shadow-pink-200 hover:shadow-xl active:scale-[0.98] transition-all mt-2"
          >
            {loading ? "Entrando..." : "Entrar no Painel"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-500 font-medium">
            Ainda não tem o sistema? <br/>
            <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" className="text-pink-600 font-bold hover:underline mt-1 inline-block">
              Fale conosco no WhatsApp
            </a>
          </p>
        </div>
        
        <div className="mt-4 text-center">
          <Link href="/" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
            &larr; Voltar para a página inicial
          </Link>
        </div>

      </div>
    </div>
  );
}