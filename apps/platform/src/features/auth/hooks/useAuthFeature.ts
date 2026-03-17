import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { api } from "@/utils/api";
import type { LoginFormValues, RegisterFormValues, User } from "../auth.types";

interface AuthResponse {
	user: User;
	token: string;
	message?: string;
}

interface ErrorResponse {
	message: string;
}

export function useAuthFeature() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const userQuery = useQuery({
		queryKey: ["auth", "me"],
		queryFn: async () => {
			const token = localStorage.getItem("auth_token");
			const res = await api.api.v1.auth.me.$get(
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			if (!res.ok) throw new Error("Not authenticated");
			const data = (await res.json()) as unknown as { user: User };
			return data.user;
		},
		retry: false,
		staleTime: 1000 * 60 * 5, // 5 minutes
		enabled:
			typeof window !== "undefined" && !!localStorage.getItem("auth_token"),
	});

	const loginMutation = useMutation({
		mutationFn: async (values: LoginFormValues) => {
			const res = await api.api.v1.auth.login.$post({
				json: values,
			});
			const data = await res.json();
			if (!res.ok) {
				const error = data as unknown as ErrorResponse;
				throw new Error(error.message || "Login failed");
			}
			return data as unknown as AuthResponse;
		},
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
		mutationFn: async (values: RegisterFormValues) => {
			const res = await api.api.v1.auth.register.$post({
				json: values,
			});
			const data = await res.json();
			if (!res.ok) {
				const error = data as unknown as ErrorResponse;
				throw new Error(error.message || "Registration failed");
			}
			return data as unknown as AuthResponse;
		},
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
		mutationFn: async () => {
			const res = await api.api.v1.auth.logout.$post(
				{},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
					},
				},
			);
			if (!res.ok) throw new Error("Logout failed");
			return res.json();
		},
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
