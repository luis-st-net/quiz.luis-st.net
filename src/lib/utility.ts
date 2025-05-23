import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function isProduction(): boolean {
	return process.env.NODE_ENV === "production";
}

export function isDevelopment(): boolean {
	return process.env.NODE_ENV === "development";
}

export function generateUniqueId(): string {
	return crypto.randomUUID();
}
