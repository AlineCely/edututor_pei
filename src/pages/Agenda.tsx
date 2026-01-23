import DashboardLayout from "../layouts/DashboardLayout";
import AgendaHeader from "../components/Agenda/AgendaHeader";
import AgendaSidebar from "../components/Agenda/AgendaSidebar";
import AgendaTimeline from "../components/Agenda/AgendaTimeline";
import AgendaCalendar from "../components/Agenda/AgendaCalendar";

export default function Agenda() {
  return (
    <DashboardLayout>
      <AgendaHeader />

      <div style={{ display: "flex", gap: "24px" }}>
        <AgendaSidebar />
        <div style={{ flex: 1 }}>
          <AgendaCalendar />
          <AgendaTimeline />
        </div>
      </div>
    </DashboardLayout>
  );
}
