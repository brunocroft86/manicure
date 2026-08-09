import Link from "next/link";

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-pink-500 selection:text-white relative overflow-hidden flex flex-col justify-between">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-tr from-pink-600/10 to-rose-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20 ring-1 ring-white/20">
              <span className="text-white text-xl font-black">$</span>
            </div>
            <span className="text-xl font-black tracking-tight text-white">Beleza<span className="text-pink-500">Pro</span></span>
          </Link>
          
          <Link 
            href="/" 
            className="text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors"
          >
            &larr; Voltar para o início
          </Link>
        </div>
      </header>

      {/* CONTEÚDO DOS TERMOS */}
      <main className="max-w-4xl mx-auto px-4 py-16 relative z-10 space-y-10">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Termos de Uso e Política de Privacidade
          </h1>
          <p className="text-slate-400 text-sm">Última atualização: Agosto de 2026</p>
        </div>

        <div className="space-y-8 text-slate-300 leading-relaxed text-sm sm:text-base">
          
          <section className="bg-slate-900/50 p-6 sm:p-8 rounded-3xl border border-slate-800/80 space-y-3">
            <h2 className="text-xl font-bold text-white">1. Aceitação dos Termos</h2>
            <p>
              Ao assinar, acessar ou utilizar o sistema <strong>BelezaPro</strong>, você (doravante denominado "Cliente" ou "Assinante") concorda expressamente com os presentes Termos de Uso e com a nossa Política de Privacidade. Caso não concorde com qualquer disposição, por favor, abstenha-se de utilizar a plataforma.
            </p>
          </section>

          <section className="bg-slate-900/50 p-6 sm:p-8 rounded-3xl border border-slate-800/80 space-y-3">
            <h2 className="text-xl font-bold text-white">2. Sobre o Serviço</h2>
            <p>
              O BelezaPro é uma plataforma tecnológica em nuvem (SaaS) voltada para a gestão de agendamentos, horários e catálogos de serviços para estúdios, salões de beleza e profissionais autônomos. O sistema oferece ferramentas de automação, relatórios e páginas personalizadas de agendamento online.
            </p>
          </section>

          <section className="bg-slate-900/50 p-6 sm:p-8 rounded-3xl border border-slate-800/80 space-y-3">
            <h2 className="text-xl font-bold text-white">3. Período de Teste e Assinatura</h2>
            <p>
              Novos cadastros possuem direito a um período de teste gratuito de 3 (três) dias corridos. Após o encerramento deste período, o acesso aos recursos administrativos do painel será suspenso automaticamente até que a assinatura mensal (no valor vigente de R$ 50/mês) seja formalmente renovada e confirmada.
            </p>
          </section>

          <section className="bg-slate-900/50 p-6 sm:p-8 rounded-3xl border border-slate-800/80 space-y-3">
            <h2 className="text-xl font-bold text-white">4. Privacidade e Proteção de Dados (LGPD)</h2>
            <p>
              Em conformidade com a Lei Geral de Proteção de Dados (LGPD):
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>Coletamos apenas os dados essenciais para o funcionamento da plataforma (nome, e-mail, telefone e dados do estúdio).</li>
              <li>As informações inseridas no sistema não são comercializadas, alugadas ou compartilhadas com terceiros para fins publicitários.</li>
              <li>O assinante é responsável por garantir o consentimento de seus próprios clientes finais ao coletar dados para agendamento.</li>
            </ul>
          </section>

          <section className="bg-slate-900/50 p-6 sm:p-8 rounded-3xl border border-slate-800/80 space-y-3">
            <h2 className="text-xl font-bold text-white">5. Disponibilidade do Sistema</h2>
            <p>
              Nosso compromisso é manter a plataforma estável e acessível 24 horas por dia, 7 dias por semana. No entanto, manutenções programadas, atualizações de segurança ou instabilidades em servidores de infraestrutura terceirizados (como Supabase e Vercel) poderão ocorrer pontualmente.
            </p>
          </section>

          <section className="bg-slate-900/50 p-6 sm:p-8 rounded-3xl border border-slate-800/80 space-y-3">
            <h2 className="text-xl font-bold text-white">6. Contato</h2>
            <p>
              Dúvidas sobre estes termos ou sobre o tratamento de seus dados podem ser encaminhadas diretamente através dos nossos canais oficiais de suporte e atendimento via WhatsApp.
            </p>
          </section>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 text-center px-4 relative z-10 mt-12">
        <p className="text-slate-500 text-sm font-medium">
          © {new Date().getFullYear()} BelezaPro. Todos os direitos reservados.
        </p>
      </footer>

    </div>
  );
}