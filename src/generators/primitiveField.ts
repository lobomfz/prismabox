import type { DMMF } from "@prisma/generator-helper";
import type { fullAnotation } from "../annotations/annotations";
import { config, t } from "../config";
import { generateTypeboxOptions } from "../annotations/options";
import { processedEnums } from "./enum";
import { makeValue, type TypeboxNames } from "./generator";

const PrimitiveFields = [
	"Int",
	"BigInt",
	"Float",
	"Decimal",
	"String",
	"DateTime",
	"Json",
	"Boolean",
	"Bytes",
] as const;

type PrimitivePrismaFieldType = (typeof PrimitiveFields)[number];

export function isPrimitivePrismaFieldType(
	str: string,
): str is PrimitivePrismaFieldType {
	return PrimitiveFields.includes(str as any);
}

const fieldTypeMap: Record<PrimitivePrismaFieldType, TypeboxNames> = {
	Int: "Integer",
	BigInt: "Integer",
	Float: "Number",
	Decimal: "Number",
	String: "String",
	DateTime: "Date",
	Json: "Any",
	Boolean: "Boolean",
	Bytes: "Uint8Array",
};

export class Field {
	private string: string;
	private defaultOptions = generateTypeboxOptions();
	private ignore = false;
	private field: Partial<DMMF.Model["fields"][number]>;

	constructor(data: {
		field: Partial<DMMF.Model["fields"][number]>;
		annotations?: fullAnotation;
		initialString?: string;
	}) {
		const { field, annotations, initialString } = data;

		this.field = field;

		if (field.type && !isPrimitivePrismaFieldType(field.type)) {
			const thisEnum = processedEnums.find((e) => e.name === field.type);

			if (!thisEnum) {
				this.ignore = true;
				this.string = "";
				return;
			}

			this.string = thisEnum.stringRepresentation;
			return;
		}

		if (initialString) {
			this.string = initialString;
			return;
		}

		if (field.type && field.type in fieldTypeMap) {
			const type = fieldTypeMap[field.type as keyof typeof fieldTypeMap];

			this.string = makeValue([], type, annotations);
			return;
		}

		throw new Error("unsupported field type");
	}

	private wrapWithArray() {
		this.string = `${t}.Array(${this.string}${this.defaultOptions ? `, ${this.defaultOptions}` : ""})`;

		return this;
	}

	private wrapWithNullable() {
		this.string = `${config.nullableName}(${this.string})`;

		return this;
	}

	private wrapWithOptional() {
		this.string = `${t}.Optional(${this.string})`;

		return this;
	}

	parse() {
		if (this.ignore) return null;

		if (this.field.isList) {
			this.wrapWithArray();
		}

		if (!this.field.isRequired) {
			this.wrapWithNullable().wrapWithOptional();
		}

		return `${this.field.name}: ${this.string}`;
	}
}
