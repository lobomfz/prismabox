import { Biome, Distribution } from "@biomejs/js-api";

const biome = await Biome.create({
	distribution: Distribution.NODE,
});

export function format(input: string) {
	const formatted = biome.formatContent(input, {
		filePath: "example.ts",
	});

	return formatted.content;
}
