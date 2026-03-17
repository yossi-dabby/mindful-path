# Lucide inventory reports

This folder stores imports-only inventory reports for `lucide-react` across `src/**/*.{js,jsx,ts,tsx}`.

## Files

### `lucide-icons.json`
A sorted, de-duplicated list of the **local** icon identifiers used in imports.

- `import { X } from "lucide-react"` → `X`
- `import { Calendar as CalendarIcon } from "lucide-react"` → `CalendarIcon`

### `lucide-icons-by-file.json`
A map of `relativeFilePath -> [{ imported, local }]` showing each `lucide-react` named import found per file.

This report is **imports-only**. It does **not** count JSX usage or runtime usage.

## Regenerate

### GitHub Actions
Run the **Lucide Icon Inventory** workflow manually from GitHub Actions.

### Local command
```bash
npm run inventory:lucide
``