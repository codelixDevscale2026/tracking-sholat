import { createFileRoute } from "@tanstack/react-router";
import { PrayerDashboard } from "@/features/prayer";

export const Route = createFileRoute("/")({
	component: DashboardPage,
});

function DashboardPage() {
	return <PrayerDashboard />;
}
