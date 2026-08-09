"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegisterPage() {
  const router = useRouter();
  
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // Cria o slug amigável baseado no nome do salão (ex: "Studio Bela" -> "studio-bela")
    const slug = businessName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");

    // 1. Cria o usuário no Auth do Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setErrorMsg(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Insere os dados complementares na tabela profiles (com os 3 dias de padrão que definimos no banco)
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: authData.user.id,
            business_name: businessName,
            slug: slug || `studio-${Math.random().toString(36).substring(7)}`,
          }
        ]);

      if (profileError) {
        setErrorMsg("Erro ao criar perfil do estúdio: " + profileError.message);
        setLoading(false);
      } else {
        router.push("/admin");
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-pink-600/15 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="bg-slate-900 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full border border-slate-800 relative z-10">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-pink-500/20 mb-4 ring-1 ring-white/20">
            <span className="text-white text-3xl font-black">$</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Criar sua Conta</h1>
          <p className="text-slate-400 text-sm font-medium">Comece seus 3 dias de teste grátis agora.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {errorMsg && (
            <div className="bg-red-500/10 text-red-400 text-sm font-bold p-4 rounded-xl text-center border border-red-500/20">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 pl-1">Nome do Estúdio / Salão</label>
            <input 
              type="text" 
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Ex: Studio Bella Unhas"
              className="w-full px-5 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500 transition-all text-white font-medium text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 pl-1">E-mail Profissional</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-5 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500 transition-all text-white font-medium text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 pl-1">Senha de Acesso</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              className="w-full px-5 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500 transition-all text-white font-medium text-sm"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-base py-4 rounded-2xl shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 active:scale-[0.98] transition-all mt-4 cursor-pointer"
          >
            {loading ? "Criando Conta..." : "Iniciar Teste Grátis de 3 Dias"}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-800 pt-6">
          <p className="text-sm text-slate-400 font-medium">
            Já tem uma conta? <br/>
            <Link href="/login" className="text-pink-400 font-bold hover:underline mt-1 inline-block">
              Fazer Login no Painel
            </Link>
          </p>
        </div>
        
        <div className="mt-4 text-center">
          <Link href="/" className="text-xs font-bold text-slate-500 hover:text-slate-400 transition-colors">
            &larr; Voltar para a página inicial
          </Link>
        </div>

      </div>
    </div>
  );
}