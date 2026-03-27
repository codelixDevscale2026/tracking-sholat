import { Moon, Sun, Sunrise, Sunset } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HistoryPrayerItem } from "../types/prayer.types";

interface HistoryItemProps {
	prayer: HistoryPrayerItem;
}

const prayerIcons: Record<string, ReactNode> = {
	subuh: <Sunrise className="w-6 h-6 text-emerald-600" />,
	dzuhur: <Sun className="w-6 h-6 text-emerald-600" />,
	ashar: <Sun className="w-6 h-6 text-emerald-600" />,
	maghrib: <Sunset className="w-6 h-6 text-emerald-600" />,
	isya: <Moon className="w-6 h-6 text-emerald-600" />,
};

function formatTime(isoString: string | null): string {
	if (!isoString) return "--:--";
	const date = new Date(isoString);
	return date.toLocaleTimeString("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function HistoryItem({ prayer }: HistoryItemProps) {
	const { prayer_name, adzan_time, check_in_at, status } = prayer;

	const normalizedStatus = status.toLowerCase();
	const isOnTime =
		normalizedStatus === "on-time" || normalizedStatus === "on_time";
	const isPerformed = normalizedStatus === "performed";
	const isMissed = normalizedStatus === "missed";
	const isLate = normalizedStatus === "late";
	const isEarly = normalizedStatus === "early";

	return (
		<div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-emerald-500/5 transition-colors">
			<div className="flex items-center gap-4">
				<div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
					{prayerIcons[prayer_name.toLowerCase()] || (
						<Sun className="w-6 h-6 text-emerald-600" />
					)}
				</div>
				<div className="space-y-0.5">
					<h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 capitalize">
						{prayer_name}
					</h4>
					<p className="text-xs text-zinc-500">
						Adzan {formatTime(adzan_time)}
					</p>
				</div>
			</div>

			<div className="flex flex-col items-end gap-1.5">
				<span
					className={cn(
						"text-sm font-bold",
						isOnTime
							? "text-emerald-500"
							: isPerformed || isLate
								? "text-amber-500"
								: isMissed
									? "text-destructive"
									: isEarly
										? "text-blue-500"
										: "text-zinc-500",
					)}
				>
					{isMissed ? "--:--" : formatTime(check_in_at)}
				</span>

				<Badge
					variant="outline"
					className={cn(
						"px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
						isMissed
							? "bg-destructive/10 text-destructive border-destructive/20"
							: isOnTime
								? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
								: isPerformed || isLate
									? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
									: isEarly
										? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
										: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
					)}
				>
					{normalizedStatus.replace("_", " ")}
				</Badge>
			</div>
		</div>
	);
}
