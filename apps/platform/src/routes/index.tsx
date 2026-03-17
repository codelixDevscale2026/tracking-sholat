import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	AlertCircle,
	Bell,
	Calendar,
	CheckCircle2,
	Clock,
	MapPin,
} from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { useAuthFeature } from "@/features/auth/hooks/useAuthFeature";
import { useSettingsFeature } from "@/features/settings/hooks/useSettingsFeature";

export const Route = createFileRoute("/")({
	beforeLoad: () => {
		if (typeof window !== "undefined" && !localStorage.getItem("auth_token")) {
			throw redirect({ to: "/login" });
		}
	},
	component: DashboardPage,
});

function DashboardPage() {
	const { user } = useAuthFeature();
	const { settings } = useSettingsFeature();

	const prayers = [
		{
			name: "Subuh",
			time: "04:35",
			limit: "04:55",
			status: "ON-TIME",
			variant: "primary",
			done: true,
		},
		{
			name: "Dzuhur",
			time: "12:02",
			limit: "12:22",
			status: "PERFORMED",
			variant: "warning",
			late: true,
		},
		{
			name: "Ashar",
			time: "15:15",
			limit: "15:35",
			status: "PENDING",
			variant: "active",
			current: true,
		},
		{
			name: "Maghrib",
			time: "18:05",
			limit: "18:25",
			status: null,
			variant: "disabled",
		},
		{
			name: "Isya",
			time: "19:15",
			limit: "19:35",
			status: "YESTERDAY MISSED",
			variant: "danger",
			missed: true,
		},
	];

	return (
		<div className="min-h-screen bg-[#f6f8f7] dark:bg-[#10221c] font-display text-zinc-900 dark:text-zinc-100 flex flex-col">
			{/* Header */}
			<header className="p-4 flex items-center justify-between sticky top-0 bg-[#f6f8f7]/80 dark:bg-[#10221c]/80 backdrop-blur-md z-30">
				<div className="flex items-center gap-3">
					<div className="bg-emerald-500/10 p-2.5 rounded-2xl text-emerald-600 dark:text-emerald-400">
						<Calendar className="w-6 h-6" />
					</div>
					<div>
						<h1 className="text-lg font-bold tracking-tight">Jadwal Sholat</h1>
						<div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
							<MapPin className="w-3 h-3" />
							<p className="text-[10px] font-medium uppercase tracking-wider">
								{settings?.cityName || "Loading..."}
							</p>
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						className="bg-white dark:bg-zinc-900 p-2.5 rounded-full shadow-sm hover:scale-105 transition-transform"
					>
						<Bell className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
					</button>
				</div>
			</header>

			{/* Countdown Section */}
			<section className="px-6 py-8 text-center bg-white/50 dark:bg-zinc-900/30 mb-6">
				<p className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm tracking-[0.2em] uppercase mb-6 drop-shadow-sm">
					Menuju Ashar
				</p>
				<div className="flex justify-center items-start gap-4">
					<div className="flex flex-col items-center gap-2">
						<div className="w-18 h-18 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
							<span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
								01
							</span>
						</div>
						<span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
							Hours
						</span>
					</div>
					<div className="text-3xl font-black pt-4 text-emerald-600/30">:</div>
					<div className="flex flex-col items-center gap-2">
						<div className="w-18 h-18 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
							<span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
								12
							</span>
						</div>
						<span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
							Minutes
						</span>
					</div>
					<div className="text-3xl font-black pt-4 text-emerald-600/30">:</div>
					<div className="flex flex-col items-center gap-2">
						<div className="w-18 h-18 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
							<span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
								35
							</span>
						</div>
						<span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
							Seconds
						</span>
					</div>
				</div>
			</section>

			{/* Prayer List */}
			<main className="flex-1 px-4 pb-32 space-y-4 max-w-lg mx-auto w-full">
				<div className="flex items-center justify-between px-2 mb-2">
					<h2 className="text-xl font-black text-zinc-800 dark:text-zinc-100">
						Jadwal Hari Ini
					</h2>
					<p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
						{user?.fullName}
					</p>
				</div>

				<div className="space-y-4">
					{prayers.map((prayer) => (
						<div
							key={prayer.name}
							className={`
								relative overflow-hidden p-5 rounded-3xl transition-all duration-300
								${
									prayer.variant === "active"
										? "bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 scale-[1.02] border-none"
										: "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm"
								}
								${prayer.variant === "disabled" ? "opacity-60 grayscale-[0.5]" : ""}
							`}
						>
							{/* Status indicator line */}
							{prayer.variant === "primary" && (
								<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
							)}
							{prayer.variant === "warning" && (
								<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500" />
							)}
							{prayer.variant === "danger" && (
								<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500" />
							)}

							<div className="flex items-center justify-between relative z-10">
								<div className="space-y-1">
									<div className="flex items-center gap-2">
										<span
											className={`font-black text-base ${prayer.variant === "active" ? "text-white" : "text-zinc-900 dark:text-zinc-100"}`}
										>
											{prayer.name}
										</span>
										{prayer.status && (
											<span
												className={`
												px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase
												${prayer.variant === "active" ? "bg-white/20 text-white" : ""}
												${prayer.variant === "primary" ? "bg-emerald-500/10 text-emerald-600" : ""}
												${prayer.variant === "warning" ? "bg-amber-500/10 text-amber-600" : ""}
												${prayer.variant === "danger" ? "bg-rose-500/10 text-rose-600" : ""}
											`}
											>
												{prayer.status}
											</span>
										)}
									</div>
									<p
										className={`text-3xl font-black ${prayer.variant === "active" ? "text-white" : "text-zinc-900 dark:text-zinc-100"}`}
									>
										{prayer.time}
									</p>
									<p
										className={`text-[10px] font-bold ${prayer.variant === "active" ? "text-emerald-100" : "text-zinc-400"}`}
									>
										Batas: {prayer.limit}
									</p>
								</div>

								<div className="flex flex-col items-end gap-3">
									{prayer.done && (
										<button
											type="button"
											className="bg-emerald-500 text-white px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
										>
											<CheckCircle2 className="w-4 h-4" />
											Done
										</button>
									)}
									{prayer.late && (
										<button
											type="button"
											className="bg-amber-500 text-white px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
										>
											<Clock className="w-4 h-4" />
											Late
										</button>
									)}
									{prayer.current && (
										<button
											type="button"
											className="bg-white text-emerald-600 px-6 py-2.5 rounded-2xl text-xs font-black shadow-lg active:scale-95 transition-transform"
										>
											Check-in
										</button>
									)}
									{prayer.variant === "disabled" && (
										<button
											type="button"
											className="bg-zinc-100 dark:bg-zinc-800 text-zinc-400 px-6 py-2.5 rounded-2xl text-xs font-black cursor-not-allowed"
										>
											Check-in
										</button>
									)}
									{prayer.missed && (
										<div className="p-2 bg-rose-500/10 rounded-full">
											<AlertCircle className="w-6 h-6 text-rose-500 animate-pulse" />
										</div>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</main>

			<MobileNav />
		</div>
	);
}
