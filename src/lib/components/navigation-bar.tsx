"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, User } from "lucide-react";
import { ThemeToggle } from "@/lib/components/ui";
import { Button } from "@/lib/components/ui/button";
import { useUserContext } from "@/lib/contexts/user-context";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/lib/components/ui/tooltip";

export default function NavigationBar() {
	const { getName } = useUserContext();
	const userName = getName();

	return (
		<header className="h-14 flex-shrink-0 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
			<div className="flex items-center justify-between h-full px-4 lg:px-6">
				{/* Logo / Brand */}
				<Link
					href="/"
					className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
				>
					<div className="p-1.5 rounded-lg bg-primary shadow-sm">
						<BookOpen className="size-5 text-primary-foreground" />
					</div>
					<div className="hidden xs:flex flex-col">
						<span className="text-base font-semibold leading-tight">
							HFU Quiz
						</span>
						<span className="text-[10px] text-muted-foreground leading-tight">
							Lernplattform
						</span>
					</div>
				</Link>

				{/* Right Side Actions */}
				<div className="flex items-center gap-1">
					{userName && (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="gap-2 text-muted-foreground"
									>
										<User className="size-4" />
										<span className="hidden sm:inline max-w-32 truncate">
											{userName}
										</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Angemeldet als {userName}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
