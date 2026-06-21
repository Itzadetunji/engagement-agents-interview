import React from "react";
import { cn } from "@/lib/utils";

interface UpDownIconProps
	extends Omit<React.SVGProps<SVGSVGElement>, "direction"> {
	sortDirection?: "asc" | "desc" | null;
}

export function UpDownIcon({
	sortDirection = null,
	className,
	...props
}: UpDownIconProps) {
	const activeClass = "text-foreground";
	const inactiveClass = "text-muted-foreground/35";

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={cn("size-4 shrink-0", className)}
			{...props}
		>
			<g className={sortDirection === "desc" ? activeClass : inactiveClass}>
				<path d="m3 16 4 4 4-4" />
				<path d="M7 20V4" />
			</g>
			<g className={sortDirection === "asc" ? activeClass : inactiveClass}>
				<path d="m21 8-4-4-4 4" />
				<path d="M17 4v16" />
			</g>
		</svg>
	);
}
