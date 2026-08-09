"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

// Inicializa o cliente Supabase diretamente com as chaves públicas
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const router = useRouter();
  
  // Controle de tela: true = Login | false = Cadastro
  const [isLogin, setIsLogin] = useState(true);
  
  // Campos do formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      // LÓGICA DE ENTRAR (LOGIN)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
           alert("E-mail ou senha incorretos.");
        } else {
           alert("Erro ao fazer login: " + error.message);
        }
      } else {
        router.push("/admin"); // Manda para o painel
      }
    } else {
      // LÓGICA DE CRIAR CONTA (CADASTRO)
      if (!businessName || !whatsapp) {
        alert("Preencha o nome do estúdio e o WhatsApp!");
        setLoading(false);
        return;
      }

      // 1. Cria o usuário no sistema de autenticação do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${window.location.origin}/admin`,
        }
      });

      if (authError) {
        alert("Erro ao criar conta: " + authError.message);
      } else if (authData.user) {
        // 2. Gera um "slug" automático baseado no nome (Ex: "Studio Bela Unha" vira "studio-bela-unha")
        const slug = businessName
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Remove acentos
          .replace(/[^a-z0-9]+/g, "-") // Troca espaços por traços
          .replace(/(^-|-$)+/g, ""); 

        // TRAVA DE SEGURANÇA: Adiciona 4 números no final do slug para evitar duplicação no banco de dados!
        const finalSlug = slug + "-" + Date.now().toString().slice(-4);

        // 3. Salva os dados públicos do salão na tabela "profiles"
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: authData.user.id, // O mesmo ID da autenticação!
            business_name: businessName,
            slug: finalSlug, // Usa o slug blindado com os números no final
            whatsapp: whatsapp.replace(/\D/g, ""), // Salva só os números
          },
        ]);

        if (profileError) {
          console.error(profileError);
          alert("Conta criada, mas houve um erro ao configurar o perfil. Tente fazer login.");
        } else {
          // Sucesso no cadastro e perfil
          if (authData.user.identities?.length === 0) {
             alert("Cadastro quase lá! Verifique seu e-mail para confirmar a conta antes de acessar.");
          } else {
             alert("Bem-vinda ao BelezaPro! Sua conta foi criada com sucesso.");
             router.push("/admin"); // Manda para o painel
          }
        }
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-8 sm:p-10 border border-slate-100">
        
        <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20 mx-auto mb-6 ring-1 ring-white/10">
                <span className="text-white text-3xl font-black">$</span>
            </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            {isLogin ? "Olá, que bom te ver!" : "Comece agora"}
          </h1>
          <p className="text-slate-600 mt-3 text-base max-w-xs mx-auto">
            {isLogin 
              ? "Gerencie seus agendamentos de forma simples e profissional." 
              : "Crie sua agenda online personalizada em menos de 2 minutos."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Campos que só aparecem no Cadastro */}
          {!isLogin && (
            <>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800">Nome do seu Estúdio/Salão</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Studio Bela Unha"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 text-slate-950 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition outline-none text-base"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800">Seu WhatsApp (com DDD)</label>
                <input
                  type="tel"
                  required
                  placeholder="(21) 99999-9999"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 text-slate-950 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition outline-none text-base"
                />
              </div>
            </>
          )}

          {/* Campos comuns (Email e Senha) */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">E-mail</label>
            <input
              type="email"
              required
              placeholder="seu.melhor@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 text-slate-950 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition outline-none text-base"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">Senha</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 text-slate-950 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition outline-none text-base"
            />
            
            {isLogin && (
                <div className="text-right pt-1.5">
                    <Link href="/recuperar-senha" className="text-xs font-medium text-pink-600 hover:text-pink-500 transition-colors">
                        Esqueceu sua senha?
                    </Link>
                </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-lg py-4 rounded-2xl shadow-lg shadow-pink-500/20 hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-6"
          >
            {loading ? "Aguarde..." : (isLogin ? "Entrar na Minha Agenda" : "Criar Minha Conta Grátis")}
          </button>
        </form>

        {/* Botão para alternar entre Login e Cadastro */}
        <div className="mt-8 text-center border-t border-slate-100 pt-8">
          <p className="text-sm text-slate-600">
            {isLogin ? "Ainda não tem uma conta?" : "Já tem uma conta?"}
            <button 
              onClick={() => {
                  setIsLogin(!isLogin);
                  // Limpa os campos comuns ao alternar
                  setPassword("");
                  setEmail("");
              }}
              className="ml-2 text-pink-600 font-bold hover:text-pink-500 transition-colors"
            >
              {isLogin ? "Cadastre-se grátis" : "Faça login"}
            </button>
          </p>
        </div>

        <div className="mt-8 text-center text-slate-400 text-xs">
            © {new Date().getFullYear()} BelezaPro • Tecnologia para Salões
        </div>

      </div>
    </div>
  );
}