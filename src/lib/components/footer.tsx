import React from "react";
import { Heart } from "lucide-react";

export default function Footer() {
	return (
		<footer className="h-10 shrink-0 border-t bg-card/50">
			<div className="flex items-center justify-center h-full px-4 gap-1.5">
				<p className="text-xs text-muted-foreground">
					© {new Date().getFullYear()} Luis Staudt
				</p>
			</div>
		</footer>
	);
}
