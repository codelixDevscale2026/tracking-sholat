import { Flame } from "lucide-react";

interface StreakCardProps {
	days: number;
}

export function StreakCard({ days }: StreakCardProps) {
	return (
		<div className="col-span-2 flex items-center justify-between rounded-xl p-4 bg-[#10b77f] text-white">
			<div className="flex flex-col">
				<p className="text-white/80 text-xs font-medium uppercase tracking-wider">
					Current Streak
				</p>
				<p className="text-3xl font-bold">{days} Days</p>
			</div>
			<div className="flex flex-col items-end">
				<Flame className="w-9 h-9 text-white/40 fill-current" />
				{days > 0 && <p className="text-xs font-bold mt-1">+1 day</p>}
			</div>
		</div>
	);
}
