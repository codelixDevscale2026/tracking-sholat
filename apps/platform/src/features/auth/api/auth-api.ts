import { api } from "@/utils/api";
import type {
	LoginFormValues,
	RegisterFormValues,
	User,
} from "../types/auth.types";

export interface AuthResponse {
	user: User;
	token: string;
	message?: string;
}

export interface ErrorResponse {
	message: string;
}

export async function fetchMe(): Promise<User> {
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
}

export async function login(values: LoginFormValues): Promise<AuthResponse> {
	const res = await api.api.v1.auth.login.$post({
		json: values,
	});
	const data = await res.json();
	if (!res.ok) {
		const error = data as unknown as ErrorResponse;
		throw new Error(error.message || "Login failed");
	}
	return data as unknown as AuthResponse;
}

export async function register(
	values: RegisterFormValues,
): Promise<AuthResponse> {
	const res = await api.api.v1.auth.register.$post({
		json: values,
	});
	const data = await res.json();
	if (!res.ok) {
		const error = data as unknown as ErrorResponse;
		throw new Error(error.message || "Registration failed");
	}
	return data as unknown as AuthResponse;
}

export async function logout(): Promise<void> {
	const token = localStorage.getItem("auth_token");
	const res = await api.api.v1.auth.logout.$post(
		{},
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);
	if (!res.ok) throw new Error("Logout failed");
	await res.json();
}
