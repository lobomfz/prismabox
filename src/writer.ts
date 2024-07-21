import { join } from "node:path";
import { format } from "./format";
import { mapAllModelsForWrite } from "./model";
import { config } from "./config";

export function write() {
	const mappings = mapAllModelsForWrite();

	const path = join(config.output, config.fileName);

	return Bun.write(path, format(mappings.join("\n")));
}
