"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AgendarPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  
  // Estado para controlar a caixinha de aviso personalizada
  const [alertMessage, setAlertMessage] = useState("");
  
  const [bookedIntervals, setBookedIntervals] = useState<{startMins: number, endMins: number}[]>([]);

  useEffect(() => {
    if (slug) fetchStudioData();
  }, [slug]);

  useEffect(() => {
    if (selectedDate && profile) {
      fetchBookedTimes(selectedDate);
      setSelectedTime("");
    }
  }, [selectedDate, profile]);

  useEffect(() => {
    setSelectedTime("");
  }, [selectedService]);

  async function fetchStudioData() {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("slug", slug)
      .single();

    if (profileData) {
      setProfile(profileData);
      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .eq("profile_id", profileData.id)
        .order("created_at", { ascending: false });
      if (servicesData) setServices(servicesData);
    }
    setLoading(false);
  }

  async function fetchBookedTimes(date: string) {
    const { data } = await supabase
      .from("appointments")
      .select("start_time, end_time")
      .eq("profile_id", profile.id);

    if (data) {
      const intervals = data
        .filter(appt => appt.start_time && appt.end_time)
        .map(appt => {
          const startDatePart = appt.start_time.substring(0, 10);
          if (startDatePart !== date) return null;

          const tIndex = appt.start_time.indexOf("T");
          const startStr = appt.start_time.substring(tIndex + 1, tIndex + 6);
          const endTIndex = appt.end_time.indexOf("T");
          const endStr = appt.end_time.substring(endTIndex + 1, endTIndex + 6);

          const [sH, sM] = startStr.split(":").map(Number);
          const [eH, eM] = endStr.split(":").map(Number);

          return {
            startMins: (sH * 60) + sM,
            endMins: (eH * 60) + eM
          };
        })
        .filter(Boolean);

      setBookedIntervals(intervals as {startMins: number, endMins: number}[]);
    }
  }

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    
    // Validações usando o modal personalizado em vez de alert()
    if (!selectedService) return setAlertMessage("Selecione um serviço para continuar.");
    if (!selectedDate) return setAlertMessage("Selecione uma data para o agendamento.");
    if (!selectedTime) return setAlertMessage("Escolha um dos horários disponíveis.");
    if (!clientName || !clientPhone) return setAlertMessage("Por favor, preencha seu nome e WhatsApp.");

    setSubmitting(true);

    const startDateTimeString = `${selectedDate}T${selectedTime}:00`;
    
    const [h, m] = selectedTime.split(":").map(Number);
    const startMins = (h * 60) + m;
    const duration = selectedService.duration_minutes || 60;
    const endMins = startMins + duration;
    
    const endH = Math.floor(endMins / 60);
    const endM = endMins % 60;
    const endDateTimeString = `${selectedDate}T${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;

    const { error } = await supabase.from("appointments").insert([{
      profile_id: profile.id,
      service_id: selectedService.id,
      client_name: clientName,
      client_phone: clientPhone,
      start_time: startDateTimeString,
      end_time: endDateTimeString,
      status: "Pendente",
    }]);

    setSubmitting(false);

    if (error) {
      setAlertMessage("Erro ao agendar: " + error.message);
    } else {
      setSuccess(true);
      fetchBookedTimes(selectedDate);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-pink-50 flex items-center justify-center text-pink-500 font-bold animate-pulse">Carregando estúdio...</div>;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Estúdio não encontrado</h1>
        <p className="text-slate-500 text-sm">Verifique o link e tente novamente.</p>
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

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-50 via-slate-50 to-white font-sans text-slate-800 pb-20">
      
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 py-6 px-4 text-center shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-2xl mx-auto flex items-center justify-center shadow-md shadow-pink-200 mb-3">
            <span className="text-white text-3xl font-extrabold">{profile.business_name.charAt(0).toUpperCase()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">{profile.business_name}</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Agende seu horário online</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8">
        {success ? (
          <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-lg shadow-rose-100/40 border border-white text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-3">Agendamento Realizado!</h2>
            <p className="text-slate-500 mb-8">Tudo pronto! Seu horário foi reservado com sucesso.</p>
            <button 
              onClick={() => { setSuccess(false); setSelectedService(null); setSelectedDate(""); setSelectedTime(""); setClientName(""); setClientPhone(""); }}
              className="bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-pink-200 hover:shadow-xl active:scale-[0.98] transition-all"
            >
              Fazer Outro Agendamento
            </button>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="space-y-8 animate-in fade-in duration-300">
            
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-lg shadow-rose-100/40 border border-white">
              <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-3">
                <span className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Selecione o Serviço
              </h3>

              <div className="space-y-3">
                {services.length === 0 && (
                  <p className="text-slate-500 text-sm italic text-center py-4">Nenhum serviço disponível no momento.</p>
                )}
                {services.map((service) => {
                  const isSelected = selectedService?.id === service.id;
                  return (
                    <div 
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                        isSelected 
                          ? 'border-pink-500 bg-pink-50/50 shadow-sm' 
                          : 'border-slate-100 hover:border-pink-200 bg-white'
                      }`}
                    >
                      <div>
                        <h4 className={`font-bold ${isSelected ? 'text-pink-700' : 'text-slate-800'}`}>{service.name}</h4>
                        <p className="text-xs text-slate-400 mt-1 font-medium">{service.duration_minutes} minutos</p>
                      </div>
                      <span className="text-lg sm:text-xl font-extrabold text-pink-600">R$ {service.price.toFixed(2).replace(".", ",")}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-lg shadow-rose-100/40 border border-white">
              <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-3">
                <span className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Data e Horário
              </h3>

              <div className="space-y-6">
                <div>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-300 text-slate-800 font-medium transition-all"
                  />
                </div>

                <div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {availableHours.map((time) => {
                      const isTimeSelected = selectedTime === time;
                      
                      const [h, m] = time.split(":").map(Number);
                      const slotStart = (h * 60) + m;
                      const duration = selectedService ? selectedService.duration_minutes : 30; 
                      const slotEnd = slotStart + duration;

                      const isBooked = bookedIntervals.some(inv => {
                        return (slotStart < inv.endMins) && (slotEnd > inv.startMins);
                      });
                      
                      return (
                        <button
                          type="button"
                          key={time}
                          disabled={isBooked}
                          onClick={() => selectedService ? setSelectedTime(time) : setAlertMessage("Por favor, selecione um serviço no Passo 1 primeiro!")}
                          className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                            isBooked 
                              ? 'bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed line-through opacity-70'
                              : isTimeSelected 
                                ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white border-transparent shadow-md shadow-pink-200 scale-105' 
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
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-lg shadow-rose-100/40 border border-white">
              <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-3">
                <span className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                Seus Dados
              </h3>

              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Nome Completo"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-300 text-slate-800 font-medium transition-all"
                />
                <input 
                  type="text" 
                  placeholder="WhatsApp (Ex: 21999999999)"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-300 text-slate-800 font-medium transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-extrabold text-lg py-5 rounded-2xl shadow-xl shadow-pink-200 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all"
            >
              {submitting ? "Confirmando Agendamento..." : "Confirmar Agendamento"}
            </button>
          </form>
        )}
      </main>

      {/* Modal de Aviso Personalizado */}
      {alertMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xs w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200 text-center">
            <h3 className="text-xl font-extrabold text-slate-800 mb-2">
              {profile?.business_name || "Aviso"}
            </h3>
            <p className="text-slate-600 mb-6 font-medium">{alertMessage}</p>
            <button
              type="button"
              onClick={() => setAlertMessage("")}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-pink-200"
            >
              OK, entendi
            </button>
          </div>
        </div>
      )}

    </div>
  );
}