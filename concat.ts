// concat.ts
import * as fs from "fs";
import * as path from "path";

const rootDirs = ["backend/src", "frontend/src"]; // adjust to your project
const outputFile = "project-concatenated.ts";

function getAllFiles(dir: string, extFilter: string[] = [".ts", ".tsx"]) {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, extFilter));
    } else if (extFilter.includes(path.extname(file))) {
      results.push(filePath);
    }
  });
  return results;
}

function concatFiles() {
  const allFiles = rootDirs.flatMap((dir) => getAllFiles(dir));
  const content = allFiles
    .map((file) => `// FILE: ${file}\n` + fs.readFileSync(file, "utf-8"))
    .join("\n\n");
  fs.writeFileSync(outputFile, content);
  console.log(`Concatenated ${allFiles.length} files into ${outputFile}`);
}

concatFiles();