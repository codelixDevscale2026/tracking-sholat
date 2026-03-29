import { useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	ChevronRight,
	LogOut,
	Settings as SettingsIcon,
} from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthFeature } from "@/features/auth/hooks/useAuthFeature";
import { BufferSlider } from "@/features/settings/components/BufferSlider";
import { LocationSettings } from "@/features/settings/components/LocationSettings";
import { useSettingsFeature } from "@/features/settings/hooks/useSettingsFeature";

export function SettingsPage() {
	const navigate = useNavigate();
	const { logout } = useAuthFeature();
	const { settings, isLoading, updateSettings } = useSettingsFeature();

	if (isLoading) {
		return (
			<div className="flex flex-col min-h-screen bg-[#f6f8f7] dark:bg-[#10221c] p-4 gap-6">
				<Skeleton className="h-10 w-full rounded-2xl" />
				<Skeleton className="h-40 w-full rounded-4xl" />
				<Skeleton className="h-40 w-full rounded-4xl" />
				<Skeleton className="h-24 w-full rounded-4xl" />
			</div>
		);
	}

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
				{/* Smart Buffer Section */}
				<BufferSlider
					value={settings?.globalBufferMinutes ?? 20}
					onValueChange={(val) =>
						updateSettings.mutate({ globalBufferMinutes: val })
					}
				/>

				{/* Location Settings Section */}
				<LocationSettings
					latitude={settings?.latitude ? Number(settings.latitude) : null}
					longitude={settings?.longitude ? Number(settings.longitude) : null}
					cityName={settings?.cityName ?? null}
					autoDetect={settings?.autoDetectLocation ?? true}
					onUpdate={(data) => updateSettings.mutate(data)}
				/>

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
						onClick={() => navigate({ to: "/settings/calculation-method" })}
						className="p-5 rounded-4xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center justify-between w-full group active:scale-[0.98] transition-all"
					>
						<div className="flex flex-col items-start text-left">
							<p className="text-sm font-bold">Calculation Method</p>
							<p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-medium tracking-wide">
								{settings?.calculationMethod?.toUpperCase() ?? "KEMENAG"}
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
