import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, CalendarIcon, History } from "lucide-react";
import { useEffect, useState } from "react";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HistoryDayGroup } from "@/features/prayer/components/HistoryDayGroup";
import { usePrayerHistory } from "@/features/prayer/hooks/usePrayerHistory";

export const Route = createFileRoute("/history")({
	component: HistoryPage,
});

function HistoryPage() {
	const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
	const [date, setDate] = useState<Date | undefined>(new Date());
	const [page, setPage] = useState(1);

	const dateStr = date ? format(date, "yyyy-MM-dd") : undefined;

	const { data, isLoading, isError, refetch } = usePrayerHistory({
		period,
		date: dateStr,
		page,
	});

	// Handle data accumulation
	const [allHistory, setAllHistory] = useState<any[]>([]);

	// Reset if period or date changes
	useEffect(() => {
		setPage(1);
		setAllHistory([]);
	}, [period, dateStr]);

	// Update list when data comes in
	useEffect(() => {
		if (data?.data) {
			if (page === 1) {
				setAllHistory(data.data);
			} else {
				// Don't duplicate dates if they already exist
				setAllHistory((prev) => {
					const existingDates = new Set(prev.map((item) => item.date));
					const newItems = data.data.filter(
						(item) => !existingDates.has(item.date),
					);
					return [...prev, ...newItems];
				});
			}
		}
	}, [data, page]);

	const handleLoadMore = () => {
		if (data?.pagination && page < data.pagination.total_pages) {
			setPage((p) => p + 1);
		}
	};

	const hasMore = data?.pagination && page < data.pagination.total_pages;

	return (
		<div className="flex flex-col min-h-screen bg-[#f6f8f7] dark:bg-[#10221c] pb-24 font-display text-zinc-900 dark:text-zinc-100">
			{/* Header */}
			<header className="sticky top-0 z-50 bg-[#f6f8f7]/80 dark:bg-[#10221c]/80 backdrop-blur-md border-b border-primary/10">
				<div className="flex items-center p-4 pb-2 justify-between">
					<button
						type="button"
						onClick={() => window.history.back()}
						className="text-emerald-600 dark:text-emerald-400 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-emerald-500/10 transition-colors"
					>
						<ArrowLeft className="w-6 h-6" />
					</button>
					<h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">
						Prayer History
					</h2>
					<Popover>
						<PopoverTrigger asChild>
							<button
								type="button"
								className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-emerald-500/10 transition-colors text-emerald-600 dark:text-emerald-400"
							>
								<CalendarIcon className="w-5 h-5" />
							</button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="end">
							<Calendar
								mode="single"
								selected={date}
								onSelect={(d) => {
									if (d) setDate(d);
								}}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
				</div>

				<Tabs
					value={period}
					onValueChange={(v: string) => setPeriod(v as any)}
					className="w-full"
				>
					<TabsList className="flex px-4 gap-8 justify-around bg-transparent h-auto p-0 rounded-none border-b-0">
						<TabsTrigger
							value="daily"
							className="flex flex-col items-center justify-center border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none pb-3 pt-2 rounded-none bg-transparent shadow-none text-zinc-500 dark:text-zinc-400 font-bold text-sm tracking-wide"
						>
							Daily
						</TabsTrigger>
						<TabsTrigger
							value="weekly"
							className="flex flex-col items-center justify-center border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none pb-3 pt-2 rounded-none bg-transparent shadow-none text-zinc-500 dark:text-zinc-400 font-bold text-sm tracking-wide"
						>
							Weekly
						</TabsTrigger>
						<TabsTrigger
							value="monthly"
							className="flex flex-col items-center justify-center border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none pb-3 pt-2 rounded-none bg-transparent shadow-none text-zinc-500 dark:text-zinc-400 font-bold text-sm tracking-wide"
						>
							Monthly
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</header>

			{/* Main Content */}
			<main className="flex-1 px-4 py-4 max-w-md mx-auto w-full">
				{/* List */}
				<div className="space-y-4">
					{allHistory.map((group) => (
						<HistoryDayGroup key={group.date} group={group} />
					))}

					{isLoading && page === 1 && (
						<div className="space-y-4">
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className="rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 space-y-4 bg-white dark:bg-zinc-900"
								>
									<div className="flex justify-between items-center">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-4 w-16" />
									</div>
									<div className="space-y-3">
										{[1, 2, 3].map((j) => (
											<div key={j} className="flex items-center gap-3">
												<Skeleton className="w-10 h-10 rounded-full" />
												<div className="space-y-2 flex-1">
													<Skeleton className="h-4 w-24" />
													<Skeleton className="h-3 w-16" />
												</div>
												<Skeleton className="h-6 w-16" />
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					)}

					{!isLoading && allHistory.length === 0 && (
						<div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
							<div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
								<History className="w-8 h-8 text-zinc-400" />
							</div>
							<div>
								<h3 className="text-zinc-900 dark:text-zinc-100 font-bold">
									No Records Found
								</h3>
								<p className="text-sm text-zinc-500 max-w-[200px] mt-1">
									You haven't logged any prayers for this period yet.
								</p>
							</div>
							<Button
								variant="outline"
								className="rounded-full border-primary text-primary font-bold px-8 uppercase text-xs tracking-widest"
								asChild
							>
								<a href="/">Go to Home</a>
							</Button>
						</div>
					)}

					{isError && (
						<div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
							<p className="text-destructive font-bold text-sm">
								Failed to load history
							</p>
							<Button
								variant="ghost"
								className="text-xs uppercase font-bold text-destructive hover:bg-destructive/10 mt-2"
								onClick={() => refetch()}
							>
								Retry
							</Button>
						</div>
					)}

					{hasMore && (
						<div className="flex justify-center pt-2">
							<Button
								variant="ghost"
								size="sm"
								className="text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary/5 active:scale-95"
								onClick={handleLoadMore}
								disabled={isLoading}
							>
								{isLoading ? "Loading..." : "View All History"}
							</Button>
						</div>
					)}
				</div>
			</main>

			<MobileNav />
		</div>
	);
}
