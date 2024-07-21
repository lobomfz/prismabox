import type { DMMF } from "@prisma/generator-helper";
import { extractAnnotations, shouldIgnore } from "../annotations/annotations";
import type { ProcessedModel } from "../model";
import { t } from "../config";
import { makeValue } from "./generator";

export const processedEnums: ProcessedModel[] = [];

export function processEnums(
	enums: DMMF.DatamodelEnum[] | Readonly<DMMF.DatamodelEnum[]>,
) {
	for (const e of enums) {
		const stringRepresentation = stringifyEnum(e);

		if (stringRepresentation) {
			processedEnums.push({
				name: e.name,
				stringRepresentation,
			});
		}
	}

	Object.freeze(processedEnums);
}

function stringifyEnum(data: DMMF.DatamodelEnum) {
	const annotations = extractAnnotations(data.documentation);

	if (shouldIgnore(annotations)) return undefined;

	const variantsString = data.values.map((v) => `${t}.Literal('${v.name}')`);

	return makeValue(variantsString, "Union", annotations);
}
