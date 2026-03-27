import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowRight, Trophy } from "lucide-react";
import * as React from "react";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/button";
import { useStatsSummary } from "../hooks/useStatsSummary";
import { MetricCard } from "./MetricCard";
import { PeriodTabs } from "./PeriodTabs";
import { PrayerBreakdownList } from "./PrayerBreakdownList";
import { StatsErrorState } from "./StatsErrorState";
import { StatsHeader } from "./StatsHeader";
import { StatsLoadingSkeleton } from "./StatsLoadingSkeleton";
import { StreakCard } from "./StreakCard";
import { TrendChart } from "./TrendChart";

export function StatsPage() {
	const navigate = useNavigate();
	const [period, setPeriod] = React.useState<"daily" | "weekly" | "monthly">(
		"weekly",
	);
	const [referenceDate, setReferenceDate] = React.useState<Date>(new Date());

	const {
		data: stats,
		isLoading,
		isError,
		error,
		refetch,
	} = useStatsSummary(period, format(referenceDate, "yyyy-MM-dd"));

	const handleBack = () => {
		navigate({ to: "/" });
	};

	const isEmpty = !isLoading && !isError && stats?.summary.total_prayers === 0;

	return (
		<div className="flex flex-col min-h-screen bg-[#f6f8f7] dark:bg-[#10221c] pb-24">
			<StatsHeader
				title="Statistics & Discipline"
				onBack={handleBack}
				date={referenceDate}
				onDateChange={setReferenceDate}
			/>

			<main className="flex-1 p-4 flex flex-col gap-6 max-w-md mx-auto w-full">
				<PeriodTabs value={period} onChange={setPeriod} />

				{isLoading ? (
					<StatsLoadingSkeleton />
				) : isError ? (
					<StatsErrorState
						message={error?.message || "Internal network error"}
						onRetry={() => refetch()}
					/>
				) : (
					<div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
						{/* Metric Grid + Streak — all in same grid per mockup */}
						<div className="grid grid-cols-2 gap-3">
							<MetricCard
								label="Total On-Time"
								value={`${stats?.summary.on_time_percentage ?? 0}%`}
							/>
							<MetricCard
								label="Total Performed"
								value={stats?.summary.total_performed ?? 0}
							/>
							<MetricCard
								label="Total Missed"
								value={stats?.summary.total_missed ?? 0}
							/>
							<MetricCard
								label="Avg Response"
								value={`${stats?.summary.average_response_time_minutes ?? 0} min`}
							/>
							{/* Streak Card — col-span-2 inside grid */}
							<StreakCard days={stats?.summary.streak_days ?? 0} />
						</div>

						{/* Trend Chart — adapts to active period */}
						{stats?.daily_trend && (
							<TrendChart data={stats.daily_trend} period={period} />
						)}

						{/* Empty State CTA - UX Flow §4.4 */}
						{isEmpty && (
							<div className="flex flex-col items-center gap-4 p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-dashed border-emerald-200 dark:border-emerald-800">
								<div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-800/40 flex items-center justify-center">
									<Trophy className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
								</div>
								<div className="text-center">
									<h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100 italic tracking-tighter">
										Belum ada data sholat
									</h3>
									<p className="text-xs text-emerald-700 dark:text-emerald-400 opacity-80 mt-1 max-w-[200px] leading-snug mx-auto">
										Mulai tracking sholat pertamamu untuk melihat statistik di
										sini
									</p>
								</div>
								<Button
									type="button"
									onClick={() => navigate({ to: "/" })}
									variant="default"
									size="sm"
									className="rounded-full bg-emerald-600 hover:bg-emerald-700 font-bold group"
								>
									Mulai Sekarang{" "}
									<ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
								</Button>
							</div>
						)}

						{/* Prayer Breakdown */}
						{stats?.prayer_breakdown && (
							<PrayerBreakdownList data={stats.prayer_breakdown} />
						)}
					</div>
				)}
			</main>

			<MobileNav />
		</div>
	);
}
