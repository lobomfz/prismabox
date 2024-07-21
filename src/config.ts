import { type Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const configSchema = Type.Object(
	{
		fileName: Type.String({ default: "prismabox.ts" }),
		output: Type.String({ default: "./prisma/prismabox" }),
		typeboxImportVariableName: Type.String({ default: "Type" }),
		typeboxImportDependencyName: Type.String({ default: "@sinclair/typebox" }),
		additionalProperties: Type.Boolean({ default: false }),
		ignoreEnums: Type.Boolean({ default: false }),
		ignoreIdOnInputModel: Type.Boolean({ default: true }),
		ignoredFields: Type.Array(Type.String(), {
			default: ["createdAt", "updatedAt", "created_at", "updated_at"],
		}),
		nullableName: Type.String({ default: "__nullable__" }),
		whitelistedOnly: Type.Boolean({ default: false }),
	},
	{ additionalProperties: false },
);

export let config = {} as Static<typeof configSchema>;
export let t = "";

export function setConfig(input: unknown) {
	try {
		Value.Clean(configSchema, input);
		Value.Default(configSchema, input);
		config = Value.Decode(configSchema, Value.Convert(configSchema, input));
		t = config.typeboxImportVariableName;
		Object.freeze(config);
	} catch (error) {
		console.error(Value.Errors(configSchema, input).First);
		throw error;
	}
}
