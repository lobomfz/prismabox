import { mkdir } from "node:fs/promises";
import { generatorHandler } from "@prisma/generator-helper";
import { config, setConfig } from "./config";
import { processPlain } from "./generators/plain";
import { write } from "./writer";
import { processEnums } from "./generators/enum";

async function prepareDirectory() {
	await mkdir(config.output, { recursive: true });
}

generatorHandler({
	onManifest() {
		return {
			defaultOutput: "./prismabox",
			prettyName: "prismabox",
		};
	},

	async onGenerate(options) {
		setConfig({
			...options.generator.config,
			output: options.generator.output?.value,
		});

		await prepareDirectory();

		if (!config.ignoreEnums) {
			processEnums(options.dmmf.datamodel.enums);
		}

		processPlain(options.dmmf.datamodel.models);

		await write();
	},
});
