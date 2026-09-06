// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: { preset: "netlify", output: { serverDir: "dist/server" } },
  vite: {
    plugins: [
      {
        name: "netlify-prerender-nitro-entry-alias",
        apply: "build",
        async writeBundle() {
          const serverDir = join(process.cwd(), "dist", "server");
          await mkdir(serverDir, { recursive: true });
          await writeFile(
            join(serverDir, "index.mjs"),
            'import handler from "./main.mjs";\nexport default { fetch(request) { return handler(request); } };\n',
            "utf8",
          );
        },
      },
    ],
  },
  tanstackStart: {
    pages: [
      { path: "/", prerender: { enabled: true } },
      { path: "/pack-lula", prerender: { enabled: true } },
      { path: "/pack-augusto", prerender: { enabled: true } },
    ],
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
