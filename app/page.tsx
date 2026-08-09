import Link from "next/link";

export default function Home() {
  const whatsAppNumber = "5521978308046";
  const whatsAppMessage = encodeURIComponent("Olá! Conheci o BelezaPro e quero começar meu teste grátis de 3 dias no meu salão por R$ 50/mês!");
  const whatsAppUrl = `https://wa.me/${whatsAppNumber}?text=${whatsAppMessage}`;

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
            <a 
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Testar Grátis
            </a>
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
            <a 
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-lg px-8 py-4 rounded-2xl shadow-xl shadow-pink-500/30 hover:shadow-pink-500/50 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.88-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.396-.272.322-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              Quero Testar 3 Dias Grátis
            </a>
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