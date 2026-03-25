import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { PrayerStatus } from "../types/prayer.types";

interface PrayerCardProps {
	prayerName: string;
	adzanTime: string;
	bufferLimit: string;
	status?: PrayerStatus;
	isNext?: boolean;
}

export function PrayerCard({
	prayerName,
	adzanTime,
	bufferLimit,
	status,
	isNext,
}: PrayerCardProps): ReactNode {
	// Map status to variants used in the spec
	const isDone = status === "ON-TIME" || status === "PERFORMED";
	const isLate = status === "LATE" || status === "PERFORMED";
	const isMissed = status === "MISSED" || status === "YESTERDAY MISSED";
	const isUpcoming = status === "upcoming";
	const isPending = status === "pending";

	return (
		<div
			className={cn(
				"relative p-4 rounded-xl transition-all duration-300 shadow-sm border",
				isNext
					? "bg-primary/5 dark:bg-primary/10 border-primary/30"
					: "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800",
				isNext ? "border-l-4 border-l-primary" : "",
				!isNext && isDone ? "border-l-4 border-l-primary" : "",
				!isNext && isLate && !isDone ? "border-l-4 border-l-warning" : "",
				!isNext && isMissed ? "border-l-4 border-l-destructive" : "",
				(isUpcoming || (isPending && !isNext)) && "opacity-70",
			)}
		>
			<div className="flex items-center justify-between relative z-10">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<span className="font-bold text-base text-zinc-900 dark:text-zinc-100 capitalize">
							{prayerName}
						</span>
						{status && !isUpcoming && (
							<span
								className={cn(
									"px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
									isDone || status === "ON-TIME"
										? "bg-primary/10 text-primary"
										: isLate
											? "bg-warning/10 text-warning"
											: isMissed
												? "bg-destructive/10 text-destructive"
												: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
								)}
							>
								{status}
							</span>
						)}
					</div>
					<p
						className={cn(
							"text-2xl font-bold",
							isNext ? "text-primary" : "text-zinc-900 dark:text-zinc-100",
						)}
					>
						{adzanTime}
					</p>
					<p className="text-[10px] text-zinc-500 font-medium">
						Batas: {bufferLimit}
					</p>
				</div>

				<div className="flex flex-col items-end gap-3">
					{isDone && (
						<button
							type="button"
							className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm active:scale-95 transition-transform"
						>
							<CheckCircle2 className="w-4 h-4" />
							Done
						</button>
					)}
					{isLate && !isDone && (
						<button
							type="button"
							className="bg-warning text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm active:scale-95 transition-transform"
						>
							<Clock className="w-4 h-4" />
							Late
						</button>
					)}
					{isNext && (
						<button
							type="button"
							className="bg-white dark:bg-zinc-800 border border-primary text-primary px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-primary hover:text-white transition-all active:scale-95"
						>
							Check-in
						</button>
					)}
					{(isUpcoming || (isPending && !isNext)) && (
						<button
							type="button"
							className="bg-zinc-100 dark:bg-zinc-800 text-zinc-400 px-4 py-2 rounded-lg text-sm font-bold cursor-not-allowed"
							disabled
						>
							Check-in
						</button>
					)}
					{isMissed && (
						<div className="p-2">
							<AlertCircle className="w-6 h-6 text-destructive" />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
