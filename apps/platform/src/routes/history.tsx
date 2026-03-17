import { createFileRoute } from "@tanstack/react-router";
import { MobileNav } from "@/components/layout/MobileNav";

export const Route = createFileRoute("/history")({
	component: HistoryPage,
});

function HistoryPage() {
	return (
		<div className="flex flex-col min-h-screen bg-[#f6f8f7] dark:bg-[#10221c]">
			<div className="flex-1 flex items-center justify-center">
				<h1 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 italic tracking-tighter">
					History Coming Soon
				</h1>
			</div>
			<MobileNav />
		</div>
	);
}
