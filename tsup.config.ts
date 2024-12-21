import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/marqu-eee.ts"],
	format: ["esm", "iife"],
	globalName: "marqueee",
	minify: true,
	clean: true,
	sourcemap: true,
})
