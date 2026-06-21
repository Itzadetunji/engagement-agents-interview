import axios from "axios";
import type { ErrorResponse } from "@shared/response";

export function getApiErrorMessage(error: unknown): string {
	if (axios.isAxiosError(error)) {
		const data = error.response?.data as ErrorResponse | undefined;
		if (data?.message) {
			const details =
				data.errors.length > 0 ? `: ${data.errors.join(", ")}` : "";
			return `${data.message}${details}`;
		}
		if (error.message) {
			return error.message;
		}
	}

	if (error instanceof Error) {
		return error.message;
	}

	return "Something went wrong";
}
