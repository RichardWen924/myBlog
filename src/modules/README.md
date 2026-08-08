# Trusted module contract

Trusted modules are TypeScript files placed in `src/modules/trusted/` and loaded at
build time. They must export a default `TrustedModuleDefinition` whose `id` matches
the `id` of a `trusted` entry in `src/content/modules/*.json`.

Because the upload format is `.ts`, use `React.createElement` instead of JSX. These
files are executable application code and should only be uploaded from a trusted
source.

The matching content entry stores editable instance data:

```json
{
  "id": "custom-note",
  "type": "trusted",
  "group": "custom",
  "title": "Custom Note",
  "order": 80,
  "visible": true,
  "data": { "title": "Editable title", "body": "Editable content" }
}
```
