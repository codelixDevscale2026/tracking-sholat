import { cn } from "@/lib/utils";
import type { HistoryDayGroup as HistoryDayGroupType } from "../types/prayer.types";
import { HistoryItem } from "./HistoryItem";

interface HistoryDayGroupProps {
	group: HistoryDayGroupType;
}

function formatDate(dateStr: string): string {
	const todayStr = new Date().toISOString().split("T")[0];
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	const yesterdayStr = yesterday.toISOString().split("T")[0];

	if (dateStr === todayStr) return "TODAY";
	if (dateStr === yesterdayStr) return "YESTERDAY";

	const date = new Date(dateStr);
	return date
		.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
		.toUpperCase();
}

export function HistoryDayGroup({ group }: HistoryDayGroupProps) {
	const { date, total_completed, total_prayers, prayers } = group;

	return (
		<div className="mt-6 first:mt-4 overflow-hidden rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800">
			<div className="bg-emerald-500/5 dark:bg-emerald-500/10 px-4 py-2 flex items-center justify-between">
				<h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
					{formatDate(date)}, {new Date(date).getDate()}{" "}
					{new Date(date)
						.toLocaleDateString("en-GB", { month: "short" })
						.toUpperCase()}
				</h3>
				<span className="text-xs font-medium text-zinc-500">
					{total_completed}/{total_prayers} Completed
				</span>
			</div>

			<div
				className={cn(
					"divide-y divide-emerald-500/5",
					total_completed === total_prayers &&
						"bg-emerald-500/2 dark:bg-emerald-500/2",
				)}
			>
				{prayers.map((prayer) => (
					<HistoryItem key={`${date}-${prayer.prayer_name}`} prayer={prayer} />
				))}
			</div>
		</div>
	);
}
