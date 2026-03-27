import { cn } from "@/lib/utils";

interface MetricCardProps {
	label: string;
	value: string | number;
	delta?: {
		value: number;
		isPositive: boolean;
	};
}

export function MetricCard({ label, value, delta }: MetricCardProps) {
	return (
		<div className="flex flex-col gap-1 rounded-xl p-4 bg-[#10b77f]/10 border border-[#10b77f]/5">
			<p className="text-slate-600 dark:text-slate-400 text-xs font-medium">
				{label}
			</p>
			<div className="flex items-baseline gap-2">
				<p className="text-slate-900 dark:text-slate-100 text-2xl font-bold">
					{value}
				</p>
				{delta && (
					<p
						className={cn(
							"text-xs font-bold",
							delta.isPositive ? "text-[#10b77f]" : "text-red-500",
						)}
					>
						{delta.isPositive ? "+" : "-"}
						{Math.abs(delta.value)}%
					</p>
				)}
			</div>
		</div>
	);
}
