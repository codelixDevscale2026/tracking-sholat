import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { Apple, ArrowRight, Chrome, Eye, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useAuthFeature } from "../hooks/useAuthFeature";
import { type RegisterFormValues, registerSchema } from "../types/auth.types";

export function RegisterForm() {
	const { register: registerAction } = useAuthFeature();
	const [showPassword, setShowPassword] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
	});

	function onSubmit(data: RegisterFormValues) {
		registerAction.mutate(data);
	}

	return (
		<div className="w-full max-w-md">
			<div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-emerald-500/5 p-8 border border-emerald-500/10">
				{/* Brand Header */}
				<div className="flex flex-col items-center mb-10 text-center">
					<div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-105 duration-300">
						<svg
							className="w-10 h-10 text-emerald-600 dark:text-emerald-400"
							viewBox="0 0 24 24"
							fill="currentColor"
							role="img"
						>
							<title>Sholat Tracker Logo</title>
							<path d="M12,2L4.5,11V22H19.5V11L12,2M12,4.4L17.5,11H6.5L12,4.4M12,12A3,3 0 0,1 15,15A3,3 0 0,1 12,18A3,3 0 0,1 9,15A3,3 0 0,1 12,12M8,20V12.5L12,17.3L16,12.5V20H8Z" />
						</svg>
					</div>
					<h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
						Sholat Tracker
					</h1>
					<p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm leading-relaxed max-w-[280px]">
						Track your daily prayers and stay consistent with your faith.
					</p>
				</div>

				<h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-6 font-display">
					Create Account
				</h2>

				<form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
					<div className="space-y-4">
						{/* Full Name */}
						<div className="space-y-1.5">
							<label
								htmlFor="fullName"
								className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1"
							>
								Full Name
							</label>
							<div className="relative group">
								<User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
								<input
									{...register("fullName")}
									id="fullName"
									type="text"
									className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-emerald-500/20 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
									placeholder="Enter your full name"
								/>
							</div>
							{errors.fullName && (
								<p className="text-red-500 text-xs mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
									{errors.fullName.message}
								</p>
							)}
						</div>

						{/* Email */}
						<div className="space-y-1.5">
							<label
								htmlFor="email"
								className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1"
							>
								Email Address
							</label>
							<div className="relative group">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
								<input
									{...register("email")}
									id="email"
									type="email"
									className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-emerald-500/20 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
									placeholder="example@email.com"
								/>
							</div>
							{errors.email && (
								<p className="text-red-500 text-xs mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
									{errors.email.message}
								</p>
							)}
						</div>

						{/* Password */}
						<div className="space-y-1.5">
							<label
								htmlFor="password"
								className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1"
							>
								Password
							</label>
							<div className="relative group">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
								<input
									{...register("password")}
									id="password"
									type={showPassword ? "text" : "password"}
									className="w-full pl-11 pr-12 py-3 bg-zinc-50 dark:bg-zinc-950 border border-emerald-500/20 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
									placeholder="••••••••"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-emerald-500 transition-colors"
								>
									<Eye className="w-5 h-5" />
								</button>
							</div>
							{errors.password && (
								<p className="text-red-500 text-xs mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
									{errors.password.message}
								</p>
							)}
						</div>
					</div>

					{/* Terms */}
					<div className="flex items-center gap-3 py-1">
						<input
							type="checkbox"
							id="terms"
							className="w-4 h-4 rounded border-emerald-500/30 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer"
						/>
						<label
							htmlFor="terms"
							className="text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer"
						>
							I agree to the{" "}
							<button
								type="button"
								className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline transition-all"
							>
								Terms of Service
							</button>
						</label>
					</div>

					<Button
						type="submit"
						className="w-full h-13 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center gap-2 group transform active:scale-[0.98]"
						disabled={registerAction.isPending}
					>
						{registerAction.isPending
							? "Creating account..."
							: "Create Account"}
						{!registerAction.isPending && (
							<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
						)}
					</Button>

					{/* Divider */}
					<div className="relative py-2">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-zinc-100 dark:border-zinc-800" />
						</div>
						<div className="relative flex justify-center text-xs uppercase tracking-tighter">
							<span className="px-3 bg-white dark:bg-zinc-900 text-zinc-400">
								Or sign up with
							</span>
						</div>
					</div>

					{/* Social Login */}
					<div className="grid grid-cols-2 gap-4">
						<button
							type="button"
							className="flex items-center justify-center gap-2 py-3 px-4 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200"
						>
							<Chrome className="w-5 h-5 text-blue-500" />
							<span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
								Google
							</span>
						</button>
						<button
							type="button"
							className="flex items-center justify-center gap-2 py-3 px-4 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200"
						>
							<Apple className="w-5 h-5 text-zinc-900 dark:text-white" />
							<span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
								Apple
							</span>
						</button>
					</div>
				</form>

				<div className="mt-8 text-center px-4">
					<p className="text-sm text-zinc-600 dark:text-zinc-400">
						Already have an account?{" "}
						<Link
							to="/login"
							className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline transition-all"
						>
							Sign In
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
