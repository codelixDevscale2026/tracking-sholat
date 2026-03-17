import { Loader2, LocateFixed, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface LocationSettingsProps {
	latitude: number | null;
	longitude: number | null;
	cityName: string | null;
	autoDetect: boolean;
	onUpdate: (data: {
		latitude?: number;
		longitude?: number;
		autoDetectLocation?: boolean;
	}) => void;
}

export function LocationSettings({
	latitude,
	longitude,
	cityName,
	autoDetect,
	onUpdate,
}: LocationSettingsProps) {
	const [isLocating, setIsLocating] = useState(false);

	const handleRefresh = () => {
		if (!navigator.geolocation) {
			toast.error("Geolocation is not supported by your browser");
			return;
		}

		setIsLocating(true);
		navigator.geolocation.getCurrentPosition(
			(position) => {
				onUpdate({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
				});
				setIsLocating(false);
			},
			(error) => {
				toast.error(`Error getting location: ${error.message}`);
				setIsLocating(false);
			},
		);
	};

	return (
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
								{latitude?.toFixed(4) ?? "?"}°{" "}
								{latitude && latitude >= 0 ? "N" : "S"},{" "}
								{longitude?.toFixed(4) ?? "?"}°{" "}
								{longitude && longitude >= 0 ? "E" : "W"}
							</p>
							<p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-medium tracking-wide">
								{cityName ?? "Unknown Location"}
							</p>
						</div>
						<button
							type="button"
							onClick={handleRefresh}
							disabled={isLocating}
							className="ml-auto text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider hover:bg-emerald-500/5 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
						>
							{isLocating ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								"Refresh"
							)}
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
					<Switch
						checked={autoDetect}
						onCheckedChange={(val) => onUpdate({ autoDetectLocation: val })}
					/>
				</div>
			</div>
		</section>
	);
}
