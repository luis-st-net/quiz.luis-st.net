"use client";

import React from "react";
import { cn } from "@/lib/utility";
import { GripVertical } from "lucide-react";

interface ResizeHandleProps {
	onMouseDown: (e: React.MouseEvent) => void;
	isResizing?: boolean;
	className?: string;
}

export function ResizeHandle({ onMouseDown, isResizing, className }: ResizeHandleProps) {
	return (
		<div
			onMouseDown={onMouseDown}
			className={cn(
				"absolute top-0 right-0 w-1 h-full cursor-col-resize",
				"group flex items-center justify-center",
				"hover:bg-primary/20 transition-colors",
				isResizing && "bg-primary/30",
				className
			)}
		>
			{/* Visual indicator on hover */}
			<div
				className={cn(
					"absolute right-0 translate-x-1/2",
					"w-4 h-8 rounded-md",
					"flex items-center justify-center",
					"bg-muted border shadow-sm",
					"opacity-0 group-hover:opacity-100 transition-opacity",
					isResizing && "opacity-100"
				)}
			>
				<GripVertical className="size-3 text-muted-foreground" />
			</div>
		</div>
	);
}

export default ResizeHandle;
