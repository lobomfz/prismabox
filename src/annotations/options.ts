import { config } from "../config";
import type { fullAnotation, Options } from "./annotations";

export function generateTypeboxOptions(input?: fullAnotation | null) {
	const options: Options = input?.data ?? {};

	for (const annotation of input?.annotations ?? []) {
		if (annotation.type === "OPTIONS") {
			for (const [key, value] of Object.entries(annotation.values)) {
				options[key] = value;
			}
		}
	}

	if (!config.additionalProperties) {
		options.additionalProperties = false;
	}

	if (!Object.keys(options).length) {
		return null;
	}

	return options;
}
