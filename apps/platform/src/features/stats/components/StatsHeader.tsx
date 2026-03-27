import { ArrowLeft, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface StatsHeaderProps {
	title: string;
	onBack: () => void;
	date: Date;
	onDateChange: (date: Date) => void;
}

export function StatsHeader({
	title,
	onBack,
	date,
	onDateChange,
}: StatsHeaderProps) {
	return (
		<header className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-[#f6f8f7]/80 dark:bg-[#10221c]/80 backdrop-blur-md z-30">
			<button
				type="button"
				onClick={onBack}
				className="text-emerald-600 dark:text-emerald-400 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-emerald-500/10 transition-colors"
			>
				<ArrowLeft className="w-6 h-6" />
			</button>
			<h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">
				{title}
			</h2>
			<Popover>
				<PopoverTrigger asChild>
					<button
						type="button"
						className={cn(
							"flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-emerald-500/10 transition-colors text-emerald-600 dark:text-emerald-400",
							!date && "text-muted-foreground",
						)}
					>
						<CalendarIcon className="w-5 h-5" />
					</button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="end">
					<Calendar
						mode="single"
						selected={date}
						onSelect={(d: Date | undefined) => d && onDateChange(d)}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
		</header>
	);
}
