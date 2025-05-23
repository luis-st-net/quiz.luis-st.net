"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { NameContext, NameProvider } from "@/lib/types";
import { useRouter } from "next/navigation";

const Context = createContext<NameContext | undefined>(undefined);

export function NameProvider(
	{ children, storageKey = "player-name" }: NameProvider,
) {
	const [name, setNameState] = useState<string | undefined>(undefined);
	const router = useRouter();
	
	useEffect(() => {
		if (typeof window !== "undefined") {
			const storedName = localStorage.getItem(storageKey);
			if (storedName) {
				setNameState(storedName);
			}
		}
	}, [storageKey]);
	
	const setName = useCallback((newName: string) => {
		setNameState(newName);
		if (typeof window !== "undefined") {
			localStorage.setItem(storageKey, newName);
		}
	}, [storageKey]);
	
	const getName = useCallback(() => {
		if (name) {
			return name;
		}
		
		if (typeof window !== "undefined") {
			return localStorage.getItem(storageKey) || undefined;
		}
		return undefined;
	}, [name, storageKey]);
	
	const getNameOrRedirect = useCallback((redirectPath?: string) => {
		const currentName = getName();
		if (!currentName) {
			const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
			const returnPath = redirectPath || currentPath;
			router.push(`/name?redirect=${encodeURIComponent(returnPath)}`);
			return undefined;
		}
		return currentName;
	}, [getName, router]);
	
	const contextValue = {
		setName,
		getName,
		getNameOrRedirect,
	};
	
	return (
		<Context.Provider value={contextValue}>
			{children}
		</Context.Provider>
	);
}

export function useNameContext() {
	const context = useContext(Context);
	if (!context) {
		throw new Error("useNameContext must be used within a NameProvider");
	}
	return context;
}
