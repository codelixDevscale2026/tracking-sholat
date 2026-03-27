import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatsErrorStateProps {
	message: string;
	onRetry: () => void;
}

export function StatsErrorState({ message, onRetry }: StatsErrorStateProps) {
	return (
		<div className="flex flex-col items-center justify-center p-8 text-center gap-4 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/30 shadow-inner">
			<div className="p-3 bg-rose-100 dark:bg-rose-900/40 rounded-full">
				<AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
			</div>
			<div className="flex flex-col gap-1">
				<h3 className="text-base font-bold text-rose-900 dark:text-rose-100 italic tracking-tighter">
					Gagal memuat statistik
				</h3>
				<p className="text-sm text-rose-700 dark:text-rose-300 opacity-80 leading-snug">
					{message}
				</p>
			</div>
			<Button
				type="button"
				variant="outline"
				onClick={onRetry}
				className="mt-2 rounded-full border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-bold"
			>
				Coba Lagi
			</Button>
		</div>
	);
}
