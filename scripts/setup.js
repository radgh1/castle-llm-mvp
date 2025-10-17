import fs from "fs";
import path from "path";

const dirs = [
  "server/src/providers",
  "server/src/services",
  "server/src/store",
  "client/src/components",
  "client/src/lib"
];

dirs.forEach(d => fs.mkdirSync(d, { recursive: true }));
["index.ts","schema.ts","util.ts"].forEach(f =>
  fs.writeFileSync(path.join("server/src", f), "")
);
["App.tsx","main.tsx","styles.css"].forEach(f =>
  fs.writeFileSync(path.join("client/src", f), "")
);
fs.writeFileSync(".env.example", "OPENAI_API_KEY=\n");
console.log("✅ Castle LLM MVP structure created!");
