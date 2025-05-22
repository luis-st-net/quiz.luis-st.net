"use client";

import * as Ui from "@/lib/components/ui/";
import React, { HTMLAttributes } from "react";

import { cn } from "@/lib/utility";

export default function NavigationBar() {
	return (
		<div className="h-20 flex flex-row items-center p-4 bg-custom-dark-blue">
			<div className="w-full flex flex-row items-center justify-start gap-4 sm:gap-8 custom-lg:gap-14">
				<NavigationBarItem title="Quiz"/>
			</div>
			<Ui.ThemeToggle className="hidden nano:block"/>
		</div>
	);
}

function NavigationBarItem(
	{ title, className, ...props }: HTMLAttributes<HTMLDivElement> & { title: string },
) {
	return (
		<div className={cn("text-lg text-custom-white-primary xs:text-xl sm:text-2xl custom-lg:text-3xl", className)} {...props}>
			<strong>
				{title}
			</strong>
		</div>
	);
}
