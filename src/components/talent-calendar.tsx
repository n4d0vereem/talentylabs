"use client";

import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, X, Clock, MapPin, ChevronLeft, ChevronRight, Link2, FileText, Image as ImageIcon, ExternalLink, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getEvents, createEvent, updateEvent, deleteEvent as deleteEventAPI } from "@/lib/api-client";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const locales = { fr };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "RDV" | "EVENT" | "PREVIEW" | "PUBLICATION" | "TOURNAGE" | "rdv" | "collab"; // Support anciens types
  description?: string;
  location?: string;
  document?: string; // URL ou base64 du document
  photo?: string; // URL ou base64 de la photo
  link?: string; // Lien externe
}

const DnDCalendar = withDragAndDrop<CalendarEvent>(Calendar);

// Composant personnalisé pour les en-têtes de colonnes (jours de la semaine)
const CustomHeader = ({ date, label }: { date: Date; label: string }) => {
  const dayName = format(date, "EEEE", { locale: fr });
  const dayNumber = format(date, "d");
  const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  
  return (
    <div className="flex flex-col items-center py-3 px-1.5 gap-2">
      <span className="text-xs font-normal capitalize text-gray-400">
        {dayName}
      </span>
      <div className={`flex items-center justify-center rounded-xl px-4 py-2 min-w-[56px] ${
        isToday 
          ? "bg-black text-white" 
          : "bg-gray-100 text-gray-700"
      }`}>
        <span className="text-2xl font-semibold">
          {dayNumber}
        </span>
      </div>
    </div>
  );
};

// Composant pour les en-têtes de mois
const CustomMonthHeader = ({ date, label }: { date: Date; label: string }) => {
  const dayName = format(date, "EEEE", { locale: fr });
  const dayNumber = format(date, "d");
  const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  
  return (
    <div className="flex flex-col items-center py-2 px-1 gap-1.5">
      <span className="text-xs font-normal capitalize text-gray-400">
        {dayName}
      </span>
      <div className={`flex items-center justify-center rounded-lg px-3 py-1.5 min-w-[48px] ${
        isToday 
          ? "bg-black text-white" 
          : "bg-gray-100 text-gray-700"
      }`}>
        <span className="text-2xl font-semibold">
          {dayNumber}
        </span>
      </div>
    </div>
  );
};

interface TalentCalendarProps {
  talentId: string;
  compact?: boolean;
}

