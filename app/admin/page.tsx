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

  const [activeTab, setActiveTab] = useState<"catalogo" | "agenda" | "config">("catalogo");

  // Catálogo
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Agenda
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filterDate, setFilterDate] = useState(getTodayBrazil());
  const [blockLoading, setBlockLoading] = useState(false);

  // Configurações e Logo
  const [startHour, setStartHour] = useState("9");
  const [endHour, setEndHour] = useState("18");
  const [savingConfig, setSavingConfig] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [copied, setCopied] = useState(false);

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
      
      if (profileData.start_hour) {
        setStartHour(String(profileData.start_hour));
      }
      
      if (profileData.end_hour) {
        setEndHour(String(profileData.end_hour));
      }
      
      fetchServices(session.user.id);
      fetchAppointments(session.user.id);
    }
    
    setAuthLoading(false);
  }

  async function fetchServices(profileId: string) {
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });
      
    if (data) {
      setServices(data);
    }
  }

  async function fetchAppointments(profileId: string) {
    const { data } = await supabase
      .from("appointments")
      .select("*, service:services(name, price)")
      .eq("profile_id", profileId)
      .order("start_time", { ascending: true });
      
    if (data) {
      setAppointments(data);
    }
  }

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value.replace(/\D/g, "");
    if (!value) { 
      setPrice(""); 
      return; 
    }
    const floatValue = parseFloat(value) / 100;
    setPrice(floatValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
  }

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price || !duration) return alert("Preencha todos os campos!");
    
    setLoading(true);
    
    const numericPrice = parseFloat(price.replace(/[^\d,-]/g, "").replace(",", "."));
    
    const { error } = await supabase.from("services").insert([{ 
      profile_id: user.id, 
      name, 
      price: numericPrice, 
      duration_minutes: parseInt(duration) 
    }]);
    
    setLoading(false);
    
    if (!error) { 
      setName(""); 
      setPrice(""); 
      setDuration(""); 
      fetchServices(user.id); 
    }
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
    if (isBooked) {
      alert("Horário já ocupado por uma cliente. Cancele primeiro se precisar bloquear.");
      return;
    }
    
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
        profile_id: user.id, 
        service_id: safeServiceId, 
        client_name: "🔒 BLOQUEIO", 
        client_phone: "00000000000", 
        start_time: startDateTimeString, 
        end_time: endDateTimeString, 
        status: "Bloqueado",
      }]);
    }
    
    await fetchAppointments(user.id);
    setBlockLoading(false);
  }

  async function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault();
    setSavingConfig(true);
    
    const { error } = await supabase
      .from("profiles")
      .update({ 
        start_hour: parseInt(startHour), 
        end_hour: parseInt(endHour) 
      })
      .eq("id", user.id);
      
    setSavingConfig(false);
    
    if (error) {
      alert("Erro ao salvar horários.");
    } else {
      alert("Horários atualizados com sucesso!");
    }
  }

  // Lógica de Upload de Logo com visual expandido
  async function handleUploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingLogo(true);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, file);

    if (uploadError) {
      alert('Erro ao enviar imagem: ' + uploadError.message);
      setUploadingLogo(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName);

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center text-pink-500 font-bold animate-pulse">
        Carregando painel...
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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-50 via-slate-50 to-white font-sans text-slate-800 pb-20">
      
      {/* HEADER COMPLETO */}
      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-lg border-b border-pink-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="h-16 sm:h-20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-xl flex items-center justify-center shadow-md shadow-pink-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 hidden sm:block">
                Beleza<span className="text-pink-500">Pro</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-700 hidden sm:inline">
                {profile?.business_name}
              </span>
              <button 
                onClick={handleLogout} 
                className="text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-full font-bold transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
          
          <div className="flex gap-6 border-t border-slate-100 pt-2 overflow-x-auto">
            <button 
              onClick={() => setActiveTab("catalogo")} 
              className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "catalogo" ? "border-pink-500 text-pink-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
            >
              Catálogo de Serviços
            </button>
            <button 
              onClick={() => setActiveTab("agenda")} 
              className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "agenda" ? "border-pink-500 text-pink-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
            >
              Agenda e Horários
            </button>
            <button 
              onClick={() => setActiveTab("config")} 
              className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "config" ? "border-pink-500 text-pink-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
            >
              Configurações
            </button>
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* BANNER LINK DO ESTÚDIO */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-400 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-lg shadow-pink-200/50 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold">Link do seu Estúdio</h2>
            <p className="text-pink-100 text-xs sm:text-sm mt-0.5">
              Envie este link para suas clientes agendarem horários com você.
            </p>
          </div>
          <button 
            onClick={handleCopyLink} 
            className="bg-white text-pink-600 font-bold px-5 py-3 rounded-xl shadow hover:bg-pink-50 active:scale-95 transition-all text-sm whitespace-nowrap"
          >
            {copied ? "Link Copiado! 📋" : "Copiar Link de Agendamento"}
          </button>
        </div>

        {/* ================= ABA CATÁLOGO COMPLETA ================= */}
        {activeTab === "catalogo" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col lg:flex-row gap-6 sm:gap-10">
              
              <div className="w-full lg:w-1/3">
                <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-lg shadow-rose-100/40 border border-white lg:sticky lg:top-36">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
                    <span className="bg-pink-100 text-pink-500 p-1.5 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Novo Serviço
                  </h3>
                  
                  <form onSubmit={handleAddService} className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 pl-1">
                        Nome do Serviço
                      </label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="w-full px-4 py-3.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-200 outline-none text-base" 
                        placeholder="Ex: Unha de Gel" 
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="w-1/2">
                        <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 pl-1">
                          Valor
                        </label>
                        <input 
                          type="text" 
                          inputMode="numeric" 
                          value={price} 
                          onChange={handlePriceChange} 
                          className="w-full px-4 py-3.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-200 outline-none text-base" 
                          placeholder="R$ 0,00" 
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 pl-1">
                          Minutos
                        </label>
                        <input 
                          type="number" 
                          inputMode="numeric" 
                          value={duration} 
                          onChange={(e) => setDuration(e.target.value)} 
                          className="w-full px-4 py-3.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-200 outline-none text-base" 
                          placeholder="60" 
                        />
                      </div>
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold py-4 rounded-xl hover:shadow-lg active:scale-[0.98] transition-all text-base mt-2"
                    >
                      {loading ? "Salvando..." : "Salvar no Catálogo"}
                    </button>
                  </form>
                </div>
              </div>
              
              <div className="w-full lg:w-2/3">
                <div className="bg-white p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-lg shadow-rose-100/40 border border-white">
                  <div className="flex justify-between items-center mb-5 sm:mb-6 px-1">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                      Meus Serviços
                    </h3>
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full">
                      {services.length} ativos
                    </span>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {services.length === 0 && (
                      <div className="text-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-pink-100">
                        <p className="text-slate-500 font-medium text-sm sm:text-base">
                          Nenhum serviço encontrado.
                        </p>
                      </div>
                    )}
                    
                    {services.map((service) => (
                      <div 
                        key={service.id} 
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-5 rounded-2xl border border-slate-100 hover:border-pink-200 shadow-sm transition-all bg-white gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-pink-400 flex-shrink-0">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                             </svg>
                          </div>
                          <div>
                            <h4 className="text-base sm:text-lg font-bold text-slate-700 leading-tight">
                              {service.name}
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                              {service.duration_minutes} min
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                          <span className="text-lg sm:text-xl font-extrabold text-slate-800 bg-slate-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl">
                            R$ {service.price.toFixed(2).replace(".", ",")}
                          </span>
                          <button 
                            onClick={() => handleDeleteService(service.id)} 
                            className="text-red-400 hover:text-white bg-red-50 p-2.5 sm:p-3 rounded-xl hover:bg-red-500 active:scale-95 transition-all"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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

        {/* ================= ABA AGENDA COMPLETA ================= */}
        {activeTab === "agenda" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-lg shadow-rose-100/40 border border-white max-w-3xl mx-auto">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <h3 className="text-xl font-bold text-slate-800">Próximos Agendamentos</h3>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input 
                    type="date" 
                    value={filterDate} 
                    onChange={(e) => setFilterDate(e.target.value)} 
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none w-full sm:w-auto focus:ring-2 focus:ring-pink-300 transition-all" 
                  />
                  {filterDate && (
                    <button 
                      onClick={() => setFilterDate("")} 
                      className="text-xs text-slate-500 bg-slate-100 px-3 py-2.5 rounded-xl font-bold hover:bg-slate-200 whitespace-nowrap transition-colors"
                    >
                      Ver Todos
                    </button>
                  )}
                </div>
              </div>

              {/* Lógica do Quadro de Horários */}
              {filterDate && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-8 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                    <h4 className="font-bold text-slate-700">Gerenciar Grade de Horários</h4>
                    <div className="flex gap-3 text-[10px] sm:text-xs font-bold text-slate-500 uppercase">
                      <span className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-sm bg-white border border-slate-300"></div> 
                        Livre
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-sm bg-slate-200"></div> 
                        Bloqueado
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-sm bg-pink-100 border border-pink-300"></div> 
                        Cliente
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {availableHours.map((time) => {
                      const [h, m] = time.split(":").map(Number);
                      const slotStartMins = (h * 60) + m;
                      const slotEndMins = slotStartMins + 30;
                      
                      const overlappingAppts = filteredAppointments.filter(appt => {
                        let aStart = 0; 
                        let aEnd = 0;
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
                      
                      const isBlocked = !!blockAppt; 
                      const isBooked = !!clientAppt;

                      return (
                        <button 
                          key={time} 
                          type="button" 
                          disabled={blockLoading} 
                          onClick={() => handleToggleGridBlock(time, isBlocked, blockAppt?.id || null, isBooked)} 
                          className={`py-2 rounded-lg text-xs sm:text-sm font-bold border-2 transition-all flex flex-col items-center justify-center gap-0.5 ${
                            isBooked 
                              ? 'bg-pink-100 text-pink-700 border-pink-200 cursor-not-allowed' 
                              : isBlocked 
                                ? 'bg-slate-200 text-slate-500 border-slate-300 hover:bg-slate-300 line-through opacity-80' 
                                : 'bg-white text-slate-700 border-slate-200 hover:border-pink-300 hover:text-pink-600'
                          }`}
                        >
                          {time} 
                          {isBlocked && <span className="text-[10px] leading-none no-underline">🔒</span>} 
                          {isBooked && <span className="text-[10px] leading-none no-underline">💅</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!filterDate && (
                <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm font-medium mb-6 flex items-start gap-3 border border-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Dica: Selecione uma data no calendário acima para visualizar a grade completa de horários, onde você pode bloquear ou desbloquear a agenda com um clique!
                </div>
              )}
              
              {/* Lista dos Cards de Agendamento */}
              <div className="space-y-4">
                {filteredAppointments.length === 0 && (
                  <div className="text-center py-16 bg-slate-50/50 rounded-3xl border-2 border-dashed border-pink-100">
                    <p className="text-slate-500 font-medium text-lg">
                      Nenhum registro encontrado.
                    </p>
                  </div>
                )}
                
                {filteredAppointments.map((appt) => {
                  let timePart = "00:00"; 
                  let datePart = "2026-01-01";
                  
                  if (appt.start_time && appt.start_time.includes("T")) {
                    datePart = appt.start_time.split("T")[0];
                    timePart = appt.start_time.split("T")[1].substring(0, 5); 
                  }
                  
                  const [year, month, day] = datePart.split("-");
                  const monthsNames = ["JAN.", "FEV.", "MAR.", "ABR.", "MAI.", "JUN.", "JUL.", "AGO.", "SET.", "OUT.", "NOV.", "DEZ."];
                  
                  const isBlock = appt.status === "Bloqueado" || appt.client_name?.includes("BLOQUEIO");
                  
                  const whatsMessage = encodeURIComponent(
                    `Olá ${appt.client_name}! Aqui é do ${profile?.business_name}. Estou entrando em contato para confirmar seu agendamento de *${appt.service?.name}* para o dia *${day}/${month}/${year}* às *${timePart}*. Tudo confirmado?`
                  );

                  return (
                    <div 
                      key={appt.id} 
                      className={`flex flex-col sm:flex-row p-5 rounded-2xl border gap-4 justify-between items-start sm:items-center ${
                        isBlock 
                          ? 'bg-slate-100/70 border-slate-200' 
                          : 'bg-slate-50/30 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`rounded-xl shadow-sm border w-16 h-16 flex flex-col items-center justify-center flex-shrink-0 ${
                          isBlock 
                            ? 'bg-slate-200 border-slate-300 opacity-60' 
                            : 'bg-white border-slate-200'
                        }`}>
                          <span className={`text-xs font-bold uppercase ${isBlock ? 'text-slate-500' : 'text-pink-500'}`}>
                            {monthsNames[parseInt(month, 10) - 1]}
                          </span>
                          <span className={`text-xl font-extrabold leading-none mt-1 ${isBlock ? 'text-slate-600' : 'text-slate-800'}`}>
                            {day}
                          </span>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`font-bold text-lg leading-tight ${isBlock ? 'text-slate-600 line-through decoration-slate-400' : 'text-slate-800'}`}>
                              {isBlock ? "🔒 Horário Bloqueado" : appt.client_name}
                            </h4>
                            {!isBlock && (
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                                appt.status === 'Concluído' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {appt.status || 'Pendente'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-500 mt-0.5">
                            {isBlock ? "Agenda fechada neste período" : appt.service?.name} • <strong className="text-slate-700">{timePart}</strong>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-wrap">
                        {!isBlock && (
                          <>
                            <a 
                              href={`https://wa.me/55${appt.client_phone}?text=${whatsMessage}`} 
                              target="_blank" 
                              className="text-xs font-bold text-green-700 bg-green-50 px-3 py-2 rounded-xl hover:bg-green-100 transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                              WhatsApp
                            </a>
                            
                            {appt.status !== 'Concluído' ? (
                              <button 
                                onClick={() => handleUpdateStatus(appt.id, 'Concluído')} 
                                className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                              >
                                Concluir
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleUpdateStatus(appt.id, 'Pendente')} 
                                className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-xl hover:bg-amber-100 transition-colors shadow-sm"
                              >
                                Reabrir
                              </button>
                            )}
                          </>
                        )}
                        <button 
                          onClick={() => handleDeleteAppointment(appt.id)} 
                          className={`text-xs font-bold px-3 py-2 rounded-xl transition-colors shadow-sm ${
                            isBlock 
                              ? 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-200' 
                              : 'text-red-500 bg-red-50 hover:bg-red-100'
                          }`}
                        >
                          {isBlock ? "Desbloquear" : "Excluir"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= ABA CONFIGURAÇÕES COMPLETA ================= */}
        {activeTab === "config" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-lg shadow-rose-100/40 border border-white max-w-xl mx-auto">
              
              {/* === SESSÃO DA LOGO === */}
              <div className="mb-10 pb-10 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Logo do Estúdio
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  Envie uma imagem para substituir a letra inicial na sua página de agendamentos.
                </p>
                
                <div className="flex items-center gap-6">
                  {profile?.logo_url ? (
                    <img 
                      src={profile.logo_url} 
                      alt="Sua Logo" 
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-pink-100 shadow-sm" 
                    />
                  ) : (
                    <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <label className="block bg-pink-50 text-pink-600 font-bold py-3 px-4 rounded-xl text-center cursor-pointer hover:bg-pink-100 transition-colors">
                      {uploadingLogo ? "Enviando imagem..." : "Escolher Imagem"}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleUploadLogo} 
                        disabled={uploadingLogo}
                      />
                    </label>
                    <p className="text-xs text-slate-400 mt-2 text-center">
                      Formatos aceitos: JPG, PNG, WEBP.
                    </p>
                  </div>
                </div>
              </div>

              {/* === SESSÃO DE HORÁRIOS === */}
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Horário de Atendimento
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Defina o intervalo em que seu estúdio aceita agendamentos online.
              </p>

              <form onSubmit={handleSaveConfig} className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 pl-1">
                      Horário de Abertura
                    </label>
                    <select 
                      value={startHour} 
                      onChange={(e) => setStartHour(e.target.value)} 
                      className="w-full px-4 py-3.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-200 outline-none text-base"
                    >
                      {Array.from({ length: 24 }).map((_, i) => (
                        <option key={i} value={i}>
                          {String(i).padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-1/2">
                    <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 pl-1">
                      Horário de Fechamento
                    </label>
                    <select 
                      value={endHour} 
                      onChange={(e) => setEndHour(e.target.value)} 
                      className="w-full px-4 py-3.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-200 outline-none text-base"
                    >
                      {Array.from({ length: 24 }).map((_, i) => (
                        <option key={i} value={i}>
                          {String(i).padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={savingConfig} 
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold py-4 rounded-xl hover:shadow-lg active:scale-[0.98] transition-all text-base mt-4"
                >
                  {savingConfig ? "Salvando..." : "Salvar Configurações"}
                </button>
              </form>
              
            </div>
          </div>
        )}
      </main>
    </div>
  );
}