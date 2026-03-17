import { createFileRoute } from "@tanstack/react-router";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const Route = createFileRoute("/register")({
	component: RegisterPage,
});

function RegisterPage() {
	return (
		<div className="min-h-screen flex flex-col items-center bg-[#f6f8f7] dark:bg-[#10221c] font-display">
			{/* Decorative background elements */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
				<div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
				<div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
			</div>

			<div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-12 relative z-10">
				<RegisterForm />
			</div>
		</div>
	);
}
