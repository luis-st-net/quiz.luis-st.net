"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { UserContext, UserProvider } from "@/lib/types";

const Context = createContext<UserContext | undefined>(undefined);

export function UserProvider(
	{ children, storageKey = "user-data" }: UserProvider,
) {
	const [name, setNameState] = useState<string | undefined>(undefined);
	const [mail, setMailState] = useState<string | undefined>(undefined);
	
	useEffect(() => {
		if (typeof window !== "undefined") {
			const storedName = localStorage.getItem(storageKey);
			if (storedName) {
				setNameState(storedName);
			}
		}
	}, [storageKey]);
	
	const setName = useCallback((newName: string | undefined) => {
		setNameState(newName);
		if (typeof window !== "undefined" && newName) {
			localStorage.setItem(`${storageKey}-name`, newName);
		}
	}, [storageKey]);
	
	const getName = useCallback(() => {
		if (name) {
			return name;
		}
		
		if (typeof window !== "undefined") {
			return localStorage.getItem(`${storageKey}-name`) || undefined;
		}
		return undefined;
	}, [name, storageKey]);
	
	const setMail = useCallback((newMail: string | undefined) => {
		setMailState(newMail);
		if (typeof window !== "undefined" && newMail) {
			localStorage.setItem(`${storageKey}-mail`, newMail);
		}
	}, [storageKey]);
	
	const getMail = useCallback(() => {
		if (mail) {
			return mail;
		}
		
		if (typeof window !== "undefined") {
			return localStorage.getItem(`${storageKey}-mail`) || undefined;
		}
		return undefined;
	}, [mail, storageKey]);
	
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
