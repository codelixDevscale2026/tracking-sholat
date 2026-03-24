import { useEffect, useState } from "react";

export function useCountdown(initialSeconds: number) {
	const [countdown, setCountdown] = useState(initialSeconds);
	const [isActive, setIsActive] = useState(true);

	useEffect(() => {
		let interval: NodeJS.Timeout | null = null;

		if (isActive && countdown > 0) {
			interval = setInterval(() => {
				setCountdown((countdown: number) => countdown - 1);
			}, 1000);
		} else if (countdown === 0) {
			setIsActive(false);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isActive, countdown]);

	const reset = (newSeconds?: number) => {
		setCountdown(newSeconds ?? initialSeconds);
		setIsActive(true);
	};

	const formatTime = (totalSeconds: number) => {
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		if (hours > 0) {
			return `${hours.toString().padStart(2, "0")}:${minutes
				.toString()
				.padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
		}
		return `${minutes.toString().padStart(2, "0")}:${seconds
			.toString()
			.padStart(2, "0")}`;
	};

	return { countdown, isActive, reset, formatTime };
}
