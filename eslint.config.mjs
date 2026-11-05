import { defineConfig, globalIgnores } from "eslint/config";
import regrasDesempenho from "eslint-config-next/core-web-vitals";
import regrasTypeScript from "eslint-config-next/typescript";

const configuracaoLint = defineConfig([
  ...regrasDesempenho,
  ...regrasTypeScript,
  // Personaliza os arquivos ignorados pelo eslint-config-next.
  globalIgnores([
    // Arquivos ignorados por padrão pelo eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default configuracaoLint;
