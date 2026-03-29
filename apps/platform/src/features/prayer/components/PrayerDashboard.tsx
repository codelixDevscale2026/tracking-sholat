import { Bell } from "lucide-react";
import { useEffect } from "react";
import { MobileNav } from "@/components/layout/MobileNav";
import { useAuthFeature } from "@/features/auth/hooks/useAuthFeature";
import { useSettingsFeature } from "@/features/settings/hooks/useSettingsFeature";
import { cn } from "@/lib/utils";
import { useCountdown, useTodaySchedule } from "../hooks";
import type { PrayerSchedule } from "../types/prayer.types";
import { PrayerCard } from "./PrayerCard";

export function PrayerDashboard() {
	const { user } = useAuthFeature();
	const { settings } = useSettingsFeature();

	const { data, isLoading, isError, error, refetch, isFetching } =
		useTodaySchedule({
			userId: user?.id,
		});

	const countdownSeconds = data?.nextPrayer?.countdownSeconds ?? 0;
	const { countdown, reset } = useCountdown(countdownSeconds);

	// keep countdown in sync when the next prayer changes
	useEffect(() => {
		if (countdownSeconds <= 0) return;
		// Reset only when server countdown differs significantly (>= 3s).
		if (Math.abs(countdownSeconds - countdown) >= 3) {
			reset(countdownSeconds);
		}
	}, [countdownSeconds, countdown, reset]);

	const schedules = data?.schedules ?? [];
	const nextPrayerName = data?.nextPrayer?.prayerName;
	const timeZone =
		data?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

	const formatHHMM = (isoString: string) => {
		const d = new Date(isoString);
		if (Number.isNaN(d.getTime())) return "--:--";
		return d.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			timeZone,
		});
	};

	// Split countdown into H:M:S
	const hours = Math.floor(countdown / 3600);
	const minutes = Math.floor((countdown % 3600) / 60);
	const seconds = countdown % 60;

	const formatNumber = (num: number) => String(num).padStart(2, "0");

	return (
		<div className="min-h-screen bg-background dark:bg-zinc-950 font-display text-zinc-900 dark:text-zinc-100 flex flex-col">
			{/* Header */}
			<header className="p-4 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-30 border-b border-zinc-100 dark:border-zinc-800">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 flex items-center justify-center">
						<img
							src="/icons/icon-only.png"
							className="w-full h-full object-contain"
							alt="Sholatify"
						/>
					</div>
					<div className="flex flex-col">
						<h1 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
							Sholatify
						</h1>
						<div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 -mt-0.5">
							<p className="text-[9px] font-bold uppercase tracking-widest">
								{data?.cityName || settings?.cityName || "Loading..."}
							</p>
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => refetch()}
						disabled={isFetching}
						className="bg-white dark:bg-zinc-800 p-2 rounded-full shadow-sm hover:scale-105 transition-transform disabled:opacity-50 border border-zinc-100 dark:border-zinc-700"
					>
						<Bell
							className={cn(
								"w-5 h-5 text-zinc-600 dark:text-zinc-300",
								isFetching && "animate-pulse",
							)}
						/>
					</button>
				</div>
			</header>

			{/* Countdown Section */}
			<section className="px-6 py-8 text-center">
				<p className="text-primary font-bold text-sm tracking-[0.15em] uppercase mb-6 drop-shadow-sm">
					{nextPrayerName ? `Menuju ${nextPrayerName}` : "Menunggu Jadwal"}
				</p>
				<div className="flex justify-center items-start gap-4">
					<div className="flex flex-col items-center gap-2">
						<div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20 shadow-inner">
							<span className="text-2xl font-bold text-primary">
								{formatNumber(hours)}
							</span>
						</div>
						<span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
							Hours
						</span>
					</div>
					<div className="text-2xl font-bold pt-4 text-primary">:</div>
					<div className="flex flex-col items-center gap-2">
						<div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20 shadow-inner">
							<span className="text-2xl font-bold text-primary">
								{formatNumber(minutes)}
							</span>
						</div>
						<span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
							Minutes
						</span>
					</div>
					<div className="text-2xl font-bold pt-4 text-primary">:</div>
					<div className="flex flex-col items-center gap-2">
						<div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20 shadow-inner">
							<span className="text-2xl font-bold text-primary">
								{formatNumber(seconds)}
							</span>
						</div>
						<span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
							Seconds
						</span>
					</div>
				</div>
			</section>

			{/* Prayer List */}
			<main className="flex-1 px-4 pb-32 space-y-4 max-w-lg mx-auto w-full">
				<div className="flex items-center justify-between px-2 mb-2">
					<h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
						Jadwal Hari Ini
					</h2>
					{user?.fullName && (
						<p className="text-xs font-bold text-primary">{user.fullName}</p>
					)}
				</div>

				<div className="space-y-4">
					{isLoading ? (
						<div className="space-y-4">
							{[1, 2, 3, 4, 5].map((i) => (
								<div
									key={i}
									className="h-24 rounded-xl bg-white dark:bg-zinc-900 animate-pulse border border-zinc-100 dark:border-zinc-800"
								/>
							))}
						</div>
					) : isError ? (
						<div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
							<div className="text-destructive font-bold mb-2 text-sm">
								Gagal memuat jadwal
							</div>
							<div className="text-[10px] text-zinc-500">
								{error instanceof Error ? error.message : "Unknown error"}
							</div>
						</div>
					) : schedules.length === 0 ? (
						<div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
							<div className="text-zinc-500 font-medium text-sm">
								Belum ada data jadwal
							</div>
						</div>
					) : (
						schedules.map((s: PrayerSchedule) => (
							<PrayerCard
								key={s.prayerName}
								prayerName={s.prayerName}
								adzanTime={formatHHMM(s.scheduledAdzanTime)}
								bufferLimit={formatHHMM(s.bufferLimit)}
								status={s.status}
								isChecked={s.isChecked}
								userId={user?.id}
								isNext={
									nextPrayerName
										? s.prayerName.toLowerCase() ===
											nextPrayerName.toLowerCase()
										: false
								}
							/>
						))
					)}
				</div>
			</main>

			<MobileNav />
		</div>
	);
}
