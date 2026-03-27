import { Skeleton } from "@/components/ui/skeleton";

export function StatsLoadingSkeleton() {
	return (
		<div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
			{/* Metric Cards Grid */}
			<div className="grid grid-cols-2 gap-3">
				{[1, 2, 3, 4].map((i) => (
					<Skeleton
						key={i}
						className="h-28 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20"
					/>
				))}
			</div>

			{/* Streak Card Skeleton */}
			<Skeleton className="h-32 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30" />

			{/* Chart Skeleton */}
			<div className="flex flex-col gap-4">
				<div className="flex justify-between items-center px-2">
					<Skeleton className="h-5 w-40 bg-zinc-100 dark:bg-zinc-800" />
					<Skeleton className="h-4 w-20 bg-zinc-50 dark:bg-zinc-800/50" />
				</div>
				<Skeleton className="h-56 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40" />
			</div>

			{/* Prayer Breakdown Skeleton */}
			<div className="flex flex-col gap-6">
				<div className="flex justify-between items-center px-2">
					<Skeleton className="h-5 w-48 bg-zinc-100 dark:bg-zinc-800" />
					<Skeleton className="h-4 w-24 bg-zinc-50 dark:bg-zinc-800/50" />
				</div>
				<div className="flex flex-col gap-4">
					{[1, 2, 3, 4, 5].map((i) => (
						<Skeleton
							key={i}
							className="h-28 rounded-2xl bg-white dark:bg-zinc-900/20 border dark:border-zinc-800/30 shadow-sm"
						/>
					))}
				</div>
			</div>
		</div>
	);
}
