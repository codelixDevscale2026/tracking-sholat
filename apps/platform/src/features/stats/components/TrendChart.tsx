import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { DailyTrend } from "../types/stats.types";

type Period = "daily" | "weekly" | "monthly";

interface TrendChartProps {
	data: DailyTrend[];
	period: Period;
}

interface ChartConfig {
	title: string;
	subtitle: string;
}

function getChartConfig(period: Period): ChartConfig {
	switch (period) {
		case "daily":
			return { title: "Today's Prayer Status", subtitle: "Per prayer" };
		case "weekly":
			return { title: "Weekly Discipline Trend", subtitle: "Last 7 days" };
		case "monthly":
			return { title: "Monthly Overview", subtitle: "Per week" };
	}
}

interface ChartDataPoint {
	day: string;
	date: string;
	on_time: number;
	performed: number;
	missed: number;
}

function groupByWeek(data: DailyTrend[]): ChartDataPoint[] {
	const weeks: ChartDataPoint[] = [];
	const chunkSize = 7;

	for (let i = 0; i < data.length; i += chunkSize) {
		const chunk = data.slice(i, i + chunkSize);
		const weekNum = Math.floor(i / chunkSize) + 1;
		weeks.push({
			day: `Week ${weekNum}`,
			date: chunk[0]?.date ?? "",
			on_time: chunk.reduce((sum, d) => sum + d.on_time, 0),
			performed: chunk.reduce((sum, d) => sum + d.performed, 0),
			missed: chunk.reduce((sum, d) => sum + d.missed, 0),
		});
	}

	return weeks;
}

function transformForDaily(data: DailyTrend[]): ChartDataPoint[] {
	if (data.length === 0) return [];

	const today = data[0];
	return [
		{
			day: "On-Time",
			date: today.date,
			on_time: today.on_time,
			performed: 0,
			missed: 0,
		},
		{
			day: "Performed",
			date: today.date,
			on_time: 0,
			performed: today.performed,
			missed: 0,
		},
		{
			day: "Missed",
			date: today.date,
			on_time: 0,
			performed: 0,
			missed: today.missed,
		},
	];
}

export function TrendChart({ data, period }: TrendChartProps) {
	const config = getChartConfig(period);

	let chartData: ChartDataPoint[];
	let yMax = 5;

	switch (period) {
		case "daily":
			chartData = transformForDaily(data);
			yMax = Math.max(
				5,
				...chartData.map((d) => d.on_time + d.performed + d.missed),
			);
			break;
		case "weekly":
			chartData = data;
			yMax = 5;
			break;
		case "monthly":
			chartData = groupByWeek(data);
			yMax = Math.max(
				5,
				...chartData.map((d) => d.on_time + d.performed + d.missed),
			);
			break;
	}

	return (
		<div className="flex flex-col gap-4 w-full">
			<div className="flex items-end justify-between px-2">
				<h3 className="text-base font-bold text-slate-800 dark:text-slate-100 italic tracking-tight">
					{config.title}
				</h3>
				<span className="text-slate-400 dark:text-slate-500 text-xs font-medium">
					{config.subtitle}
				</span>
			</div>
			<div className="h-[220px] w-full bg-[#10b77f]/5 rounded-xl p-4 border border-[#10b77f]/10">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={chartData}
						margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
						barGap={6}
					>
						<CartesianGrid
							strokeDasharray="4 4"
							vertical={false}
							stroke="#E2E8F0"
							strokeOpacity={0.4}
						/>
						<XAxis
							dataKey="day"
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }}
							dy={10}
							interval={0}
						/>
						<YAxis
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#94A3B8", fontSize: 10 }}
							domain={[0, yMax]}
						/>
						<Tooltip
							cursor={{ fill: "transparent" }}
							contentStyle={{
								borderRadius: "12px",
								border: "none",
								boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
								backgroundColor: "#FFFFFF",
								fontSize: "12px",
							}}
							itemStyle={{ padding: "0" }}
						/>
						<Bar
							dataKey="on_time"
							name="On Time"
							stackId="a"
							fill="#10b77f"
							radius={[2, 2, 0, 0]}
							barSize={period === "monthly" ? 32 : 20}
						/>
						<Bar
							dataKey="performed"
							name="Performed"
							stackId="a"
							fill="#F5A623"
							radius={[2, 2, 0, 0]}
							barSize={period === "monthly" ? 32 : 20}
						/>
						<Bar
							dataKey="missed"
							name="Missed"
							stackId="a"
							fill="#E8434A"
							radius={[4, 4, 0, 0]}
							barSize={period === "monthly" ? 32 : 20}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
