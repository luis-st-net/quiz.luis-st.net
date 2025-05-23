"use client";

import React, { useState } from "react";
import { useNameContext } from "@/lib/contexts/name-context";
import { useRouter, useSearchParams } from "next/navigation";

export default function NamePage() {
	const [inputName, setInputName] = useState("");
	const { setName } = useNameContext();
	const router = useRouter();
	const searchParams = useSearchParams();
	
	const returnTo = decodeURIComponent(searchParams.get("returnTo") || "/");
	
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		
		setName(inputName.trim());
		router.push(returnTo);
	};
	
	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-4">
			<div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
				<h1 className="text-2xl font-bold mb-6 text-center">
					What's your name?
				</h1>
				
				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label htmlFor="name" className="block text-sm font-medium mb-2">
							Your Name
						</label>
						<input type="text" id="name" className="w-full px-3 py-2 border rounded-md" value={inputName} onChange={(e) => setInputName(e.target.value)} placeholder="Enter your name" autoFocus/>
					</div>
					
					<button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
						Continue
					</button>
				</form>
			</div>
		</div>
	);
}
