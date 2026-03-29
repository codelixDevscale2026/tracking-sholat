import { Link } from "@tanstack/react-router";
import { BarChart3, History, Home, Settings } from "lucide-react";
import type { ElementType } from "react";

interface NavItemProps {
	to: string;
	icon: ElementType;
	label: string;
}

function NavItem({ to, icon: Icon, label }: NavItemProps) {
	return (
		<Link
			to={to}
			className="flex flex-1 flex-col items-center justify-center gap-1.5 transition-all group relative py-1"
			activeProps={{ className: "text-emerald-600 dark:text-emerald-400" }}
			inactiveProps={{ className: "text-zinc-400 dark:text-zinc-500" }}
		>
			{({ isActive }) => (
				<>
					<div
						className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? "bg-emerald-500/10 dark:bg-emerald-500/20" : "group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800/50"}`}
					>
						<Icon
							className={`w-5 h-5 transition-transform group-active:scale-90 ${isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"}`}
						/>
					</div>
					<p className="text-[10px] font-bold uppercase tracking-widest">
						{label}
					</p>
				</>
			)}
		</Link>
	);
}

export function MobileNav() {
	return (
		<nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto flex items-center justify-around border-t border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-[#10221c]/80 backdrop-blur-xl px-2 pb-2 pt-2 z-50">
			<NavItem to="/" icon={Home} label="Home" />
			<NavItem to="/history" icon={History} label="History" />
			<NavItem to="/stats" icon={BarChart3} label="Stats" />
			<NavItem to="/settings" icon={Settings} label="Settings" />
		</nav>
	);
}
