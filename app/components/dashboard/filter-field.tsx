import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export function FilterField({
	label,
	htmlFor,
	children,
}: {
	label: string;
	htmlFor?: string;
	children: ReactNode;
}) {
	return (
		<div className="flex min-w-0 flex-col gap-2">
			<Label htmlFor={htmlFor}>{label}</Label>
			{children}
		</div>
	);
}
