import { AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useCheckIn } from "../hooks/useCheckIn";
import type { PrayerName, PrayerStatus } from "../types/prayer.types";

interface PrayerCardProps {
	prayerName: PrayerName;
	adzanTime: string;
	bufferLimit: string;
	status?: PrayerStatus;
	isNext?: boolean;
	isChecked?: boolean;
	userId?: number;
}

export function PrayerCard({
	prayerName,
	adzanTime,
	bufferLimit,
	status,
	isNext,
	userId,
}: PrayerCardProps): ReactNode {
	const { mutate: checkIn, isPending: isCheckingIn } = useCheckIn();

	// Map status to variants used in the spec
	// Handle both uppercase (from database) and lowercase (from backend logic)
	const normalizedStatus = status?.toUpperCase();
	const isOnTime = normalizedStatus === "ON_TIME";
	const isPerformed = normalizedStatus === "PERFORMED";
	const isDone = isOnTime || isPerformed;
	const isMissed = normalizedStatus === "MISSED";
	const isUpcoming = status === "upcoming";
	const isPending = status === "pending";

	const handleCheckIn = () => {
		if (!isDone && !isMissed && !isUpcoming && !isCheckingIn && userId) {
			checkIn({ prayerName, userId });
		}
	};

	return (
		<div
			className={cn(
				"relative p-4 rounded-xl transition-all duration-300 shadow-sm border",
				// Card yang bisa check-in (pending) - kehijauan dengan border hijau
				isPending
					? "bg-primary/5 dark:bg-primary/10 border-primary/30"
					: isNext
						? "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 opacity-70"
						: "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800",
				isMissed ? "border-l-4 border-l-destructive bg-destructive/5" : "",
				isOnTime
					? "border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10"
					: "",
				isPerformed
					? "border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10"
					: "",
				isUpcoming && !isMissed && !isNext && "opacity-70",
			)}
		>
			<div className="flex items-center justify-between relative z-10">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<span className="font-bold text-base text-zinc-900 dark:text-zinc-100 capitalize">
							{prayerName}
						</span>
						{(status || isMissed) && !isUpcoming && (
							<span
								className={cn(
									"px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
									isMissed
										? "bg-destructive/10 text-destructive border border-destructive/20"
										: isOnTime
											? "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
											: isPerformed
												? "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
												: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
								)}
							>
								{isMissed ? "MISSED" : isOnTime ? "ON TIME" : status}
							</span>
						)}
					</div>
					<p
						className={cn(
							"text-2xl font-bold",
							isPending ? "text-primary" : "text-zinc-900 dark:text-zinc-100",
						)}
					>
						{adzanTime}
					</p>
					<p className="text-[10px] text-zinc-500 font-medium">
						Batas: {bufferLimit}
					</p>
				</div>

				<div className="flex flex-col items-end gap-3">
					{isMissed ? (
						<button
							type="button"
							className="bg-destructive/10 text-destructive border border-destructive/20 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 cursor-not-allowed"
							disabled
						>
							<AlertCircle className="w-4 h-4" />
							Missed
						</button>
					) : isOnTime ? (
						<button
							type="button"
							className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm"
							disabled
						>
							<CheckCircle2 className="w-4 h-4" />
							Done
						</button>
					) : isPerformed ? (
						<button
							type="button"
							className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm"
							disabled
						>
							<Clock className="w-4 h-4" />
							Late
						</button>
					) : isPending ? (
						<button
							type="button"
							onClick={handleCheckIn}
							disabled={isCheckingIn}
							className={cn(
								"px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
								isPending
									? "bg-white dark:bg-zinc-800 border border-primary text-primary hover:bg-primary hover:text-white"
									: "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700",
							)}
						>
							{isCheckingIn ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" />
									Loading...
								</>
							) : (
								"Check-in"
							)}
						</button>
					) : (
						<button
							type="button"
							className="bg-zinc-100 dark:bg-zinc-800 text-zinc-400 px-4 py-2 rounded-lg text-sm font-bold cursor-not-allowed"
							disabled
						>
							Check-in
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
