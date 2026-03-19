import { cn } from "@/lib/utils";

type PrayerStatus = string | undefined;

export function PrayerCard({
	prayerName,
	adzanTime,
	bufferLimit,
	status,
	isNext,
}: {
	prayerName: string;
	adzanTime: string;
	bufferLimit: string;
	status?: PrayerStatus;
	isNext?: boolean;
}) {
	return (
		<div
			className={cn(
				"rounded-lg border bg-card p-4 shadow-xs",
				isNext ? "border-primary/40 ring-1 ring-primary/20" : "border-border",
			)}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<div className="text-sm font-semibold capitalize text-foreground">
						{prayerName}
					</div>
					<div className="mt-1 text-xs text-muted-foreground">
						Batas: {bufferLimit}
					</div>
				</div>

				<div className="text-right">
					<div className="text-lg font-semibold tabular-nums text-foreground">
						{adzanTime}
					</div>
					{status ? (
						<div className="mt-1 text-xs text-muted-foreground">{status}</div>
					) : null}
				</div>
			</div>
		</div>
	);
}
