"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { UserContext, UserProvider } from "@/lib/types";

const Context = createContext<UserContext | undefined>(undefined);

export function UserProvider(
	{ children, storageKey = "user-data" }: UserProvider,
) {
	const [name, setNameState] = useState<string | undefined>(undefined);
	const [mail, setMailState] = useState<string | undefined>(undefined);
	
	// Load from localStorage only after hydration
	useEffect(() => {
		if (typeof window !== "undefined") {
			const storedName = localStorage.getItem(`${storageKey}-name`);
			const storedMail = localStorage.getItem(`${storageKey}-mail`);
			if (storedName) {
				setNameState(storedName);
			}
			if (storedMail) {
				setMailState(storedMail);
			}
		}
	}, [storageKey]);

	const setName = useCallback((newName: string | undefined) => {
		setNameState(newName);
		if (typeof window !== "undefined") {
			if (newName) {
				localStorage.setItem(`${storageKey}-name`, newName);
			} else {
				localStorage.removeItem(`${storageKey}-name`);
			}
		}
	}, [storageKey]);

	// Only return state value - localStorage is loaded via useEffect
	const getName = useCallback(() => {
		return name;
	}, [name]);

	const setMail = useCallback((newMail: string | undefined) => {
		setMailState(newMail);
		if (typeof window !== "undefined") {
			if (newMail) {
				localStorage.setItem(`${storageKey}-mail`, newMail);
			} else {
				localStorage.removeItem(`${storageKey}-mail`);
			}
		}
	}, [storageKey]);

	// Only return state value - localStorage is loaded via useEffect
	const getMail = useCallback(() => {
		return mail;
	}, [mail]);
	
	const contextValue = {
		setName,
		getName,
		setMail,
		getMail,
	};
	
	return (
		<Context.Provider value={contextValue}>
			{children}
		</Context.Provider>
	);
}

export function useUserContext() {
	const context = useContext(Context);
	if (!context) {
		throw new Error("useUserContext must be used within a UserProvider");
	}
	return context;
}
