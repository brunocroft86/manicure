"use server";

import { createClient } from "@supabase/supabase-js";
import { format, parse, isBefore, startOfHour } from "date-fns";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function createBookingAction(formData: {
  salonSlug: string;
  dateStr: string; // Ex: '2026-08-09'
  timeStr: string; // Ex: '10:00'
  clientName: string;
  serviceId: string;
}) {
    
  // 1. Verificação de Segurança de Horário (CRUCIAL)
  
  // Pegamos a hora atual EXATA
  const now = new Date(); 
  
  // Criamos o objeto Date completo do agendamento solicitado
  // '2026-08-09' + '10:00' -> Cria Date de 09/08/2026 10:00:00
  const bookingDateTime = parse(
      `${formData.dateStr} ${formData.timeStr}`, 
      'yyyy-MM-dd HH:mm', 
      new Date()
  );

  // Verificação final: se o horário de agendamento solicitado é ANTES de agora
  if (isBefore(bookingDateTime, now)) {
     // Lançamos um erro para o frontend lidar, impedindo a inserção no Supabase
     throw new Error("Não é possível realizar agendamentos para horários que já passaram.");
  }

  // ----------------------------------------------------
  // 2. O restante do seu código de inserção no Supabase...
  // ----------------------------------------------------

  try {
     // Achar o salão pelo slug
     const { data: profile } = await supabase
       .from("profiles")
       .select("id")
       .eq("slug", formData.salonSlug)
       .single();
       
     if (!profile) throw new Error("Salão não encontrado.");

     // Inserir agendamento
     const { error: insertError } = await supabase.from("appointments").insert([
       {
         profile_id: profile.id,
         date: formData.dateStr, // Ex: '2026-08-09'
         start_time: formData.timeStr, // Ex: '10:00'
         client_name: formData.clientName,
         service_id: formData.serviceId,
         status: 'PENDENTE'
       },
     ]);

     if (insertError) throw insertError;

     return { success: true };
  } catch (error) {
     console.error("Erro na criação:", error);
     return { success: false, error: (error as Error).message };
  }
}