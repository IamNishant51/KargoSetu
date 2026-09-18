import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LANGS = ["en", "hi", "bn", "mr", "ta", "te", "gu"];
const DIR = join(__dirname, "../src/i18n/translations");

function flatten(obj, prefix = "") {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === "object" && v !== null
      ? flatten(v, prefix ? `${prefix}.${k}` : k)
      : [`${prefix ? prefix + "." : ""}${k}`],
  );
}

const allKeys = LANGS.map((lang) => {
  const data = JSON.parse(readFileSync(join(DIR, `${lang}.json`), "utf8"));
  return { lang, keys: new Set(flatten(data)) };
});

const enKeys = allKeys.find((x) => x.lang === "en").keys;
let ok = true;
for (const { lang, keys } of allKeys) {
  if (lang === "en") continue;
  const missing = [...enKeys].filter((k) => !keys.has(k));
  if (missing.length) {
    console.error(`[FAIL] ${lang}: missing keys:`, missing.join(", "));
    ok = false;
  }
}
if (ok) console.log("[OK] i18n parity verified across all 7 languages");
process.exit(ok ? 0 : 1);
