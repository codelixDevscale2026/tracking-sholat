import { Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";

interface BufferSliderProps {
	value: number;
	onValueChange: (value: number) => void;
}

export function BufferSlider({ value, onValueChange }: BufferSliderProps) {
	const [localValue, setLocalValue] = useState(value);

	useEffect(() => {
		setLocalValue(value);
	}, [value]);

	useEffect(() => {
		if (localValue === value) return;

		const timeoutId = setTimeout(() => {
			onValueChange(localValue);
		}, 500);

		return () => clearTimeout(timeoutId);
	}, [localValue, value, onValueChange]);

	const handleSliderChange = (vals: number[]) => {
		setLocalValue(vals[0]);
	};

	return (
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
					prepare for each prayer. This adds extra time after the Adhan.
				</p>
				<div className="space-y-6">
					<div className="flex w-full items-center justify-between">
						<span className="text-sm font-black uppercase tracking-wider text-zinc-400">
							Global Buffer
						</span>
						<span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-2xl text-xs font-black">
							{localValue} mins
						</span>
					</div>
					<div className="space-y-4">
						<Slider
							value={[localValue]}
							onValueChange={handleSliderChange}
							min={5}
							max={60}
							step={5}
							className="py-4"
						/>
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
	);
}
