import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { Apple, ArrowRight, Chrome, Eye, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useAuthFeature } from "../hooks/useAuthFeature";
import { type LoginFormValues, loginSchema } from "../types/auth.types";

export function LoginForm() {
	const { login } = useAuthFeature();
	const [showPassword, setShowPassword] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
	});

	function onSubmit(data: LoginFormValues) {
		login.mutate(data);
	}

	return (
		<div className="w-full max-w-md">
			<div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-emerald-500/5 p-8 border border-emerald-500/10">
				{/* Brand Header */}
				<div className="flex flex-col items-center mb-10 text-center">
					<div className="w-24 h-24 mb-2 transition-transform hover:scale-105 duration-300">
						<img
							src="/icons/logo-vertical.png"
							className="w-full h-full object-contain"
							alt="Sholatify"
						/>
					</div>
					<p className="text-zinc-500 dark:text-zinc-400 mt-0 text-sm leading-relaxed max-w-[280px]">
						Track your daily prayers and stay consistent with your faith.
					</p>
				</div>

				<h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-6 font-display">
					Welcome Back
				</h2>

				<form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
					<div className="space-y-4">
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
							<div className="flex items-center justify-between mb-0.5 px-1">
								<label
									htmlFor="password"
									className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
								>
									Password
								</label>
								<button
									type="button"
									className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-all"
								>
									Forgot Password?
								</button>
							</div>
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

					<Button
						type="submit"
						className="w-full h-13 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center gap-2 group transform active:scale-[0.98] mt-2"
						disabled={login.isPending}
					>
						{login.isPending ? "Signing in..." : "Sign In"}
						{!login.isPending && (
							<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
						)}
					</Button>

					{/* Divider */}
					<div className="relative py-2 mt-2">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-zinc-100 dark:border-zinc-800" />
						</div>
						<div className="relative flex justify-center text-xs uppercase tracking-tighter">
							<span className="px-3 bg-white dark:bg-zinc-900 text-zinc-400">
								Or sign in with
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
							<Apple className="w-5 h-5 text-zinc-900 dark:white" />
							<span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
								Apple
							</span>
						</button>
					</div>
				</form>

				<div className="mt-8 text-center px-4">
					<p className="text-sm text-zinc-600 dark:text-zinc-400">
						Don't have an account?{" "}
						<Link
							to="/register"
							className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline transition-all"
						>
							Sign Up
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
