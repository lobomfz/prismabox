import {
	stringifyOptions,
	type fullAnotation,
	type Options,
} from "../annotations/annotations";
import { generateTypeboxOptions } from "../annotations/options";
import { t } from "../config";

export type TypeboxNames =
	| "Union"
	| "Object"
	| "Integer"
	| "Number"
	| "String"
	| "Date"
	| "Any"
	| "Boolean"
	| "Uint8Array";

export function makeValue(
	inputModels: string[],
	name: TypeboxNames,
	annotations: fullAnotation | undefined,
) {
	const options = generateTypeboxOptions(annotations);

	if (name === "Union") {
		return makeUnion(inputModels, options);
	}

	const modelsValue = inputModels.join(",");

	const value = modelsValue?.length ? `{ ${modelsValue} }` : "";

	const res = `${t}.${name}(${value}${stringifyOptions(options, value, true)})\n`;

	return res;
}

function makeUnion(inputModels: string[], options: Options | null) {
	return `${t}.Union([${inputModels.join(",")}]${stringifyOptions(options, undefined, true)})\n`;
}
