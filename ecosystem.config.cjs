module.exports = {
	apps: [
		{
			name: "tracking-sholat-api",
			script: "pnpm",
			args: "run --filter=api start",
			env: {
				NODE_ENV: "production",
			},
		},
		{
			name: "tracking-sholat-platform",
			script: "pnpm",
			args: "run --filter=platform preview -- --port 3000 --host 0.0.0.0",
			env: {
				NODE_ENV: "production",
			},
		},
	],
};
