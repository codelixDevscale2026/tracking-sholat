import { createFileRoute } from "@tanstack/react-router";
import { StatsPage } from "@/features/stats/components/StatsPage";

export const Route = createFileRoute("/stats")({
	component: StatsPage,
});
