"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

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
        alert("Erro ao fazer login: " + error.message);
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
      });

      if (authError) {
        alert("Erro ao criar conta: " + authError.message);
      } else if (authData.user) {
        // 2. Gera um "slug" automático baseado no nome (Ex: "Espaço Beleza" vira "espaco-beleza")
        const slug = businessName
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Remove acentos
          .replace(/[^a-z0-9]+/g, "-") // Troca espaços por traços
          .replace(/(^-|-$)+/g, ""); 

        // 3. Salva os dados públicos do salão na tabela "profiles"
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: authData.user.id, // O mesmo ID da autenticação!
            business_name: businessName,
            slug: slug,
            whatsapp: whatsapp.replace(/\D/g, ""), // Salva só os números
          },
        ]);

        if (profileError) {
          console.error(profileError);
          alert("Conta criada, mas houve um erro ao configurar o perfil.");
        } else {
          alert("Conta criada com sucesso! Bem-vinda.");
          router.push("/admin"); // Manda para o painel
        }
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 border border-rose-100">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-rose-900">
            {isLogin ? "Bem-vinda de volta" : "Crie seu Estúdio"}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {isLogin 
              ? "Gerencie sua agenda e seus serviços." 
              : "A plataforma completa para profissionais da beleza."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Campos que só aparecem no Cadastro */}
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Estúdio / Salão</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Studio Bela Unha"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp para Contato</label>
                <input
                  type="tel"
                  required
                  placeholder="(00) 90000-0000"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                />
              </div>
            </>
          )}

          {/* Campos comuns (Email e Senha) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              required
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 text-white font-medium py-3 rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 mt-4 shadow-md shadow-rose-200"
          >
            {loading ? "Aguarde..." : (isLogin ? "Entrar no Painel" : "Cadastrar meu Estúdio")}
          </button>
        </form>

        {/* Botão para alternar entre Login e Cadastro */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "Ainda não tem uma conta?" : "Já tem uma conta?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-rose-600 font-semibold hover:underline"
            >
              {isLogin ? "Cadastre-se grátis" : "Faça login"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}