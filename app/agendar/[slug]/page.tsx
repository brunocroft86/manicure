"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { parseISO, format, isBefore, parse, isSameDay, startOfDay } from "date-fns";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function getTodayBrazil() {
  const now = new Date();
  const brasiliaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  return format(brasiliaTime, 'yyyy-MM-dd');
}

export default function PublicBookingPage() {
  const params = useParams();
  const slug = params?.slug;

  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(getTodayBrazil());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [nowInBrasilia, setNowInBrasilia] = useState<Date>(new Date());

  useEffect(() => {
    if (slug) fetchStudioData();
  }, [slug]);

  useEffect(() => {
    if (profile) {
        fetchBookedTimes();
        const now = new Date();
        const brasiliaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
        setNowInBrasilia(brasiliaTime);
    }
  }, [profile, selectedDate]);

  async function fetchStudioData() {
    setLoading(true);
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !profileData) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setProfile(profileData);

    const { data: servicesData } = await supabase
      .from("services")
      .select("*")
      .eq("profile_id", profileData.id)
      .order("created_at", { ascending: false });

    if (servicesData) setServices(servicesData);
    setLoading(false);
  }

  async function fetchBookedTimes() {
    if (!profile) return;
    const { data } = await supabase
      .from("appointments")
      .select("start_time, end_time")
      .eq("profile_id", profile.id)
      .gte("start_time", `${selectedDate}T00:00:00`)
      .lte("start_time", `${selectedDate}T23:59:59`);

    if (data) setAppointments(data);
  }

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService || !selectedTime || !clientName || !clientPhone) {
      return alert("Por favor, preencha todos os campos e escolha o horário!");
    }

    const now = new Date();
    const currentBrasiliaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const selectedDateTime = parse(`${selectedDate} ${selectedTime}`, 'yyyy-MM-dd HH:mm', currentBrasiliaTime);

    if (isBefore(selectedDateTime, currentBrasiliaTime)) {
        return alert("Ops! Este horário já passou. Por favor, escolha um horário futuro.");
    }

    setSubmitting(true);
    const startDateTimeString = `${selectedDate}T${selectedTime}:00`;
    const [h, m] = selectedTime.split(":").map(Number);
    const startMins = (h * 60) + m;
    const duration = selectedService.duration_minutes || 30;
    const endMins = startMins + duration;
    const endH = Math.floor(endMins / 60);
    const endM = endMins % 60;
    const endDateTimeString = `${selectedDate}T${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;

    const { error } = await supabase.from("appointments").insert([{
      profile_id: profile.id,
      service_id: selectedService.id,
      client_name: clientName,
      client_phone: clientPhone.replace(/\D/g, ""),
      start_time: startDateTimeString,
      end_time: endDateTimeString,
      status: "Pendente"
    }]);

    setSubmitting(false);

    if (error) {
      alert("Erro ao realizar agendamento: " + error.message);
    } else {
      setSuccess(true);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
          <div className="text-slate-500 font-medium text-sm animate-pulse">Carregando estúdio...</div>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md w-full border border-slate-100">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Estúdio não encontrado</h1>
          <p className="text-slate-500 text-sm">O link que você acessou pode estar incorreto ou desativado.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 max-w-md w-full text-center border border-slate-100 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">Tudo Certo!</h1>
          <p className="text-slate-500 text-base mb-8 leading-relaxed">
            Seu horário para <strong className="text-slate-800">{selectedService?.name}</strong> foi reservado com sucesso no estúdio <strong className="text-slate-800">{profile.business_name}</strong>.
          </p>
          <button 
            onClick={() => { setSuccess(false); setSelectedService(null); setSelectedTime(""); setClientName(""); setClientPhone(""); }}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-base py-4 rounded-2xl transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98]"
          >
            Fazer outro agendamento
          </button>
        </div>
      </div>
    );
  }

  const startH = profile.start_hour ?? 9;
  const endH = profile.end_hour ?? 18;
  const availableHours = [];
  for (let i = startH; i < endH; i++) {
    availableHours.push(`${String(i).padStart(2, '0')}:00`);
    availableHours.push(`${String(i).padStart(2, '0')}:30`);
  }

  const isTodaySelected = isSameDay(parseISO(selectedDate), startOfDay(nowInBrasilia));

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24">
      
      {/* HEADER PREMIUM */}
      <div className="bg-gradient-to-br from-pink-600 via-rose-500 to-pink-500 text-white pt-16 pb-28 px-4 text-center relative overflow-hidden">
        {/* Padrão de fundo suave para dar textura */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          {profile.logo_url ? (
            <img src={profile.logo_url} alt={profile.business_name} className="w-28 h-28 rounded-full object-cover border-4 border-white/20 shadow-2xl mb-5 bg-white" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-white/10 backdrop-blur-md border-4 border-white/20 flex items-center justify-center text-white text-4xl font-black shadow-2xl mb-5">
              {profile.business_name?.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 drop-shadow-md">{profile.business_name}</h1>
          <p className="text-pink-50 text-sm font-medium tracking-wide opacity-90">Agende seu horário online</p>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 -mt-14 relative z-20 space-y-6">
        
        {/* PASSO 1 - ATUALIZADO E COMPACTO */}
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-200/60">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 font-black text-sm flex items-center justify-center">1</div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">O que vamos fazer hoje?</h2>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium text-sm">Nenhum serviço cadastrado.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 bg-slate-50/50 p-2 sm:p-4 rounded-2xl border border-slate-100">
              {services.map((service) => {
                const isSelected = selectedService?.id === service.id;
                return (
                  <label 
                    key={service.id} 
                    onClick={() => setSelectedService(service)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-pink-500 bg-pink-50/70 shadow-sm' 
                        : 'border-slate-100 bg-white hover:border-pink-200 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {/* Lado Esquerdo: Radio Button e Título */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Radio Button Customizado */}
                      <div className={`w-5 h-5 rounded-full border-2 flex flex-shrink-0 items-center justify-center transition-colors ${
                        isSelected ? 'border-pink-500' : 'border-slate-300 group-hover:border-pink-300'
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-in zoom-in duration-200"></div>}
                      </div>
                      
                      <div>
                        <h4 className={`text-sm sm:text-base font-bold leading-tight ${isSelected ? 'text-pink-700' : 'text-slate-800'}`}>{service.name}</h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-1">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           {service.duration_minutes} min
                        </p>
                      </div>
                    </div>

                    {/* Lado Direito: Preço */}
                    <div className={`text-sm sm:text-base font-black ${isSelected ? 'text-pink-700' : 'text-slate-800'}`}>
                      R$ {service.price.toFixed(2).replace('.', ',')}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* PASSO 2 */}
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-200/60">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 font-black text-sm flex items-center justify-center">2</div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quando será?</h2>
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Data do Atendimento</label>
            <input 
              type="date"
              value={selectedDate}
              min={getTodayBrazil()}
              onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime("");
              }}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-all text-base cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Horários Disponíveis</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {availableHours.map((time) => {
                const [h, m] = time.split(":").map(Number);
                const slotStartMins = (h * 60) + m;
                const slotEndMins = slotStartMins + (selectedService?.duration_minutes || 30);

                const isOccupied = appointments.some(appt => {
                  if (!appt.start_time || !appt.end_time) return false;
                  const startPart = appt.start_time.split("T")[1].substring(0, 5);
                  const endPart = appt.end_time.split("T")[1].substring(0, 5);
                  const aStart = parseInt(startPart.split(":")[0]) * 60 + parseInt(startPart.split(":")[1]);
                  const aEnd = parseInt(endPart.split(":")[0]) * 60 + parseInt(endPart.split(":")[1]);
                  return (slotStartMins < aEnd) && (slotEndMins > aStart);
                });

                const slotDateTime = parse(`${selectedDate} ${time}`, 'yyyy-MM-dd HH:mm', nowInBrasilia);
                const isInPast = isTodaySelected && isBefore(slotDateTime, nowInBrasilia);
                const isDisabled = isOccupied || isInPast;
                const isSelectedTime = selectedTime === time;

                return (
                  <button
                    key={time}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setSelectedTime(time)}
                    className={`py-3.5 rounded-2xl font-bold text-sm transition-all border flex flex-col items-center justify-center relative overflow-hidden ${
                      isDisabled 
                        ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-60' 
                        : isSelectedTime 
                        ? 'bg-pink-600 text-white border-pink-600 shadow-md shadow-pink-200 scale-[1.02]' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50/50'
                    }`}
                  >
                    {time}
                    {isInPast && <span className="absolute bottom-0.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest opacity-70">Passou</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* PASSO 3 */}
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-200/60">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 font-black text-sm flex items-center justify-center">3</div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Seus Dados</h2>
          </div>

          <form onSubmit={handleBooking} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome Completo</label>
              <input 
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Maria da Silva"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 font-medium text-slate-800 text-base transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">WhatsApp (com DDD)</label>
              <input 
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Ex: 21999999999"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 font-medium text-slate-800 text-base transition-all"
                required
              />
            </div>

            <div className="pt-6">
              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-lg py-5 rounded-2xl shadow-lg shadow-pink-200 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? "Confirmando..." : "Confirmar Agendamento"}
              </button>
            </div>
          </form>
        </div>

      </main>
    </div>
  );
}