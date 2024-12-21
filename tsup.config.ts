import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/marqu-eee.ts"],
	format: ["esm", "iife"],
	globalName: "marqueee",
	clean: true,
	sourcemap: true,
})
