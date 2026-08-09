import Link from "next/link";

export default function Home() {
  const whatsAppNumber = "5521978308046";
  const whatsAppMessage = encodeURIComponent("Olá! Vi o sistema BelezaPro por R$ 50/mês, onde adiciono meus serviços e o sistema calcula tudo automático. Quero começar meu teste grátis de 3 dias!");
  const whatsAppUrl = `https://wa.me/${whatsAppNumber}?text=${whatsAppMessage}`;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-50 via-slate-50 to-white font-sans text-slate-800 flex flex-col justify-between">
      
      {/* HEADER / NAVEGAÇÃO */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-pink-100/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-xl flex items-center justify-center shadow-md shadow-pink-200">
              <span className="text-white text-xl font-extrabold">$</span>
            </div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight">Beleza<span className="text-pink-500">Pro</span></span>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              href="/login" 
              className="text-xs sm:text-sm font-bold text-slate-600 hover:text-pink-600 transition-colors"
            >
              Entrar
            </Link>
            <a 
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-pink-500 to-rose-400 text-white text-xs sm:text-sm font-extrabold px-4 sm:px-5 py-2.5 rounded-full shadow-lg shadow-pink-200 hover:shadow-xl active:scale-95 transition-all"
            >
              Testar Grátis
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION COMPACTA E PODEROSA */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12 text-center my-auto">
        
        {/* SELO DE DESTAQUE */}
        <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-amber-50 text-amber-700 font-extrabold text-xs sm:text-sm tracking-wide mb-6 border border-amber-200 shadow-sm animate-pulse">
          <span>🔥 3 Dias Grátis para Conhecer o Sistema</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          A agenda inteligente que <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">
            trabalha por você 24h.
          </span>
        </h1>

        {/* TEXTO ATUALIZADO EXPLICANDO O CÁLCULO DOS SERVIÇOS */}
        <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-2xl mx-auto font-medium">
          Adicione seus serviços, valores e o tempo de cada atendimento. <strong className="text-slate-900 font-bold">Assim nós calculamos todo o tempo restante e organizamos os horários para você</strong> por apenas <strong className="text-pink-600 font-extrabold">R$ 50 mensais</strong>.
        </p>

        {/* BOTÕES DE AÇÃO */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
          <a 
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-rose-400 text-white font-extrabold text-base sm:text-lg px-8 py-4 rounded-2xl shadow-xl shadow-pink-200 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.88-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.396-.272.322-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            Quero Testar 3 Dias Grátis
          </a>
          <Link 
            href="/login"
            className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 font-bold text-base sm:text-lg px-8 py-4 rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-center shadow-sm"
          >
            Acessar meu painel
          </Link>
        </div>

        {/* 3 BENEFÍCIOS RÁPIDOS EM CARDS LADO A LADO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-4xl mx-auto">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3.5">
            <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 font-bold">1</div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Cálculo Automático</h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Gerencie serviços, valores e o tempo restante sem esforço.</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3.5">
            <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 font-bold">2</div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Link no Instagram</h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Suas clientes agendam sozinhas direto pelo celular.</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3.5">
            <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 font-bold">3</div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Apenas R$ 50/mês</h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Sem taxa de adesão e sem fidelidade.</p>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER SIMPLES */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center px-4 mt-8">
        <p className="text-slate-400 text-xs sm:text-sm font-medium">
          © {new Date().getFullYear()} BelezaPro. Todos os direitos reservados.
        </p>
      </footer>

    </div>
  );
}