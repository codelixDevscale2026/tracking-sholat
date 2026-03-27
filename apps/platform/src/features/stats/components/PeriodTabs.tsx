import { cn } from "@/lib/utils";

type Period = "daily" | "weekly" | "monthly";

interface PeriodTabsProps {
	value: Period;
	onChange: (value: Period) => void;
}

export function PeriodTabs({ value, onChange }: PeriodTabsProps) {
	const periods: { value: Period; label: string }[] = [
		{ value: "daily", label: "Daily" },
		{ value: "weekly", label: "Weekly" },
		{ value: "monthly", label: "Monthly" },
	];

	const handleTabClick = (period: Period) => {
		if (period === value) {
			window.scrollTo({ top: 0, behavior: "smooth" });
		} else {
			onChange(period);
		}
	};

	return (
		<div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-full p-1 flex items-center justify-between w-full max-w-sm mx-auto shadow-sm">
			{periods.map((period) => (
				<button
					key={period.value}
					type="button"
					onClick={() => handleTabClick(period.value)}
					className={cn(
						"flex-1 py-1.5 px-3 rounded-full text-sm font-medium transition-all duration-200",
						value === period.value
							? "bg-white dark:bg-emerald-800 text-[#2EAA6E] dark:text-emerald-300 shadow-sm scale-[1.02]"
							: "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300",
					)}
				>
					{period.label}
				</button>
			))}
		</div>
	);
}
