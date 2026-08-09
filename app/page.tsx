import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-pink-500 selection:text-white relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-tr from-pink-600/20 to-rose-500/20 blur-[120px] rounded-full pointer-events-none"></div>

      {/* HEADER / NAVEGAÇÃO */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20 ring-1 ring-white/20">
              <span className="text-white text-2xl font-black">$</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-white">Beleza<span className="text-pink-500">Pro</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2"
            >
              Entrar
            </Link>
            <Link 
              href="/cadastro"
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Testar Grátis
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="relative z-10 pt-12 pb-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* Badge de Destaque */}
          <div className="inline-flex items-center gap-2.5 py-1.5 px-5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 font-bold text-xs sm:text-sm tracking-wide mb-8 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping"></span>
            <span>3 Dias de Teste Grátis • Sem Cartão de Crédito</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-8">
            A agenda inteligente que <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500">
              trabalha por você 24h.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-3xl mx-auto font-normal leading-relaxed">
            Dê ao seu estúdio a sofisticação que ele merece. Adicione seus serviços, horários e deixe que o nosso sistema calcule todo o fluxo e organize sua agenda de forma automatizada por apenas <strong className="text-white font-bold">R$ 50/mês</strong>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link 
              href="/cadastro"
              className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-lg px-8 py-4 rounded-2xl shadow-xl shadow-pink-500/30 hover:shadow-pink-500/50 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quero Testar 3 Dias Grátis
            </Link>
            <Link 
              href="/login"
              className="w-full sm:w-auto bg-slate-900 text-slate-200 border border-slate-800 font-bold text-lg px-8 py-4 rounded-2xl hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center shadow-lg"
            >
              Acessar meu painel
            </Link>
          </div>

          {/* GRID DE RECURSOS PROFISSIONAIS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto pt-8 border-t border-slate-900">
            
            <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 hover:border-pink-500/50 transition-all group">
              <div className="w-12 h-12 bg-pink-500/10 text-pink-400 rounded-2xl flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Cálculo de Horários</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Insira a duração de cada procedimento. O sistema bloqueia os intervalos e impede qualquer choque de horários na agenda.
              </p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 hover:border-pink-500/50 transition-all group">
              <div className="w-12 h-12 bg-pink-500/10 text-pink-400 rounded-2xl flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Sua Logo e Identidade</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Personalize o sistema com o nome do seu estúdio e sua própria logomarca. Um aplicativo exclusivo para suas clientes.
              </p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 hover:border-pink-500/50 transition-all group">
              <div className="w-12 h-12 bg-pink-500/10 text-pink-400 rounded-2xl flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Link no Instagram</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Coloque o link direto na biografia. Suas clientes agendam sozinhas 24 horas por dia, sem ocupar o seu WhatsApp.
              </p>
            </div>

          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 text-center px-4 relative z-10">
        <p className="text-slate-500 text-sm font-medium">
          © {new Date().getFullYear()} BelezaPro. Todos os direitos reservados.
        </p>
      </footer>

    </div>
  );
}