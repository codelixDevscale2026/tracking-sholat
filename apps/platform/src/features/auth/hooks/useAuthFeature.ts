import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { fetchMe, login, logout, register } from "../api/auth-api";
import type { LoginFormValues, RegisterFormValues } from "../types/auth.types";

export function useAuthFeature() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const userQuery = useQuery({
		queryKey: ["auth", "me"],
		queryFn: fetchMe,
		retry: false,
		staleTime: 1000 * 60 * 5, // 5 minutes
		enabled:
			typeof window !== "undefined" && !!localStorage.getItem("auth_token"),
	});

	const loginMutation = useMutation({
		mutationFn: (values: LoginFormValues) => login(values),
		onSuccess: (data) => {
			localStorage.setItem("auth_token", data.token);
			queryClient.setQueryData(["auth", "me"], data.user);
			toast.success("Welcome back!");
			navigate({ to: "/" });
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const registerMutation = useMutation({
		mutationFn: (values: RegisterFormValues) => register(values),
		onSuccess: (data) => {
			localStorage.setItem("auth_token", data.token);
			queryClient.setQueryData(["auth", "me"], data.user);
			toast.success("Account created successfully!");
			navigate({ to: "/" });
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const logoutMutation = useMutation({
		mutationFn: logout,
		onSettled: () => {
			localStorage.removeItem("auth_token");
			queryClient.setQueryData(["auth", "me"], null);
			toast.info("Logged out");
			navigate({ to: "/login" });
		},
	});

	return {
		user: userQuery.data,
		isLoading: userQuery.isLoading,
		isAuthenticated: !!userQuery.data,
		login: loginMutation,
		register: registerMutation,
		logout: logoutMutation,
	};
}
