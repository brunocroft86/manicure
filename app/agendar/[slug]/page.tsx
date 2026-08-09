"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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

export default function PublicBookingPage() {
  const params = useParams();
  const slug = params?.slug;

  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Estados do Agendamento
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(getTodayBrazil());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (slug) fetchStudioData();
  }, [slug]);

  useEffect(() => {
    if (profile) fetchBookedTimes();
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
      .select("*")
      .eq("profile_id", profile.id);

    if (data) {
      const filtered = data.filter(appt => appt.start_time?.startsWith(selectedDate));
      setAppointments(filtered);
    }
  }

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService || !selectedTime || !clientName || !clientPhone) {
      return alert("Por favor, preencha todos os campos e escolha o horário!");
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
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-pink-500 font-extrabold text-lg animate-pulse">Carregando estúdio...</div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-pink-100">
          <h1 className="text-2xl font-black text-slate-800 mb-2">Estúdio não encontrado</h1>
          <p className="text-slate-500 text-sm">O link que você acessou pode estar incorreto ou desativado.</p>
        </div>
      </div>
    );
  }

  if (success) {
    const whatsMsg = encodeURIComponent(`Olá! Acabei de agendar ${selectedService?.name} para o dia ${selectedDate.split("-").reverse().join("/")} às ${selectedTime} no estúdio *${profile.business_name}*.`);
    const whatsUrl = `https://wa.me/55${profile.phone || '21978308046'}?text=${whatsMsg}`;

    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-50 via-slate-50 to-white flex items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center border border-pink-100 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Agendamento Confirmado!</h1>
          <p className="text-slate-600 text-sm mb-8 font-medium">
            Seu horário para <strong>{selectedService?.name}</strong> foi reservado com sucesso no estúdio <strong>{profile.business_name}</strong>.
          </p>
          <a 
            href={whatsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-extrabold text-base py-4 rounded-2xl shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2 mb-3"
          >
            Avisar Estúdio no WhatsApp
          </a>
          <button 
            onClick={() => { setSuccess(false); setSelectedService(null); setSelectedTime(""); setClientName(""); setClientPhone(""); }}
            className="text-slate-400 font-bold text-xs hover:text-slate-600 transition-colors"
          >
            Fazer outro agendamento
          </button>
        </div>
      </div>
    );
  }

  // Horários disponíveis (das 9h às 18h por exemplo, ou conforme config)
  const startH = profile.start_hour ?? 9;
  const endH = profile.end_hour ?? 18;
  const availableHours = [];
  for (let i = startH; i < endH; i++) {
    availableHours.push(`${String(i).padStart(2, '0')}:00`);
    availableHours.push(`${String(i).padStart(2, '0')}:30`);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-100/60 via-slate-50 to-white font-sans text-slate-800 pb-24">
      
      {/* HEADER DO ESTÚDIO COM VIDA E COR */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white pt-12 pb-20 px-4 text-center shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent)] pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          {profile.logo_url ? (
            <img src={profile.logo_url} alt={profile.business_name} className="w-24 h-24 rounded-3xl object-cover border-4 border-white/30 shadow-2xl mb-4 bg-white" />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md border-4 border-white/30 flex items-center justify-center text-white text-3xl font-black shadow-2xl mb-4">
              {profile.business_name?.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-1 drop-shadow-sm">{profile.business_name}</h1>
          <p className="text-pink-100 text-sm font-medium tracking-wide">Agende seu horário online de forma rápida e segura</p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 -mt-10 relative z-20 space-y-8">
        
        {/* PASSO 1: SELECIONAR SERVIÇO */}
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl shadow-pink-100/50 border border-pink-100/80">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-pink-500 text-white font-black text-sm flex items-center justify-center shadow-md shadow-pink-200">1</div>
            <h2 className="text-xl font-extrabold text-slate-900">Escolha o Serviço</h2>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-slate-400 font-medium text-sm">Nenhum serviço disponível no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((service) => {
                const isSelected = selectedService?.id === service.id;
                return (
                  <div 
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected 
                        ? 'border-pink-500 bg-pink-50/50 shadow-md shadow-pink-100 scale-[1.01]' 
                        : 'border-slate-100 hover:border-pink-200 bg-white shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="font-bold text-slate-800 text-base leading-tight">{service.name}</h3>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${isSelected ? 'border-pink-500 bg-pink-500 text-white' : 'border-slate-300'}`}>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-white"></span>}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {service.duration_minutes} minutos
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Valor</span>
                      <span className="text-lg font-black text-pink-600">R$ {service.price.toFixed(2).replace(".", ",")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PASSO 2: DATA E HORÁRIO */}
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl shadow-pink-100/50 border border-pink-100/80">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-pink-500 text-white font-black text-sm flex items-center justify-center shadow-md shadow-pink-200">2</div>
            <h2 className="text-xl font-extrabold text-slate-900">Selecione a Data e o Horário</h2>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Data do Atendimento</label>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-pink-300 transition-all text-base"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Horários Disponíveis</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {availableHours.map((time) => {
                const [h, m] = time.split(":").map(Number);
                const slotStartMins = (h * 60) + m;
                const slotEndMins = slotStartMins + (selectedService?.duration_minutes || 30);

                const isOccupied = appointments.some(appt => {
                  let aStart = 0; let aEnd = 0;
                  if (appt.start_time && appt.end_time) {
                    const startPart = appt.start_time.split("T")[1].substring(0, 5);
                    const endPart = appt.end_time.split("T")[1].substring(0, 5);
                    aStart = parseInt(startPart.split(":")[0]) * 60 + parseInt(startPart.split(":")[1]);
                    aEnd = parseInt(endPart.split(":")[0]) * 60 + parseInt(endPart.split(":")[1]);
                  }
                  return (slotStartMins < aEnd) && (slotEndMins > aStart);
                });

                const isSelectedTime = selectedTime === time;

                return (
                  <button
                    key={time}
                    type="button"
                    disabled={isOccupied}
                    onClick={() => setSelectedTime(time)}
                    className={`py-3.5 rounded-xl font-bold text-sm transition-all border-2 ${
                      isOccupied 
                        ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through' 
                        : isSelectedTime 
                        ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-200 scale-105' 
                        : 'bg-white text-slate-700 border-slate-200 hover:border-pink-300 hover:text-pink-600'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* PASSO 3: SEUS DADOS E CONFIRMAÇÃO */}
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl shadow-pink-100/50 border border-pink-100/80">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-pink-500 text-white font-black text-sm flex items-center justify-center shadow-md shadow-pink-200">3</div>
            <h2 className="text-xl font-extrabold text-slate-900">Seus Dados para Contato</h2>
          </div>

          <form onSubmit={handleBooking} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Seu Nome Completo</label>
              <input 
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Maria da Silva"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-300 font-medium text-slate-800 text-base"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Seu WhatsApp (com DDD)</label>
              <input 
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Ex: 21999999999"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-300 font-medium text-slate-800 text-base"
                required
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-black text-lg py-5 rounded-2xl shadow-xl shadow-pink-200 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
              >
                {submitting ? "Confirmando Agendamento..." : "Confirmar Meu Horário 💅"}
              </button>
            </div>
          </form>
        </div>

      </main>

    </div>
  );
}