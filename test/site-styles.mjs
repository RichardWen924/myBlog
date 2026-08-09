import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function readSiteStyles(root) {
  return ['global.css', 'home.css', 'work.css', 'illustration.css']
    .map((file) => readFileSync(resolve(root, 'src/styles', file), 'utf8'))
    .join('\n');
}
