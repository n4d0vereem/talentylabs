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

const DnDCalendar = withDragAndDrop(Calendar);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "rdv" | "collab";
  description?: string;
  location?: string;
  document?: string; // URL ou base64 du document
  photo?: string; // URL ou base64 de la photo
  link?: string; // Lien externe
}

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
    type: "rdv" as "rdv" | "collab",
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
        type: "rdv",
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
    const colors = {
      rdv: { bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", text: "#fff" },
      collab: { bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", text: "#fff" },
    };
    
    return {
      style: {
        background: colors[event.type].bg,
        color: colors[event.type].text,
        border: "none",
        borderRadius: "12px",
        padding: "6px 10px",
        fontSize: "13px",
        fontWeight: "400",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      },
    };
  };

  // Version compacte pour la vue d'ensemble
  if (compact) {
    const upcomingEvents = events
      .filter((e) => e.start >= new Date())
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 3);

    return (
      <div className="space-y-3">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => router.push(`/dashboard/creators/${talentId}?tab=planning`)}
              className="p-4 rounded-2xl border border-black/5 hover:border-black/10 transition-all group cursor-pointer"
              style={{
                background: event.type === "rdv" 
                  ? "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)"
                  : "linear-gradient(135deg, rgba(240, 147, 251, 0.05) 0%, rgba(245, 87, 108, 0.05) 100%)"
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
          <h3 className="text-2xl font-light text-black min-w-[200px]">
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
              className={`px-4 py-2 rounded-lg text-sm font-light transition-all ${
                view === "day" ? "bg-white shadow-sm text-black" : "text-black/50"
              }`}
            >
              Jour
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-4 py-2 rounded-lg text-sm font-light transition-all ${
                view === "week" ? "bg-white shadow-sm text-black" : "text-black/50"
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setView("month")}
              className={`px-4 py-2 rounded-lg text-sm font-light transition-all ${
                view === "month" ? "bg-white shadow-sm text-black" : "text-black/50"
              }`}
            >
              Mois
            </button>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="btn-accent rounded-xl font-light"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel événement
          </Button>
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}></div>
          <span className="text-sm text-black/60 font-light">Rendez-vous</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}></div>
          <span className="text-sm text-black/60 font-light">Collaboration</span>
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-white rounded-3xl overflow-hidden border border-black/5 p-6 calendar-modern">
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleEventClick}
          eventPropGetter={eventStyleGetter}
          view={view}
          onView={(newView) => setView(newView as any)}
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          draggableAccessor={() => true}
          resizable
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          scrollToTime={new Date()}
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
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "rdv" | "collab" })}
                  className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-black/5 px-4 text-black font-light"
                >
                  <option value="rdv">Rendez-vous</option>
                  <option value="collab">Collaboration</option>
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
                    className="w-3 h-3 rounded-full" 
                    style={{ 
                      background: selectedEvent.type === "rdv" 
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                    }}
                  />
                  <span className="text-xs text-black/50 font-medium uppercase tracking-wide">
                    {selectedEvent.type === "rdv" ? "Rendez-vous" : "Collaboration"}
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
  );
}
