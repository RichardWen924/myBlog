import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');

test('React Bits registry is configured for the shadcn MCP server', () => {
  const mcp = JSON.parse(readFileSync(resolve(root, '.mcp.json'), 'utf8'));
  const components = JSON.parse(readFileSync(resolve(root, 'components.json'), 'utf8'));

  assert.deepEqual(mcp.mcpServers.shadcn, {
    command: 'npx',
    args: ['shadcn@latest', 'mcp'],
  });
  assert.equal(components.registries['@react-bits'], 'https://reactbits.dev/r/{name}.json');
});
