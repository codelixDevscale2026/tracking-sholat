import { Moon, Star, Sun, Sunrise, Sunset } from "lucide-react";
import type * as React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { PrayerBreakdownItem } from "../types/stats.types";

interface PrayerBreakdownListProps {
	data: PrayerBreakdownItem[];
}

const prayerIcons: Record<string, React.ReactNode> = {
	subuh: <Sunrise className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />,
	dzuhur: <Sun className="w-5 h-5 text-amber-500 fill-amber-500/10" />,
	ashar: <Sunset className="w-5 h-5 text-orange-500 fill-orange-500/10" />,
	maghrib: <Moon className="w-5 h-5 text-indigo-500 fill-indigo-500/10" />,
	isya: <Star className="w-5 h-5 text-violet-500 fill-violet-500/10" />,
};

const prayerLabels: Record<string, string> = {
	subuh: "Fajr",
	dzuhur: "Dhuhr",
	ashar: "Asr",
	maghrib: "Maghrib",
	isya: "Isha",
};

export function PrayerBreakdownList({ data }: PrayerBreakdownListProps) {
	return (
		<div className="flex flex-col gap-6 w-full">
			<div className="flex items-baseline justify-between">
				<h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 italic tracking-tight uppercase">
					Prayer Breakdown
				</h3>
				<span className="text-zinc-400 dark:text-zinc-500 text-xs font-medium">
					Consistency %
				</span>
			</div>
			<div className="flex flex-col gap-4">
				{data.map((item) => (
					<Card
						key={item.prayer_name}
						className="border dark:border-zinc-800/50 rounded-2xl p-4 flex flex-col gap-4 shadow-none bg-white dark:bg-[#152e25]/20 hover:bg-zinc-50 dark:hover:bg-[#152e25]/40 transition-colors duration-200"
					>
						<div className="flex items-center justify-between gap-4">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center shrink-0 shadow-sm">
									{prayerIcons[item.prayer_name] || (
										<Sun className="w-5 h-5 text-zinc-400" />
									)}
								</div>
								<div className="flex flex-col">
									<span className="text-base font-black text-zinc-900 dark:text-zinc-100 leading-tight">
										{prayerLabels[item.prayer_name] || item.prayer_name}
									</span>
									<span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 opacity-90 tracking-tight">
										{item.consistency_percentage}% Consistency
									</span>
								</div>
							</div>
							<div className="flex flex-col items-end gap-0.5 shrink-0">
								<span className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">
									{item.on_time}/{item.total}
								</span>
								<span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-emerald-200/40 tracking-widest leading-none">
									ON-TIME
								</span>
							</div>
						</div>
						<div className="w-full flex flex-col gap-1.5 px-0.5">
							<Progress
								value={item.consistency_percentage}
								className="h-1.5 bg-zinc-100 dark:bg-zinc-800/50"
								indicatorClassName={cn(
									item.consistency_percentage >= 90
										? "bg-emerald-500"
										: item.consistency_percentage >= 70
											? "bg-amber-500"
											: "bg-rose-500",
								)}
							/>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
}
