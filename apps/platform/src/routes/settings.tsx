import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowLeft,
	ChevronRight,
	LocateFixed,
	LogOut,
	MapPin,
	Settings as SettingsIcon,
	Timer,
} from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/button";
import { useAuthFeature } from "@/features/auth/hooks/useAuthFeature";

export const Route = createFileRoute("/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	const { logout } = useAuthFeature();

	return (
		<div className="flex flex-col min-h-screen bg-[#f6f8f7] dark:bg-[#10221c] font-display text-zinc-900 dark:text-zinc-100">
			{/* Header */}
			<div className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-[#f6f8f7]/80 dark:bg-[#10221c]/80 backdrop-blur-md z-30">
				<button
					type="button"
					onClick={() => window.history.back()}
					className="text-emerald-600 dark:text-emerald-400 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-emerald-500/10 transition-colors"
				>
					<ArrowLeft className="w-6 h-6" />
				</button>
				<h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
					Settings
				</h2>
			</div>

			<div className="flex flex-col gap-6 px-4 pb-32 pt-4 max-w-md mx-auto w-full">
				{/* Profile Summary */}

				{/* Smart Buffer Section */}
				<section className="flex flex-col gap-4">
					<div className="flex items-center gap-2 px-1">
						<Timer className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
						<h2 className="text-lg font-bold leading-tight tracking-tight">
							Smart Buffer System
						</h2>
					</div>
					<div className="p-5 rounded-4xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800">
						<p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium leading-relaxed mb-8">
							Adjust the global buffer time to ensure you have enough time to
							prepare for each prayer. This adds extra time before the Adhan.
						</p>
						<div className="space-y-6">
							<div className="flex w-full items-center justify-between">
								<span className="text-sm font-black uppercase tracking-wider text-zinc-400">
									Global Buffer
								</span>
								<span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-2xl text-xs font-black">
									15 mins
								</span>
							</div>
							<div className="space-y-4">
								{/* Custom Slider Simulation since shadcn slider isn't installed */}
								<div className="relative py-4 group">
									<div className="h-1.5 w-full bg-emerald-500/10 rounded-full overflow-hidden">
										<div className="h-full w-1/4 bg-emerald-600 dark:bg-emerald-500 rounded-full" />
									</div>
									<div className="absolute top-1/2 left-1/4 -translate-y-1/2 -ml-3 w-6 h-6 bg-white border-2 border-emerald-600 rounded-full shadow-lg cursor-pointer transform group-hover:scale-110 transition-transform" />
								</div>
								<div className="flex justify-between px-1">
									<span className="text-zinc-300 text-[10px] font-bold uppercase tracking-widest">
										5m
									</span>
									<span className="text-zinc-300 text-[10px] font-bold uppercase tracking-widest">
										60m
									</span>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Location Settings Section */}
				<section className="flex flex-col gap-4">
					<div className="flex items-center gap-2 px-1">
						<MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
						<h2 className="text-lg font-bold leading-tight tracking-tight">
							Location Settings
						</h2>
					</div>
					<div className="p-5 rounded-4xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 space-y-6">
						<div className="flex flex-col gap-3">
							<span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">
								Current Coordinates
							</span>
							<div className="flex items-center gap-4 p-4 bg-[#f6f8f7] dark:bg-[#0c1a15] rounded-2xl border border-emerald-500/5">
								<LocateFixed className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
								<div className="flex flex-col">
									<p className="text-zinc-900 dark:text-zinc-100 text-xs font-bold font-mono">
										-6.2088° S, 106.8456° E
									</p>
									<p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-medium tracking-wide">
										Jakarta, Indonesia
									</p>
								</div>
								<button
									type="button"
									className="ml-auto text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider hover:bg-emerald-500/5 px-3 py-1.5 rounded-xl transition-colors"
								>
									Refresh
								</button>
							</div>
						</div>

						<div className="flex items-center justify-between py-2 px-1">
							<div className="flex flex-col">
								<p className="text-sm font-bold">Auto-detect Location</p>
								<p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-medium tracking-wide">
									Update coordinates via GPS
								</p>
							</div>
							{/* Simple toggle since shadcn switch isn't installed */}
							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									className="sr-only peer"
									defaultChecked
								/>
								<div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
							</label>
						</div>
					</div>
				</section>

				{/* Calculation Method Section */}
				<section className="flex flex-col gap-4">
					<div className="flex items-center gap-2 px-1">
						<SettingsIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
						<h2 className="text-lg font-bold leading-tight tracking-tight">
							Prayer Method
						</h2>
					</div>
					<button
						type="button"
						className="p-5 rounded-4xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center justify-between w-full group active:scale-[0.98] transition-all"
					>
						<div className="flex flex-col items-start text-left">
							<p className="text-sm font-bold">Calculation Method</p>
							<p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-medium tracking-wide">
								Muslim World League (MWL)
							</p>
						</div>
						<ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-emerald-500 transition-colors" />
					</button>
				</section>

				{/* Logout Section */}
				<section className="mt-4">
					<Button
						type="button"
						variant="ghost"
						onClick={() => logout.mutate()}
						className="w-full p-5 rounded-4xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 flex items-center justify-between h-auto group transition-all active:scale-[0.98]"
					>
						<div className="flex items-center gap-3">
							<div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600">
								<LogOut className="w-5 h-5" />
							</div>
							<div className="flex flex-col items-start text-left">
								<p className="text-sm font-bold text-rose-600">Sign Out</p>
								<p className="text-rose-500/60 text-[10px] font-medium tracking-wide">
									End your current session
								</p>
							</div>
						</div>
						<ChevronRight className="w-5 h-5 text-rose-500/30 group-hover:text-rose-500 transition-colors" />
					</Button>
					<p className="text-center text-zinc-300 dark:text-zinc-700 text-[10px] font-bold mt-8 uppercase tracking-[0.2em]">
						V1.0.0 Stable Build
					</p>
				</section>
			</div>
			<MobileNav />
		</div>
	);
}
