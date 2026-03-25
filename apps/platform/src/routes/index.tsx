import { createFileRoute, redirect } from "@tanstack/react-router";
import { PrayerDashboard } from "@/features/prayer";

export const Route = createFileRoute("/")({
	beforeLoad: () => {
		if (typeof window !== "undefined" && !localStorage.getItem("auth_token")) {
			throw redirect({ to: "/login" });
		}
	},
	component: DashboardPage,
});

function DashboardPage() {
	return <PrayerDashboard />;
}
