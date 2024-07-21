import type { DMMF } from "@prisma/generator-helper";
import { config } from "../config";
import { processedEnums } from "../generators/enum";
import { isPrimitivePrismaFieldType } from "../generators/primitiveField";

export type Options = Record<string, any>;

type Annotation =
	| { type: "HIDDEN" }
	| { type: "HIDDEN_INPUT" }
	| { type: "WHITELISTED" }
	| { type: "OPTIONS"; values: Options };

const annotationKeys: { type: Annotation["type"]; keys: string[] }[] = [
	{
		type: "HIDDEN_INPUT",
		keys: [
			// we need to use input.hide instead of hide.input because the latter is a substring of input.hidden
			// and will falsely match
			"@prismabox.input.hide",
			"@prismabox.input.hidden",
		],
	},
	{
		type: "HIDDEN",
		keys: ["@prismabox.hide", "@prismabox.hidden"],
	},
	{
		type: "OPTIONS",
		keys: ["@prismabox.options"],
	},
	{
		type: "WHITELISTED",
		keys: ["@prismabox.whitelisted"],
	},
];

export type fullAnotation = {
	isHidden: boolean;
	isHiddenInput: boolean;
	isWhitelisted: boolean;
	annotations: Annotation[];
	data: {
		description: string | undefined;
	};
};

export function extractAnnotations(
	input: DMMF.Model["fields"][number]["documentation"],
): fullAnotation {
	const annotations: Annotation[] = [];

	let description = "";

	const raw = input ?? "";

	const parsedLines = raw
		.split("\n")
		.map((l) => l.trim())
		.filter((l) => l.length);

	for (const line of parsedLines) {
		const annotationKey = annotationKeys.find(({ keys }) =>
			keys.some((k) => line.startsWith(k)),
		);

		if (!annotationKey) {
			description += `${line}\n`;
			continue;
		}

		if (annotationKey.type !== "OPTIONS") {
			annotations.push({ type: annotationKey.type });
			continue;
		}

		checkOptionSyntax(line, annotationKey.keys);

		const values = parseOptions(extractOptions(line));

		annotations.push({
			type: "OPTIONS",
			values,
		});
	}

	description = description.trim();

	let isHidden = false;
	let isHiddenInput = false;
	let isWhitelisted = false;

	for (const annotation of annotations) {
		if (annotation.type === "HIDDEN") {
			isHidden = true;
		}

		if (annotation.type === "HIDDEN_INPUT") {
			isHiddenInput = true;
		}

		if (annotation.type === "WHITELISTED") {
			isWhitelisted = true;
		}
	}

	return {
		isHidden,
		isHiddenInput,
		isWhitelisted,
		annotations,
		data: {
			description: description.length > 0 ? `"${description}"` : undefined,
		},
	};
}

function checkOptionSyntax(input: string, keys: string[]) {
	if (!input.startsWith(`${keys[0]}{`)) {
		throw new Error(
			"Invalid syntax, expected opening { after prismabox.options",
		);
	}

	if (!input.endsWith("}")) {
		throw new Error("Invalid syntax, expected closing } for prismabox.options");
	}
}

function extractOptions(input: string) {
	if (!input) {
		return null;
	}

	const regex = /@prismabox\.options\{(.*?)\}/;
	const match = input.match(regex);

	if (match?.[1]) {
		return match[1];
	}

	return null;
}

function parseOptions(input: string | null | undefined): Options {
	if (!input) {
		return {};
	}

	const options = input.split(",").map((option) => option.trim());

	return Object.fromEntries(
		options.map((option) => {
			const [key, value] = option.split(":");

			return [key.trim(), value.trim()];
		}),
	);
}

export function stringifyOptions(
	options: Options | null,
	firstValue?: string,
	addComma?: boolean,
) {
	if (!options) {
		return "";
	}

	const value = Object.entries(options)
		.filter(([_, value]) =>
			typeof value === "string" ? value?.length : value != null,
		)
		.map(([key, value]) => `${key} : ${value}`)
		.join(",");

	if (!value.length) return "";

	if (!addComma || (typeof firstValue === "string" && !firstValue?.length)) {
		return `{ ${value} }`;
	}

	return `, { ${value} }`;
}

export function shouldIgnore(
	annotation: fullAnotation,
	field?: Partial<DMMF.Model["fields"][number]>,
	options?: {
		ignorePrimitives?: boolean;
	},
): boolean {
	if (annotation.isHidden) return true;

	if (!field && !annotation.isWhitelisted && config.whitelistedOnly)
		return true;

	if (
		field?.type &&
		isPrimitivePrismaFieldType(field.type) &&
		options?.ignorePrimitives
	) {
		return true;
	}

	if (field?.name && config.ignoredFields.includes(field.name)) return true;

	if (field?.type && processedEnums.find((e) => e.name === field.type))
		return true;

	return false;
}
