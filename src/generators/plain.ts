import type { DMMF } from "@prisma/generator-helper";
import { extractAnnotations, shouldIgnore } from "../annotations/annotations";
import type { ProcessedModel } from "../model";
import { Field } from "./primitiveField";
import { makeValue } from "./generator";

export const processedPlain: ProcessedModel[] = [];

export function processPlain(models: DMMF.Model[] | Readonly<DMMF.Model[]>) {
	for (const model of models) {
		const stringRepresentation = stringifyPlain(model);

		if (stringRepresentation) {
			processedPlain.push({ name: model.name, stringRepresentation });
		}
	}

	Object.freeze(processedPlain);
}

function stringifyPlain(data: DMMF.Model) {
	const annotations = extractAnnotations(data.documentation);

	if (shouldIgnore(annotations)) return undefined;

	const fields: string[] = [];

	for (const field of data.fields) {
		const annotations = extractAnnotations(field.documentation);

		if (shouldIgnore(annotations, field)) {
			continue;
		}

		const parsed = new Field({ field, annotations }).parse();

		if (parsed) fields.push(parsed);
	}

	return makeValue(fields, "Object", annotations);
}
