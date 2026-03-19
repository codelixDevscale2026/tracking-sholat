import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { PrayerCard } from "@/components/PrayerCard";
import { Button } from "@/components/ui/button";
import { useCountdown, useTodaySchedule } from "@/hooks/useTodaySchedule";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const userId = 1;
	const { data, isLoading, isError, error, refetch, isFetching } =
		useTodaySchedule({
			userId,
		});

	const countdownSeconds = data?.nextPrayer?.countdownSeconds ?? 0;
	const { countdown, formatTime, reset } = useCountdown(countdownSeconds);

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

	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto w-full max-w-md px-4 py-6">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<div className="text-xs font-medium text-muted-foreground">
							Lokasi
						</div>
						<div className="mt-1 truncate text-base font-semibold text-foreground">
							{data?.cityName ? data.cityName : "-"}
						</div>
					</div>

					<Button
						variant="outline"
						size="sm"
						disabled={isFetching}
						onClick={() => refetch()}
					>
						{isFetching ? "Refreshing..." : "Refresh"}
					</Button>
				</div>

				<div className="mt-4 rounded-lg border bg-card p-4 shadow-xs">
					<div className="text-xs font-medium text-muted-foreground">
						Sholat berikutnya
					</div>
					<div className="mt-1 flex items-end justify-between gap-3">
						<div className="text-base font-semibold capitalize text-foreground">
							{nextPrayerName ? nextPrayerName : "-"}
						</div>
						<div className="text-xl font-semibold tabular-nums text-foreground">
							{countdownSeconds > 0 ? formatTime(countdown) : "--:--"}
						</div>
					</div>
				</div>

				{isLoading ? (
					<div className="mt-6 space-y-3">
						<div className="h-20 rounded-lg border bg-card" />
						<div className="h-20 rounded-lg border bg-card" />
						<div className="h-20 rounded-lg border bg-card" />
						<div className="h-20 rounded-lg border bg-card" />
						<div className="h-20 rounded-lg border bg-card" />
					</div>
				) : isError ? (
					<div className="mt-6 rounded-lg border bg-card p-4">
						<div className="text-sm font-medium text-foreground">
							Gagal memuat jadwal
						</div>
						<div className="mt-1 text-xs text-muted-foreground">
							{error instanceof Error ? error.message : "Unknown error"}
						</div>
					</div>
				) : schedules.length === 0 ? (
					<div className="mt-6 rounded-lg border bg-card p-4">
						<div className="text-sm font-medium text-foreground">
							Belum ada data jadwal
						</div>
						<div className="mt-1 text-xs text-muted-foreground">
							Jika backend belum berjalan, halaman ini tetap bisa dibuka.
						</div>
					</div>
				) : (
					<div className="mt-6 space-y-3">
						{schedules.map((s) => (
							<PrayerCard
								key={s.prayerName}
								prayerName={s.prayerName}
								adzanTime={formatHHMM(s.scheduledAdzanTime)}
								bufferLimit={formatHHMM(s.bufferLimit)}
								status={s.status}
								isNext={
									nextPrayerName
										? s.prayerName.toLowerCase() ===
											nextPrayerName.toLowerCase()
										: false
								}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
