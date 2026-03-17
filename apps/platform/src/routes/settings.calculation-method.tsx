import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MethodSelector } from "@/features/settings/components/MethodSelector";
import { useSettingsFeature } from "@/features/settings/hooks/useSettingsFeature";

export const Route = createFileRoute("/settings/calculation-method")({
	component: CalculationMethodPage,
});

function CalculationMethodPage() {
	const navigate = useNavigate();
	const { settings, isLoading, updateSettings } = useSettingsFeature();

	const handleMethodChange = (val: string) => {
		updateSettings.mutate(
			{ calculationMethod: val },
			{
				onSuccess: () => {
					navigate({ to: "/settings" });
				},
			},
		);
	};

	if (isLoading) {
		return (
			<div className="flex flex-col min-h-screen bg-[#f6f8f7] dark:bg-[#10221c] p-4 gap-4">
				<Skeleton className="h-10 w-full rounded-2xl" />
				<div className="space-y-4">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<Skeleton key={i} className="h-16 w-full rounded-3xl" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col min-h-screen bg-[#f6f8f7] dark:bg-[#10221c] font-display text-zinc-900 dark:text-zinc-100">
			{/* Header */}
			<div className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-[#f6f8f7]/80 dark:bg-[#10221c]/80 backdrop-blur-md z-30">
				<button
					type="button"
					onClick={() => window.history.back()}
					className="text-emerald-600 dark:text-emerald-400 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-emerald-500/10 transition-colors"
				>
					<ArrowLeft className="w-6 h-6" />
				</button>
				<h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
					Calculation Method
				</h2>
			</div>

			<div className="p-4 space-y-4 max-w-md mx-auto w-full">
				<MethodSelector
					value={settings?.calculationMethod ?? "mwl"}
					methods={settings?.available_calculation_methods ?? []}
					onValueChange={handleMethodChange}
				/>
			</div>
		</div>
	);
}
