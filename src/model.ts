import { config, t } from "./config";
import { processedPlain } from "./generators/plain";
import { nullableType } from "./generators/nullable";
import { processedEnums } from "./generators/enum";

export type ProcessedModel = {
	name: string;
	stringRepresentation: string;
};

function convertModelToStandalone(input: ProcessedModel) {
	return `export const ${input.name} = ${input.stringRepresentation}\n`;
}

function typepoxImportStatement() {
	return `import { ${t}, type TSchema } from "${config.typeboxImportDependencyName}"\n`;
}

export function mapAllModelsForWrite() {
	const processedModels: string[] = [
		`${typepoxImportStatement()}\n${nullableType()}\n`,
	];

	const process = (models: ProcessedModel[]) => {
		for (const processedModel of models) {
			const standalone = convertModelToStandalone(processedModel);

			processedModels.push(standalone);
		}
	};

	process(processedEnums);
	process(processedPlain);

	return processedModels;
}
