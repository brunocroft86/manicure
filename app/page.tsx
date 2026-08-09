import Link from "next/link";

export default function Home() {
  const whatsAppNumber = "5521978308046";
  const whatsAppMessage = encodeURIComponent("Olá! Vi o sistema BelezaPro no site e gostaria de contratar para o meu salão. Como funciona?");
  const whatsAppUrl = `https://wa.me/${whatsAppNumber}?text=${whatsAppMessage}`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* HEADER / NAVEGAÇÃO */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-pink-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-xl flex items-center justify-center shadow-md shadow-pink-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <span className="text-2xl font-extrabold tracking-tight">Beleza<span className="text-pink-500">Pro</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-bold text-slate-600 hover:text-pink-600 transition-colors hidden sm:block"
            >
              Já sou cliente (Login)
            </Link>
            <a 
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-pink-500 to-rose-400 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg shadow-pink-200 hover:shadow-xl active:scale-95 transition-all"
            >
              Contratar Sistema
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-white pt-16 pb-24 sm:pt-24 sm:pb-32 px-4">
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-pink-50 to-transparent"></div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <span className="inline-block py-1.5 px-4 rounded-full bg-pink-100 text-pink-600 font-bold text-xs sm:text-sm tracking-wide mb-6 border border-pink-200">
              A Revolução do seu Salão
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8">
              A agenda inteligente que <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">
                trabalha por você 24h.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium">
              Elimine a bagunça do WhatsApp, acabe com os choques de horários e dê aos seus clientes uma experiência de agendamento premium e profissional.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-rose-400 text-white font-extrabold text-lg px-8 py-4 rounded-2xl shadow-xl shadow-pink-200 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.88-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.396-.272.322-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                Quero o BelezaPro
              </a>
              <Link 
                href="/login"
                className="w-full sm:w-auto bg-slate-100 text-slate-700 font-bold text-lg px-8 py-4 rounded-2xl hover:bg-slate-200 transition-colors flex items-center justify-center"
              >
                Acessar meu painel
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="bg-slate-50 py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-16">
              Por que os melhores estúdios usam o BelezaPro?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Fim do Choque de Horários</h3>
                <p className="text-slate-600 leading-relaxed">
                  O sistema calcula automaticamente a duração de cada serviço e bloqueia a agenda inteligente.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Link Exclusivo</h3>
                <p className="text-slate-600 leading-relaxed">
                  Tenha um link personalizado com o nome e a logo do seu estúdio. Coloque no link da bio do Instagram e veja os agendamentos caírem no automático.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Controle Total</h3>
                <p className="text-slate-600 leading-relaxed">
                  Defina seu horário de almoço, feche a agenda quando quiser com apenas um clique e organize seu catálogo de preços facilmente pelo celular.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto bg-slate-900 rounded-[2.5rem] p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500 rounded-full blur-[80px] opacity-20 -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-400 rounded-full blur-[80px] opacity-20 -ml-20 -mb-20"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
                Pronta para profissionalizar seu estúdio?
              </h2>
              <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto">
                As vagas para novos cadastros são limitadas. Fale comigo agora pelo WhatsApp para liberar o acesso do seu salão ao sistema.
              </p>
              <a 
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-extrabold text-lg px-10 py-5 rounded-2xl shadow-xl hover:scale-105 transition-transform"
              >
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-100 py-8 text-center px-4">
        <p className="text-slate-400 text-sm font-medium">
          © {new Date().getFullYear()} BelezaPro. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}