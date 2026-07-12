"use client";

import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";

interface CalendarService {
  id: string;
  date: string; // ISO
  title: string;
}

export function ServiceCalendar({ services }: { services: CalendarService[] }) {
  const router = useRouter();

  return (
    <div className="service-calendar rounded-2xl border bg-card p-4 shadow-sm">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={ptBrLocale}
        height="auto"
        headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
        events={services.map((s) => ({
          id: s.id,
          title: s.title,
          date: s.date.slice(0, 10),
        }))}
        eventClick={(info) => router.push(`/planejamento/${info.event.id}`)}
        dayMaxEventRows={3}
      />
    </div>
  );
}
