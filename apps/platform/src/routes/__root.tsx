import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	redirect,
	Scripts,
	useLocation,
	useNavigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useEffect } from "react";
import { Toaster } from "sonner";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import TanStackQueryProvider from "../integrations/tanstack-query/root-provider";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

// Daftar route yang boleh diakses tanpa login
const PUBLIC_ROUTES = ["/login", "/register"];

export const Route = createRootRouteWithContext<MyRouterContext>()({
	beforeLoad: ({ location }) => {
		// Lewati pengecekan di server (SSR) karena tidak ada localStorage
		if (typeof window === "undefined") return;

		// Lewati pengecekan untuk halaman publik
		if (PUBLIC_ROUTES.includes(location.pathname)) return;

		// Redirect ke login jika belum punya token
		const token = localStorage.getItem("auth_token");
		if (!token) {
			throw redirect({ to: "/login" });
		}
	},
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Tracking Sholat",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com",
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
			},
		],
	}),
	shellComponent: RootDocument,
	component: RootComponent,
});

// Komponen ini berjalan di client-side saat hydration
// untuk menangkap kasus SSR di mana beforeLoad dilewati
function AuthGuard({ children }: { children: React.ReactNode }) {
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		if (PUBLIC_ROUTES.includes(location.pathname)) return;

		const token = localStorage.getItem("auth_token");
		if (!token) {
			navigate({ to: "/login", replace: true });
		}
	}, [location.pathname, navigate]);

	return <>{children}</>;
}

function RootComponent() {
	return (
		<AuthGuard>
			<Outlet />
		</AuthGuard>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<TanStackQueryProvider>
					{children}
					<Toaster position="top-center" richColors />
					<TanStackDevtools
						config={{
							position: "bottom-right",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
							TanStackQueryDevtools,
						]}
					/>
				</TanStackQueryProvider>
				<Scripts />
			</body>
		</html>
	);
}
