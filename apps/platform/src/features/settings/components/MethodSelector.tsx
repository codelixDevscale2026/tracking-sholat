import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { CalculationMethod } from "../settings.types";

interface MethodSelectorProps {
	value: string;
	methods: CalculationMethod[];
	onValueChange: (value: string) => void;
}

export function MethodSelector({
	value,
	methods,
	onValueChange,
}: MethodSelectorProps) {
	return (
		<div className="flex flex-col gap-3">
			<RadioGroup
				value={value}
				onValueChange={onValueChange}
				className="space-y-3"
			>
				{methods.map((method) => (
					<Label
						key={method.value}
						className={`
							flex items-center justify-between p-5 rounded-3xl border transition-all cursor-pointer
							${
								value === method.value
									? "bg-emerald-500/5 border-emerald-500 shadow-sm"
									: "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800"
							}
						`}
					>
						<div className="flex flex-col gap-1">
							<span className="font-bold text-sm">{method.label}</span>
							<span className="text-[10px] text-zinc-400 uppercase tracking-widest">
								{method.value}
							</span>
						</div>
						<RadioGroupItem value={method.value} className="sr-only" />
						{value === method.value && (
							<div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
								<div className="w-2 h-2 rounded-full bg-white" />
							</div>
						)}
					</Label>
				))}
			</RadioGroup>
		</div>
	);
}