export function TalentCalendar({ talentId, compact = false }: TalentCalendarProps) {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<"month" | "week" | "day">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formData, setFormData] = useState({
    title: "",
    type: "RDV" as "RDV" | "EVENT" | "PREVIEW" | "PUBLICATION" | "TOURNAGE" | "rdv" | "collab",
    description: "",
    location: "",
    document: null as File | null,
    photo: null as File | null,
    link: "",
    startDate: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const apiEvents = await getEvents(talentId);
        setEvents(
          apiEvents.map((e: any) => ({
            ...e,
            start: new Date(e.start),
            end: new Date(e.end),
          }))
        );
      } catch (error) {
        console.error("Erreur lors du chargement des événements:", error);
      }
    };

    loadEvents();
  }, [talentId]);

  const handleSelectSlot = (slotInfo: any) => {
    setFormData({
      ...formData,
      startDate: format(slotInfo.start, "yyyy-MM-dd"),
      startTime: format(slotInfo.start, "HH:mm"),
      endTime: format(slotInfo.end, "HH:mm"),
    });
    setIsModalOpen(true);
  };

  const handleAddEvent = async () => {
    if (!formData.title || !formData.startDate || !formData.startTime || !formData.endTime) {
      alert("Veuillez remplir tous les champs requis");
      return;
    }

    // Vérifier la taille des fichiers (max 2MB chacun)
    if (formData.document && formData.document.size > 2 * 1024 * 1024) {
      alert("⚠️ Le document est trop volumineux (max 2MB)");
      return;
    }

    if (formData.photo && formData.photo.size > 2 * 1024 * 1024) {
      alert("⚠️ La photo est trop volumineuse (max 2MB)");
      return;
    }

    const start = new Date(`${formData.startDate}T${formData.startTime}`);
    const end = new Date(`${formData.startDate}T${formData.endTime}`);

    // Convertir les fichiers en base64
    let documentBase64 = "";
    let photoBase64 = "";

    try {
      if (formData.document) {
        documentBase64 = await fileToBase64(formData.document);
      }

      if (formData.photo) {
        photoBase64 = await fileToBase64(formData.photo);
      }

      const newEvent = await createEvent({
        talentId,
        title: formData.title,
        start: start.toISOString(),
        end: end.toISOString(),
        type: formData.type,
        description: formData.description,
        location: formData.location,
        document: documentBase64,
        photo: photoBase64,
        link: formData.link,
      });

      setEvents([...events, { ...newEvent, start, end }]);
      setIsModalOpen(false);
      setFormData({
        title: "",
        type: "RDV",
        description: "",
        location: "",
        document: null,
        photo: null,
        link: "",
        startDate: "",
        startTime: "",
        endTime: "",
      });
    } catch (error) {
      console.error("Erreur lors de la création de l'événement:", error);
      alert("❌ Erreur lors de la création de l'événement.");
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm("Supprimer cet événement ?")) {
      try {
        await deleteEventAPI(eventId);
        setEvents(events.filter((e) => e.id !== eventId));
        setIsDetailModalOpen(false);
      } catch (error) {
        console.error("Erreur lors de la suppression de l'événement:", error);
        alert("❌ Erreur lors de la suppression");
      }
    }
  };

  const handleEventDrop = async ({ event, start, end }: any) => {
    try {
      await updateEvent(event.id, {
        start: start.toISOString(),
        end: end.toISOString(),
      });
      const updatedEvents = events.map((ev) => {
        if (ev.id === event.id) {
          return { ...ev, start, end };
        }
        return ev;
      });
      setEvents(updatedEvents);
    } catch (error) {
      console.error("Erreur lors du déplacement de l'événement:", error);
      alert("❌ Erreur lors du déplacement");
    }
  };

  const handleEventResize = async ({ event, start, end }: any) => {
    try {
      await updateEvent(event.id, {
        start: start.toISOString(),
        end: end.toISOString(),
      });
      const updatedEvents = events.map((ev) => {
        if (ev.id === event.id) {
          return { ...ev, start, end };
        }
        return ev;
      });
      setEvents(updatedEvents);
    } catch (error) {
      console.error("Erreur lors du redimensionnement de l'événement:", error);
      alert("❌ Erreur lors du redimensionnement");
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    // Dégradés modernes et trendy pour chaque type d'événement
    const colors: Record<string, { bg: string; text: string }> = {
      RDV: { 
        bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Violet profond
        text: "#ffffff" 
      },
      EVENT: { 
        bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", // Rose/Rouge
        text: "#ffffff" 
      },
      PREVIEW: { 
        bg: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", // Pêche/Corail
        text: "#7c2d12" 
      },
      PUBLICATION: { 
        bg: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)", // Bleu très doux pastel
        text: "#4338ca" 
      },
      TOURNAGE: { 
        bg: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", // Rose/Jaune
        text: "#ffffff" 
      },
      // Support anciens types
      rdv: { 
        bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        text: "#ffffff" 
      },
      collab: { 
        bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        text: "#ffffff" 
      },
    };
    
    const eventColor = colors[event.type] || colors.RDV;
    
    return {
      style: {
        background: eventColor.bg,
        color: eventColor.text,
        border: "none",
        borderRadius: "12px",
        padding: "6px 10px",
        fontSize: "12px",
        fontWeight: "400",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "normal",
        lineHeight: "1.4",
        textTransform: "none",
      },
    };
  };

  // Version compacte pour la vue d'ensemble
  if (compact) {
    const upcomingEvents = events
      .filter((e) => e.start >= new Date())
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 5);

    return (
      <div className="space-y-3">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => router.push(`/dashboard/creators/${talentId}?tab=planning`)}
              className="p-4 rounded-2xl border border-black/5 hover:border-black/10 transition-all group cursor-pointer"
              style={{
                background: 
                  (event.type === "RDV" || event.type === "rdv") ? "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)" :
                  (event.type === "EVENT" || event.type === "collab") ? "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)" :
                  event.type === "PREVIEW" ? "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)" :
                  event.type === "PUBLICATION" ? "linear-gradient(135deg, #f5f7ff 0%, #eef2ff 100%)" :
                  event.type === "TOURNAGE" ? "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)" :
                  "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                borderLeft: 
                  (event.type === "RDV" || event.type === "rdv") ? "4px solid #667eea" :
                  (event.type === "EVENT" || event.type === "collab") ? "4px solid #f093fb" :
                  event.type === "PREVIEW" ? "4px solid #fcb69f" :
                  event.type === "PUBLICATION" ? "4px solid #a5b4fc" :
                  event.type === "TOURNAGE" ? "4px solid #fa709a" :
                  "4px solid #667eea"
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-black mb-1 truncate">{event.title}</p>
                  <div className="flex items-center gap-3 text-xs text-black/50">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-medium text-black/40">
                      {format(event.start, "EEE", { locale: fr })}
                    </p>
                    <p className="text-lg font-light text-black">
                      {format(event.start, "dd")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-black/40 font-light">Aucun événement à venir</p>
          </div>
        )}
      </div>
    );
  }

  // Version complète pour l'onglet Planning
  return (
    <>
      <style jsx global>{`
        /* Design moderne ultra-clean inspiré de l'image */
        
        /* Événements - Design pastel et arrondi */
        .calendar-modern .rbc-event {
          padding: 8px 12px !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          border-radius: 16px !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.06) !important;
          border: none !important;
        }
        
        .calendar-modern .rbc-event-content {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: normal;
          line-height: 1.4;
        }
        
        /* Vue Mois - Style moderne */
        .calendar-modern .rbc-month-view .rbc-header {
          padding: 12px 0 !important;
        }
        
        .calendar-modern .rbc-month-view .rbc-date-cell {
          padding: 2px 4px !important;
          text-align: left;
        }
        
        .calendar-modern .rbc-month-view .rbc-date-cell > a {
          font-size: 13px;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.6);
        }
        
        .calendar-modern .rbc-month-view .rbc-event {
          padding: 6px 10px !important;
          margin: 3px 4px !important;
          font-size: 12px !important;
          border-radius: 12px !important;
        }
        
        .calendar-modern .rbc-month-view .rbc-row-content {
          padding-top: 4px;
        }
        
        .calendar-modern .rbc-month-view .rbc-day-bg + .rbc-day-bg {
          border-left: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .calendar-modern .rbc-month-view .rbc-month-row {
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          min-height: 100px;
        }
        
        /* Vue Semaine/Jour - Design spacieux */
        .calendar-modern .rbc-day-slot .rbc-event {
          padding: 6px 10px !important;
          margin: 2px 4px !important;
          border-radius: 14px !important;
        }
        
        .calendar-modern .rbc-day-slot .rbc-events-container {
          margin-right: 6px;
        }
        
        .calendar-modern .rbc-time-slot {
          border-top: 1px solid rgba(0, 0, 0, 0.03);
          min-height: 50px;
        }
        
        .calendar-modern .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid rgba(0, 0, 0, 0.03);
        }
        
        /* En-têtes modernes */
        .calendar-modern .rbc-time-header {
          min-height: 50px;
        }
        
        /* En-têtes des jours - Design moderne avec gros chiffres */
        .calendar-modern .rbc-header {
          padding: 0 !important;
          border-bottom: none !important;
          background: transparent;
          overflow: visible;
          display: block !important;
          visibility: visible !important;
        }
        
        /* Forcer l'affichage en vue jour */
        .calendar-modern .rbc-time-view .rbc-header {
          display: flex !important;
          justify-content: center;
          align-items: center;
        }
        
        .calendar-modern .rbc-time-header-content {
          border-left: none !important;
        }
        
        .calendar-modern .rbc-time-header {
          border-bottom: 2px solid rgba(0, 0, 0, 0.05) !important;
          padding-bottom: 8px;
        }
        
        /* Espacement pour les en-têtes personnalisés */
        .calendar-modern .rbc-header + .rbc-header {
          border-left: none !important;
        }
        
        /* Colonne du jour actuel */
        .calendar-modern .rbc-today {
          background-color: rgba(0, 0, 0, 0.01) !important;
        }
        
        .calendar-modern .rbc-time-column.rbc-today {
          background-color: rgba(0, 0, 0, 0.015) !important;
        }
        
        /* Colonne des heures */
        .calendar-modern .rbc-time-content {
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .calendar-modern .rbc-label {
          font-size: 11px;
          color: rgba(0, 0, 0, 0.4);
          font-weight: 400;
          padding-right: 8px;
        }
        
        .calendar-modern .rbc-timeslot-group {
          min-height: 50px;
        }
        
        /* Bordures plus douces */
        .calendar-modern .rbc-day-slot .rbc-time-column {
          border-left: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .calendar-modern .rbc-time-header-content {
          border-left: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        /* "+X more" button style */
        .calendar-modern .rbc-show-more {
          font-size: 11px;
          color: rgba(0, 0, 0, 0.6);
          padding: 4px 8px;
          margin: 2px 4px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.03);
          font-weight: 500;
        }
        
        .calendar-modern .rbc-show-more:hover {
          background: rgba(0, 0, 0, 0.06);
        }
        
        /* Sélection de plage horaire */
        .calendar-modern .rbc-slot-selection {
          background-color: rgba(0, 0, 0, 0.1);
          border-radius: 12px;
        }
        
        /* Espacement général plus aéré */
        .calendar-modern .rbc-time-view {
          border: none;
        }
        
        .calendar-modern .rbc-month-view {
          border: none;
        }
      `}</style>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() - 1);
              setCurrentDate(newDate);
            }}
            className="h-10 w-10 p-0 rounded-xl border-black/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-2xl font-normal text-black min-w-[200px] capitalize">
            {format(currentDate, "MMMM yyyy", { locale: fr })}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() + 1);
              setCurrentDate(newDate);
            }}
            className="h-10 w-10 p-0 rounded-xl border-black/10"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="rounded-xl border-black/10 font-light"
          >
            Aujourd'hui
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/5 rounded-xl p-1">
            <button
              onClick={() => setView("day")}
              className={`px-4 py-2 rounded-lg text-sm font-normal transition-all ${
                view === "day" ? "bg-white shadow-sm text-black" : "text-black/60 hover:text-black"
              }`}
            >
              Jour
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-4 py-2 rounded-lg text-sm font-normal transition-all ${
                view === "week" ? "bg-white shadow-sm text-black" : "text-black/60 hover:text-black"
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setView("month")}
              className={`px-4 py-2 rounded-lg text-sm font-normal transition-all ${
                view === "month" ? "bg-white shadow-sm text-black" : "text-black/60 hover:text-black"
              }`}
            >
              Mois
            </button>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white hover:bg-black/90 rounded-xl font-normal px-5 h-10 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel événement
          </Button>
        </div>
      </div>

      {/* Légende avec pastilles en dégradé */}
      <div className="flex items-center gap-5 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}></div>
          <span className="text-sm text-black/60 font-normal">RDV</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}></div>
          <span className="text-sm text-black/60 font-normal">EVENT</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" }}></div>
          <span className="text-sm text-black/60 font-normal">PREVIEW</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)" }}></div>
          <span className="text-sm text-black/60 font-normal">PUBLICATION</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" }}></div>
          <span className="text-sm text-black/60 font-normal">TOURNAGE</span>
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-white rounded-2xl overflow-hidden border border-black/5 p-8 calendar-modern shadow-sm">
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor={(event: CalendarEvent) => event.start}
          endAccessor={(event: CalendarEvent) => event.end}
          style={{ height: 700 }}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={(event: CalendarEvent) => handleEventClick(event)}
          eventPropGetter={(event: CalendarEvent) => eventStyleGetter(event)}
          view={view}
          onView={(newView) => setView(newView as any)}
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          draggableAccessor={() => true}
          resizable
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          scrollToTime={new Date()}
          components={{
            timeGutterHeader: () => null,
            week: {
              header: CustomHeader,
            },
            day: {
              header: CustomHeader,
            },
            month: {
              header: CustomMonthHeader,
            },
          }}
          messages={{
            next: "Suivant",
            previous: "Précédent",
            today: "Aujourd'hui",
            month: "Mois",
            week: "Semaine",
            day: "Jour",
            agenda: "Agenda",
            date: "Date",
            time: "Heure",
            event: "Événement",
            noEventsInRange: "Aucun événement",
            showMore: (total) => `+ ${total} événement(s)`,
          }}
          culture="fr"
          toolbar={false}
        />
      </div>

      {/* Modal Ajouter Événement */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <Card className="bg-white rounded-3xl p-8 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-light text-black">Nouvel événement</h3>
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="ghost"
                size="sm"
                className="rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-5">
              <div>
                <Label className="text-black/80 font-light">Titre</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Shooting, Meeting..."
                  className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                />
              </div>

              <div>
                <Label className="text-black/80 font-light">Type</Label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "RDV" | "EVENT" | "PREVIEW" | "PUBLICATION" | "TOURNAGE" | "rdv" | "collab" })}
                  className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-black/5 px-4 text-black font-light"
                >
                  <option value="RDV">RDV</option>
                  <option value="EVENT">EVENT</option>
                  <option value="PREVIEW">PREVIEW</option>
                  <option value="PUBLICATION">PUBLICATION</option>
                  <option value="TOURNAGE">TOURNAGE</option>
                </select>
              </div>

              <div>
                <Label className="text-black/80 font-light">Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-black/80 font-light">Heure début</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                  />
                </div>
                <div>
                  <Label className="text-black/80 font-light">Heure fin</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                  />
                </div>
              </div>

              <div>
                <Label className="text-black/80 font-light">Lieu</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Studio, Bureau..."
                  className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                />
              </div>

              <div>
                <Label className="text-black/80 font-light">Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Détails..."
                  className="mt-2 h-12 rounded-xl border-black/10 bg-black/5"
                />
              </div>

              <div>
                <Label className="text-black/80 font-light">Lien</Label>
                <div className="relative mt-2">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                  <Input
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://..."
                    className="h-12 rounded-xl border-black/10 bg-black/5 pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-black/80 font-light">Document</Label>
                  <label className="mt-2 flex items-center justify-center h-12 rounded-xl border border-dashed border-black/20 bg-black/5 cursor-pointer hover:border-black/30 transition-colors">
                    <FileText className="w-4 h-4 mr-2 text-black/40" />
                    <span className="text-sm text-black/60 font-light truncate px-2">
                      {formData.document ? formData.document.name : "Choisir un fichier"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setFormData({ ...formData, document: e.target.files?.[0] || null })}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-black/40 mt-1">Max 2MB</p>
                </div>
                <div>
                  <Label className="text-black/80 font-light">Photo</Label>
                  <label className="mt-2 flex items-center justify-center h-12 rounded-xl border border-dashed border-black/20 bg-black/5 cursor-pointer hover:border-black/30 transition-colors">
                    <ImageIcon className="w-4 h-4 mr-2 text-black/40" />
                    <span className="text-sm text-black/60 font-light truncate px-2">
                      {formData.photo ? formData.photo.name : "Choisir une image"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, photo: e.target.files?.[0] || null })}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-black/40 mt-1">Max 2MB</p>
                </div>
              </div>

              <Button
                onClick={handleAddEvent}
                className="w-full btn-accent rounded-xl font-light h-12 mt-6"
              >
                Ajouter l'événement
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Détails Événement */}
      {isDetailModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <Card className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-4 h-4 rounded-lg" 
                    style={{ 
                      background: 
                        (selectedEvent.type === "RDV" || selectedEvent.type === "rdv") ? "#C7D2FE" :
                        (selectedEvent.type === "EVENT" || selectedEvent.type === "collab") ? "#FBC4E4" :
                        selectedEvent.type === "PREVIEW" ? "#FEF3C7" :
                        selectedEvent.type === "PUBLICATION" ? "#e0e7ff" :
                        selectedEvent.type === "TOURNAGE" ? "#FED7AA" :
                        "#C7D2FE"
                    }}
                  />
                  <span className="text-xs text-black/50 font-medium uppercase tracking-wide">
                    {selectedEvent.type === "rdv" ? "RDV" : selectedEvent.type === "collab" ? "EVENT" : selectedEvent.type}
                  </span>
                </div>
                <h3 className="text-3xl font-light text-black">{selectedEvent.title}</h3>
              </div>
              <Button
                onClick={() => setIsDetailModalOpen(false)}
                variant="ghost"
                size="sm"
                className="rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Date et heure */}
              <div className="flex items-center gap-3 text-black/70">
                <Clock className="w-5 h-5 text-black/40" />
                <div>
                  <p className="font-medium">
                    {format(selectedEvent.start, "EEEE d MMMM yyyy", { locale: fr })}
                  </p>
                  <p className="text-sm text-black/50">
                    {format(selectedEvent.start, "HH:mm")} - {format(selectedEvent.end, "HH:mm")}
                  </p>
                </div>
              </div>

              {/* Lieu */}
              {selectedEvent.location && (
                <div className="flex items-center gap-3 text-black/70">
                  <MapPin className="w-5 h-5 text-black/40" />
                  <p>{selectedEvent.location}</p>
                </div>
              )}

              {/* Description */}
              {selectedEvent.description && (
                <div className="p-4 bg-black/5 rounded-2xl">
                  <p className="text-sm text-black/60 leading-relaxed">{selectedEvent.description}</p>
                </div>
              )}

              {/* Lien */}
              {selectedEvent.link && (
                <div>
                  <Label className="text-black/60 font-light text-xs uppercase tracking-wide mb-2">Lien</Label>
                  <a
                    href={selectedEvent.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-4 bg-black/5 rounded-2xl hover:bg-black/10 transition-colors group"
                  >
                    <Link2 className="w-4 h-4 text-black/40 group-hover:text-black/60" />
                    <span className="text-sm text-black/70 truncate flex-1">{selectedEvent.link}</span>
                    <ExternalLink className="w-4 h-4 text-black/40 group-hover:text-black/60" />
                  </a>
                </div>
              )}

              {/* Photo */}
              {selectedEvent.photo && (
                <div>
                  <Label className="text-black/60 font-light text-xs uppercase tracking-wide mb-2">Photo</Label>
                  <div className="rounded-2xl overflow-hidden border border-black/5">
                    <img 
                      src={selectedEvent.photo} 
                      alt="Photo événement" 
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}

              {/* Document */}
              {selectedEvent.document && (
                <div>
                  <Label className="text-black/60 font-light text-xs uppercase tracking-wide mb-2">Document</Label>
                  <a
                    href={selectedEvent.document}
                    download
                    className="flex items-center gap-3 p-4 bg-black/5 rounded-2xl hover:bg-black/10 transition-colors group"
                  >
                    <FileText className="w-5 h-5 text-black/40 group-hover:text-black/60" />
                    <span className="text-sm text-black/70 flex-1">Télécharger le document</span>
                  </a>
                </div>
              )}

              {/* Bouton supprimer */}
              <div className="pt-4 border-t border-black/5">
                <Button
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  variant="outline"
                  className="w-full border-red-200 hover:bg-red-50 text-red-600 rounded-xl font-light"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer l'événement
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      </div>
    </>
  );
}
