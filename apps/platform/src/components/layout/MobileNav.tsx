import { Link } from "@tanstack/react-router";
import { BarChart3, History, Home, Settings } from "lucide-react";

export function MobileNav() {
	return (
		<nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto flex gap-2 border-t border-emerald-500/10 bg-white/80 dark:bg-[#10221c]/80 backdrop-blur-xl px-4 pb-6 pt-3 z-50">
			<Link
				to="/"
				className="flex flex-1 flex-col items-center justify-center gap-1 transition-colors group"
				activeProps={{ className: "text-emerald-600 dark:text-emerald-400" }}
				inactiveProps={{ className: "text-zinc-400 dark:text-zinc-500" }}
			>
				{({ isActive }) => (
					<>
						<Home
							className={`w-6 h-6 transition-transform group-active:scale-95 ${isActive ? "fill-current" : ""}`}
						/>
						<p className="text-[10px] font-bold uppercase tracking-wider">
							Home
						</p>
					</>
				)}
			</Link>

			<Link
				to="/history"
				className="flex flex-1 flex-col items-center justify-center gap-1 transition-colors group"
				activeProps={{ className: "text-emerald-600 dark:text-emerald-400" }}
				inactiveProps={{ className: "text-zinc-400 dark:text-zinc-500" }}
			>
				{({ isActive }) => (
					<>
						<History
							className={`w-6 h-6 transition-transform group-active:scale-95 ${isActive ? "fill-current" : ""}`}
						/>
						<p className="text-[10px] font-bold uppercase tracking-wider">
							History
						</p>
					</>
				)}
			</Link>

			<Link
				to="/stats"
				className="flex flex-1 flex-col items-center justify-center gap-1 transition-colors group"
				activeProps={{ className: "text-emerald-600 dark:text-emerald-400" }}
				inactiveProps={{ className: "text-zinc-400 dark:text-zinc-500" }}
			>
				{({ isActive }) => (
					<>
						<BarChart3
							className={`w-6 h-6 transition-transform group-active:scale-95 ${isActive ? "fill-current" : ""}`}
						/>
						<p className="text-[10px] font-bold uppercase tracking-wider">
							Stats
						</p>
					</>
				)}
			</Link>

			<Link
				to="/settings"
				className="flex flex-1 flex-col items-center justify-center gap-1 transition-colors group"
				activeProps={{ className: "text-emerald-600 dark:text-emerald-400" }}
				inactiveProps={{ className: "text-zinc-400 dark:text-zinc-500" }}
			>
				{({ isActive }) => (
					<>
						<Settings
							className={`w-6 h-6 transition-transform group-active:scale-95 ${isActive ? "fill-current" : ""}`}
						/>
						<p className="text-[10px] font-bold uppercase tracking-wider">
							Settings
						</p>
					</>
				)}
			</Link>
		</nav>
	);
}
