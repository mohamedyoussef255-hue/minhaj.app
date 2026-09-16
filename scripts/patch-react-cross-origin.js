import fs from 'fs';
import path from 'path';

const filesToPatch = [
  'node_modules/react-dom/cjs/react-dom-client.development.js',
  'node_modules/react-dom/cjs/react-dom-profiling.development.js',
  'node_modules/.vite/deps/react-dom_client.js',
];

const targetPattern1 = /function readReactElementTypeof\(value\)\s*\{\s*return\s*"\$\$typeof"\s*in\s*value\s*&&\s*hasOwnProperty\.call\(value,\s*"\$\$typeof"\)\s*\?\s*value\.\$\$typeof\s*:\s*void 0;\s*\}/g;
const replacement1 = `function readReactElementTypeof(value) { try { return "$$typeof" in value && hasOwnProperty.call(value, "$$typeof") ? value.$$typeof : void 0; } catch (_e) { return void 0; } }`;

const targetPattern2 = /if\s*\(value\.\$\$typeof\s*===\s*REACT_ELEMENT_TYPE\)\s*return\s*\(maxLength\s*=\s*getComponentNameFromType\(value\.type\)\)\s*\?\s*"<"\s*\+\s*maxLength\s*\+\s*">"\s*:\s*"<\.\.\.>";/g;
const replacement2 = `try { if (value.$$typeof === REACT_ELEMENT_TYPE) return (maxLength = getComponentNameFromType(value.type)) ? "<" + maxLength + ">" : "<...>"; } catch (_e) {}`;

for (const relPath of filesToPatch) {
  const fullPath = path.resolve(process.cwd(), relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    if (targetPattern1.test(content)) {
      content = content.replace(targetPattern1, replacement1);
      modified = true;
    }
    if (targetPattern2.test(content)) {
      content = content.replace(targetPattern2, replacement2);
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`[minhaj-patch] Successfully patched ${relPath}`);
    } else {
      console.log(`[minhaj-patch] Target pattern not found or already patched in ${relPath}`);
    }
  }
}
