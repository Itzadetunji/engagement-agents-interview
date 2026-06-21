"use client";

import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30_000,
				refetchOnWindowFocus: false,
			},
		},
		queryCache: new QueryCache({
			onError: (error, query) => {
				const label =
					typeof query.meta?.errorLabel === "string"
						? query.meta.errorLabel
						: "Request failed";
				toast.error(`${label}: ${getApiErrorMessage(error)}`, {
					id: query.queryHash,
				});
			},
		}),
	});
}

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(createQueryClient);

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
