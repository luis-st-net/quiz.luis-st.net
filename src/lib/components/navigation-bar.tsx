"use client";

import * as Ui from "@/lib/components/ui/";
import React from "react";
import Link from "next/link";

export default function NavigationBar() {
	return (
		<div className="h-20 flex flex-row items-center p-4 bg-special-hfu-green">
			<div className="w-full flex flex-row items-center justify-start gap-4 sm:gap-8 custom-lg:gap-14">
				<Link href="/">
					<div className="text-lg text-custom-white-primary xs:text-xl sm:text-2xl custom-lg:text-3xl">
						<strong>
							Quiz
						</strong>
					</div>
				</Link>
			
			</div>
			<Ui.ThemeToggle className="hidden nano:block"/>
		</div>
	);
}
