import { config, t } from "../config";

export function nullableType() {
	const exportStatement = `export const ${config.nullableName} = `;

	const fnDeclaration = `<T extends TSchema>(schema: T) => 
		${t}.Union([${t}.Null(), schema])\n`;

	return `${exportStatement}${fnDeclaration}`;
}
