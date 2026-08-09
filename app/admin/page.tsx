"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function getTodayBrazil() {
  const d = new Date();
  d.setHours(d.getHours() - 3);
  return d.toISOString().split('T')[0];
}

export default function AdminDashboard() {
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [isExpired, setIsExpired] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<"catalogo" | "agenda" | "config">("catalogo");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [appointments, setAppointments] = useState<any[]>([]);
  const [filterDate, setFilterDate] = useState(getTodayBrazil());
  const [blockLoading, setBlockLoading] = useState(false);

  const [startHour, setStartHour] = useState("9");
  const [endHour, setEndHour] = useState("18");
  const [savingConfig, setSavingConfig] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [copied, setCopied] = useState(false);

  // SUPORTE CENTRALIZADO (SEU NÚMERO NOVO)
  const supportPhone = "5521920041540";
  const supportMessage = encodeURIComponent(`Olá! Sou do estúdio *${profile?.business_name || ''}* e preciso de ajuda com o sistema BelezaPro.`);
  const supportUrl = `https://wa.me/${supportPhone}?text=${supportMessage}`;

  // Links de renovação/ativação usando o mesmo número de suporte
  const whatsAppMessageExpired = encodeURIComponent(`Olá! Minha assinatura do BelezaPro no estúdio *${profile?.business_name || ''}* venceu. Gostaria de renovar meu plano mensal!`);
  const whatsAppUrlExpired = `https://wa.me/${supportPhone}?text=${whatsAppMessageExpired}`;

  const whatsAppMessageActivate = encodeURIComponent(`Olá! Estou gostando do BelezaPro no estúdio *${profile?.business_name || ''}* e quero ativar minha assinatura oficial agora!`);
  const whatsAppUrlActivate = `https://wa.me/${supportPhone}?text=${whatsAppMessageActivate}`;

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push("/login");
      return;
    }
    
    setUser(session.user);
    
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      
      if (profileData.subscription_expires_at) {
        const expireDate = new Date(profileData.subscription_expires_at);
        const today = new Date();
        
        if (today > expireDate) {
          setIsExpired(true);
        } else {
          const diffTime = expireDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysRemaining(diffDays);
        }
      } else {
        setIsExpired(true); 
      }
      
      if (profileData.start_hour) setStartHour(String(profileData.start_hour));
      if (profileData.end_hour) setEndHour(String(profileData.end_hour));
      
      fetchServices(session.user.id);
      fetchAppointments(session.user.id);
    }
    
    setAuthLoading(false);
  }

  async function fetchServices(profileId: string) {
    const { data } = await supabase.from("services").select("*").eq("profile_id", profileId).order("created_at", { ascending: false });
    if (data) setServices(data);
  }

  async function fetchAppointments(profileId: string) {
    const { data } = await supabase.from("appointments").select("*, service:services(name, price)").eq("profile_id", profileId).order("start_time", { ascending: true });
    if (data) setAppointments(data);
  }

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value.replace(/\D/g, "");
    if (!value) { setPrice(""); return; }
    const floatValue = parseFloat(value) / 100;
    setPrice(floatValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
  }

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price || !duration) return alert("Preencha todos os campos!");
    setLoading(true);
    const numericPrice = parseFloat(price.replace(/[^\d,-]/g, "").replace(",", "."));
    const { error } = await supabase.from("services").insert([{ profile_id: user.id, name, price: numericPrice, duration_minutes: parseInt(duration) }]);
    setLoading(false);
    if (!error) { setName(""); setPrice(""); setDuration(""); fetchServices(user.id); }
  }

  async function handleDeleteService(id: string) {
    if (!window.confirm("Apagar este serviço?")) return;
    await supabase.from("services").delete().eq("id", id);
    fetchServices(user.id);
  }

  async function handleUpdateStatus(id: string, newStatus: string) {
    await supabase.from("appointments").update({ status: newStatus }).eq("id", id);
    fetchAppointments(user.id);
  }

  async function handleDeleteAppointment(id: string) {
    if (!window.confirm("Deseja realmente excluir/desbloquear este item?")) return;
    await supabase.from("appointments").delete().eq("id", id);
    fetchAppointments(user.id);
  }

  async function handleToggleGridBlock(time: string, isBlocked: boolean, blockId: string | null, isBooked: boolean) {
    if (isBooked) return alert("Horário já ocupado por uma cliente. Cancele primeiro se precisar bloquear.");
    setBlockLoading(true);
    if (isBlocked && blockId) {
      await supabase.from("appointments").delete().eq("id", blockId);
    } else {
      const startDateTimeString = `${filterDate}T${time}:00`;
      const [h, m] = time.split(":").map(Number);
      const startMins = (h * 60) + m;
      const endMins = startMins + 30; 
      const endH = Math.floor(endMins / 60);
      const endM = endMins % 60;
      const endDateTimeString = `${filterDate}T${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;
      const safeServiceId = services.length > 0 ? services[0].id : null;

      await supabase.from("appointments").insert([{
        profile_id: user.id, service_id: safeServiceId, client_name: "🔒 BLOQUEIO", client_phone: "00000000000", start_time: startDateTimeString, end_time: endDateTimeString, status: "Bloqueado",
      }]);
    }
    await fetchAppointments(user.id);
    setBlockLoading(false);
  }

  async function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault();
    setSavingConfig(true);
    const { error } = await supabase.from("profiles").update({ start_hour: parseInt(startHour), end_hour: parseInt(endHour) }).eq("id", user.id);
    setSavingConfig(false);
    if (error) alert("Erro ao salvar horários.");
    else alert("Horários atualizados com sucesso!");
  }

  async function handleUploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('logos').upload(fileName, file);
    if (uploadError) { alert('Erro ao enviar imagem: ' + uploadError.message); setUploadingLogo(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(fileName);
    await supabase.from('profiles').update({ logo_url: publicUrl }).eq('id', user.id);
    setProfile({ ...profile, logo_url: publicUrl });
    setUploadingLogo(false);
    alert("Logo atualizada com sucesso!");
  }

  function handleCopyLink() {
    const publicUrl = `${window.location.origin}/agendar/${profile?.slug}`;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (authLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
        <div className="text-slate-500 font-medium text-sm animate-pulse">Carregando painel...</div>
      </div>
    </div>
  );

  if (isExpired) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-[2rem] max-w-lg w-full text-center shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="absolute top-0 inset-x-0 h-2 bg-red-500"></div>
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">Acesso Suspenso</h1>
          <p className="text-slate-500 text-base mb-8 leading-relaxed">
            Sua assinatura do BelezaPro expirou. Renove agora para reativar seu sistema, recuperar seus agendamentos e continuar recebendo clientes online.
          </p>
          <a 
            href={whatsAppUrlExpired} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-green-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.88-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.396-.272.322-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
            Renovar pelo WhatsApp
          </a>
          <button onClick={handleLogout} className="text-slate-400 font-bold hover:text-slate-600 transition-colors text-sm">
            Sair da conta
          </button>
        </div>
      </div>
    );
  }

  const filteredAppointments = appointments.filter(appt => {
    if (!filterDate) return true;
    const apptDate = appt.start_time?.split("T")[0];
    return apptDate === filterDate;
  });

  const availableHours = [];
  for (let i = parseInt(startHour); i < parseInt(endHour); i++) {
    availableHours.push(`${String(i).padStart(2, '0')}:00`);
    availableHours.push(`${String(i).padStart(2, '0')}:30`);
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      
      {/* HEADER PREMIUM BLUR */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors md:hidden focus:outline-none"
              aria-label="Abrir Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-pink-600 to-rose-500 rounded-xl flex items-center justify-center shadow-md shadow-pink-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Beleza<span className="text-pink-600">Pro</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-sm font-bold text-slate-600 hidden sm:inline">{profile?.business_name}</span>
            
            {/* BOTÃO DE SUPORTE RÁPIDO NO TOPO */}
            <a 
              href={supportUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 border border-green-200 shadow-sm"
              title="Falar com o Suporte"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.88-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.396-.272.322-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
              <span>Suporte</span>
            </a>

            <button onClick={handleLogout} className="text-xs text-slate-400 bg-slate-100 hover:bg-slate-200 hover:text-slate-600 px-3.5 py-2.5 rounded-full font-bold transition-all active:scale-95">Sair</button>
          </div>
        </div>

        {/* NAVEGAÇÃO DESKTOP */}
        <div className="hidden md:flex max-w-7xl mx-auto px-6 gap-8 pt-1">
          <button onClick={() => setActiveTab("catalogo")} className={`pb-4 text-sm font-bold border-b-2 transition-all ${activeTab === "catalogo" ? "border-pink-600 text-pink-600" : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"}`}>Catálogo de Serviços</button>
          <button onClick={() => setActiveTab("agenda")} className={`pb-4 text-sm font-bold border-b-2 transition-all ${activeTab === "agenda" ? "border-pink-600 text-pink-600" : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"}`}>Agenda e Horários</button>
          <button onClick={() => setActiveTab("config")} className={`pb-4 text-sm font-bold border-b-2 transition-all ${activeTab === "config" ? "border-pink-600 text-pink-600" : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"}`}>Configurações</button>
        </div>

        {/* MENU MOBILE */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-2xl py-5 px-6 space-y-3 animate-in slide-in-from-top duration-200 z-50">
            <div className="pb-3 mb-3 border-b border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Logado como</p>
              <p className="text-lg font-black text-slate-800">{profile?.business_name}</p>
            </div>

            <button 
              onClick={() => { setActiveTab("catalogo"); setMobileMenuOpen(false); }}
              className={`w-full text-left py-3.5 px-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-3 ${activeTab === "catalogo" ? "bg-pink-50 text-pink-600" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <span className="text-lg">🛍️</span> Catálogo de Serviços
            </button>
            <button 
              onClick={() => { setActiveTab("agenda"); setMobileMenuOpen(false); }}
              className={`w-full text-left py-3.5 px-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-3 ${activeTab === "agenda" ? "bg-pink-50 text-pink-600" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <span className="text-lg">📅</span> Agenda e Horários
            </button>
            <button 
              onClick={() => { setActiveTab("config"); setMobileMenuOpen(false); }}
              className={`w-full text-left py-3.5 px-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-3 ${activeTab === "config" ? "bg-pink-50 text-pink-600" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <span className="text-lg">⚙️</span> Configurações
            </button>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* BANNER DINÂMICO DE VENCIMENTO / TESTE GRÁTIS */}
        {profile?.subscription_expires_at && (
          <div className={`px-5 py-4 sm:py-5 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-medium border shadow-sm ${
            (daysRemaining !== null && daysRemaining <= 3) 
              ? "bg-amber-50 border-amber-200 text-amber-800" 
              : "bg-blue-50 border-blue-200 text-blue-700"
          }`}>
            {(daysRemaining !== null && daysRemaining <= 3) ? (
              <>
                <div className="flex items-center gap-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span><strong>Período de Teste:</strong> Restam {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}.</span>
                </div>
                <a 
                  href={whatsAppUrlActivate}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-amber-200 w-full sm:w-auto text-center active:scale-95"
                >
                  Ativar Assinatura
                </a>
              </>
            ) : (
              <div className="flex items-center justify-center gap-2.5 w-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Assinatura ativa até: <strong>{new Date(profile.subscription_expires_at).toLocaleDateString('pt-BR')}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* CARTÃO DE LINK DO ESTÚDIO */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 sm:p-8 text-white shadow-xl shadow-slate-200/50 mb-10 flex flex-col sm:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="relative z-10 flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">Link do seu Estúdio</h2>
              <p className="text-slate-300 text-sm mt-1 font-medium">Envie para suas clientes agendarem horários.</p>
            </div>
          </div>
          <button onClick={handleCopyLink} className="relative z-10 w-full sm:w-auto bg-white text-slate-900 hover:text-pink-600 font-bold px-6 py-3.5 rounded-xl shadow-lg hover:bg-slate-50 active:scale-95 transition-all text-sm whitespace-nowrap cursor-pointer flex items-center justify-center gap-2">
            {copied ? (
              <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> Copiado!</>
            ) : "Copiar Link"}
          </button>
        </div>

        {/* === ABA CATÁLOGO === */}
        {activeTab === "catalogo" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
              <div className="w-full lg:w-1/3">
                <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-200/60 lg:sticky lg:top-28">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <span className="bg-pink-50 text-pink-600 p-2 rounded-xl"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg></span>
                    Novo Serviço
                  </h3>
                  <form onSubmit={handleAddService} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">Nome do Serviço</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none text-base transition-all" placeholder="Ex: Unha de Gel" />
                    </div>
                    <div className="flex gap-4">
                      <div className="w-1/2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">Valor</label>
                        <input type="text" inputMode="numeric" value={price} onChange={handlePriceChange} className="w-full px-5 py-4 bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none text-base transition-all" placeholder="R$ 0,00" />
                      </div>
                      <div className="w-1/2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">Minutos</label>
                        <input type="number" inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-5 py-4 bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none text-base transition-all" placeholder="60" />
                      </div>
                    </div>
                    <div className="pt-2">
                      <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all text-base cursor-pointer">
                        {loading ? "Salvando..." : "Adicionar Serviço"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="w-full lg:w-2/3">
                <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-200/60">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Catálogo Ativo</h3>
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200">{services.length} ativos</span>
                  </div>
                  <div className="space-y-4">
                    {services.length === 0 && <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200"><p className="text-slate-400 font-medium">Nenhum serviço cadastrado ainda.</p></div>}
                    {services.map((service) => (
                      <div key={service.id} className="group flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 rounded-2xl border border-slate-100 hover:border-pink-200 hover:shadow-md hover:shadow-pink-100/50 transition-all bg-white gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 flex-shrink-0 group-hover:bg-pink-100 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                          </div>
                          <div>
                            <h4 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">{service.name}</h4>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {service.duration_minutes} min
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <span className="text-lg sm:text-xl font-black text-slate-800">R$ {service.price.toFixed(2).replace(".", ",")}</span>
                          <button onClick={() => handleDeleteService(service.id)} className="text-slate-400 hover:text-red-500 bg-slate-50 p-3 rounded-xl hover:bg-red-50 active:scale-95 transition-all cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === ABA AGENDA === */}
        {activeTab === "agenda" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-200/60 max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h3 className="text-xl font-bold text-slate-900">Controle de Agenda</h3>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none w-full sm:w-auto focus:ring-2 focus:ring-pink-200 transition-all cursor-pointer" />
                  {filterDate && <button onClick={() => setFilterDate("")} className="text-xs text-slate-500 bg-white border border-slate-200 px-4 py-3 rounded-xl font-bold hover:bg-slate-50 whitespace-nowrap transition-colors cursor-pointer">Limpar</button>}
                </div>
              </div>

              {filterDate && (
                <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-200 mb-8 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                    <h4 className="font-bold text-slate-800">Bloqueio Rápido de Horários</h4>
                    <div className="flex gap-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-white border-2 border-slate-300"></div> Livre</span>
                      <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-200 border-2 border-slate-300"></div> Bloqueado</span>
                      <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-pink-100 border-2 border-pink-300"></div> Ocupado</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {availableHours.map((time) => {
                      const [h, m] = time.split(":").map(Number);
                      const slotStartMins = (h * 60) + m;
                      const slotEndMins = slotStartMins + 30;
                      const overlappingAppts = filteredAppointments.filter(appt => {
                        let aStart = 0; let aEnd = 0;
                        if (appt.start_time && appt.end_time) {
                          const startPart = appt.start_time.split("T")[1].substring(0, 5);
                          const endPart = appt.end_time.split("T")[1].substring(0, 5);
                          aStart = parseInt(startPart.split(":")[0]) * 60 + parseInt(startPart.split(":")[1]);
                          aEnd = parseInt(endPart.split(":")[0]) * 60 + parseInt(endPart.split(":")[1]);
                        }
                        return (slotStartMins < aEnd) && (slotEndMins > aStart);
                      });
                      const blockAppt = overlappingAppts.find(a => a.client_name === "🔒 BLOQUEIO");
                      const clientAppt = overlappingAppts.find(a => a.client_name !== "🔒 BLOQUEIO");
                      const isBlocked = !!blockAppt; const isBooked = !!clientAppt;

                      return (
                        <button key={time} type="button" disabled={blockLoading} onClick={() => handleToggleGridBlock(time, isBlocked, blockAppt?.id || null, isBooked)} className={`py-3 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 ${isBooked ? 'bg-pink-50 text-pink-700 border-pink-200 cursor-not-allowed shadow-sm' : isBlocked ? 'bg-slate-200 text-slate-400 border-slate-300 hover:bg-slate-300 line-through opacity-70' : 'bg-white text-slate-600 border-slate-200 hover:border-pink-300 hover:text-pink-600 shadow-sm hover:shadow-md'}`}>
                          {time} {isBlocked && <span className="text-[10px] leading-none no-underline">🔒</span>} {isBooked && <span className="text-[10px] leading-none no-underline">💅</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {filteredAppointments.length === 0 && <div className="text-center py-16 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200"><p className="text-slate-400 font-medium text-base">Nenhum agendamento para este dia.</p></div>}
                {filteredAppointments.map((appt) => {
                  let timePart = "00:00"; let datePart = "2026-01-01";
                  if (appt.start_time && appt.start_time.includes("T")) {
                    datePart = appt.start_time.split("T")[0];
                    timePart = appt.start_time.split("T")[1].substring(0, 5); 
                  }
                  const [year, month, day] = datePart.split("-");
                  const monthsNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
                  const isBlock = appt.status === "Bloqueado" || appt.client_name?.includes("BLOQUEIO");
                  const whatsMessage = encodeURIComponent(`Olá ${appt.client_name}! Aqui é do estúdio ${profile?.business_name}. Estou entrando em contato para confirmar seu agendamento de *${appt.service?.name}* para o dia *${day}/${month}* às *${timePart}*. Tudo confirmado?`);

                  return (
                    <div key={appt.id} className={`flex flex-col sm:flex-row p-6 rounded-2xl border gap-5 justify-between items-start sm:items-center transition-all ${isBlock ? 'bg-slate-50/50 border-slate-200 opacity-80' : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-pink-200'}`}>
                      <div className="flex items-center gap-5">
                        <div className={`rounded-2xl border w-16 h-16 flex flex-col items-center justify-center flex-shrink-0 ${isBlock ? 'bg-slate-100 border-slate-200' : 'bg-pink-50 border-pink-100'}`}>
                          <span className={`text-[10px] font-black uppercase tracking-wider ${isBlock ? 'text-slate-400' : 'text-pink-500'}`}>{monthsNames[parseInt(month, 10) - 1]}</span>
                          <span className={`text-xl font-black leading-none mt-1 ${isBlock ? 'text-slate-500' : 'text-slate-800'}`}>{day}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className={`font-bold text-lg leading-tight ${isBlock ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-900'}`}>{isBlock ? "🔒 Horário Bloqueado" : appt.client_name}</h4>
                            {!isBlock && <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${appt.status === 'Concluído' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{appt.status || 'Pendente'}</span>}
                          </div>
                          <p className="text-sm font-medium text-slate-500 mt-1">{isBlock ? "Grade fechada pelo sistema" : appt.service?.name} • <strong className="text-slate-800">{timePart}</strong></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-wrap">
                        {!isBlock && (
                          <>
                            <a href={`https://wa.me/55${appt.client_phone}?text=${whatsMessage}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all flex items-center gap-1.5 shadow-sm active:scale-95">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg> Contatar
                            </a>
                            {appt.status !== 'Concluído' 
                              ? <button onClick={() => handleUpdateStatus(appt.id, 'Concluído')} className="text-xs font-bold text-white bg-slate-900 border border-transparent px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-sm cursor-pointer active:scale-95">Concluir</button> 
                              : <button onClick={() => handleUpdateStatus(appt.id, 'Pendente')} className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl hover:bg-amber-100 transition-all shadow-sm cursor-pointer active:scale-95">Reabrir</button>}
                          </>
                        )}
                        <button onClick={() => handleDeleteAppointment(appt.id)} className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer active:scale-95 flex items-center gap-1.5 ${isBlock ? 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50' : 'text-red-600 bg-red-50 border border-red-100 hover:bg-red-100'}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          {isBlock ? "Liberar" : "Excluir"}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* === ABA CONFIGURAÇÕES === */}
        {activeTab === "config" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8 max-w-2xl mx-auto">
            
            <div className="bg-white p-6 sm:p-10 rounded-[2rem] shadow-sm border border-slate-200/60">
              <div className="mb-10 pb-10 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Personalização Visual</h3>
                <p className="text-sm text-slate-500 mb-8">Envie a logo do seu estúdio para transmitir mais profissionalismo na sua página de agendamentos.</p>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {profile?.logo_url ? (
                    <div className="relative group">
                      <img src={profile.logo_url} alt="Sua Logo" className="w-28 h-28 rounded-full object-cover border-4 border-pink-50 shadow-md" />
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16l5-5m0 0l5 5m-5-5v12" /></svg>
                      </div>
                    </div>
                  ) : (
                    <div className="w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  <div className="flex-1 w-full sm:w-auto text-center sm:text-left mt-2 sm:mt-4">
                    <label className="inline-block bg-white border-2 border-slate-200 text-slate-700 font-bold py-3 px-6 rounded-2xl cursor-pointer hover:border-pink-300 hover:text-pink-600 active:scale-95 transition-all shadow-sm w-full sm:w-auto">
                      {uploadingLogo ? "Enviando..." : "Alterar Imagem"}
                      <input type="file" accept="image/*" className="hidden" onChange={handleUploadLogo} disabled={uploadingLogo} />
                    </label>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-4">JPG, PNG, WEBP (Max. 2MB)</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Expediente de Trabalho</h3>
                <p className="text-sm text-slate-500 mb-6">Defina o intervalo em que seu estúdio aceita agendamentos online.</p>
                <form onSubmit={handleSaveConfig} className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="w-full sm:w-1/2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">Horário de Abertura</label>
                      <select value={startHour} onChange={(e) => setStartHour(e.target.value)} className="w-full px-5 py-4 bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none text-base transition-all font-medium appearance-none cursor-pointer">
                        {Array.from({ length: 24 }).map((_, i) => <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>)}
                      </select>
                    </div>
                    <div className="w-full sm:w-1/2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">Horário de Fechamento</label>
                      <select value={endHour} onChange={(e) => setEndHour(e.target.value)} className="w-full px-5 py-4 bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none text-base transition-all font-medium appearance-none cursor-pointer">
                        {Array.from({ length: 24 }).map((_, i) => <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button type="submit" disabled={savingConfig} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all text-base cursor-pointer">
                      {savingConfig ? "Salvando Alterações..." : "Salvar Configurações"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* CARD DE SUPORTE NA ABA CONFIGURAÇÕES */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 sm:p-8 rounded-[2rem] text-white shadow-lg shadow-green-200/50 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold">Precisa de Ajuda ou Suporte?</h3>
                <p className="text-green-50 text-sm mt-1">Fale diretamente com o desenvolvedor para tirar dúvidas ou solicitar melhorias.</p>
              </div>
              <a 
                href={supportUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-white text-green-700 hover:bg-green-50 font-bold px-6 py-3.5 rounded-xl shadow-md active:scale-95 transition-all text-sm whitespace-nowrap"
              >
                Chamar no WhatsApp
              </a>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}