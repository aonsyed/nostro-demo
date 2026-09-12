# Nostro product demo

A static, fictional banking experience and marketing website built with React and Vite. Includes monochrome light/dark themes, responsive navigation, animated product stories, USD account flows, transfers, card transactions, payment links and support cases.

## Run locally

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173/#/bank. All account data is fictional JSON and browser storage. No Nostro API, authentication service or money movement is used. Each visitor has independent data; Settings → Reset workspace restores the initial fixtures.

## GitHub Pages

The GitHub Actions workflow builds and publishes `dist` to Pages. Repository: `aonsyed/nostro-demo`. Hash routes allow direct links and refreshes without server rewrites. Assets use Vite's base path; the workflow sets `VITE_BASE_PATH=/nostro-demo/`.

```sh
VITE_BASE_PATH=/nostro-demo/ npm run check
VITE_BASE_PATH=/nostro-demo/ npm run preview
```

Noindex metadata remains in the HTML. The website is public; noindex is not access control. No GPT Sites deployment exists.

## Documents

PDFMake renders statements and receipts entirely in the browser with bundled fonts, tables, repeated headers and numbered footers. Statements use period opening and closing balances and posted entries. Card receipts preserve merchant, last four digits, status and net posted amount. CSV uses the same ledger. No export endpoint or server is required.

Downloads use standard browser blob links. Some embedded webviews, including the Codex browser used during development, may not save blob downloads; use a regular browser if the embedded viewer does not save the file. Document generation is tested separately from browser download delivery.

## Checks

`npm run check` runs tests, TypeScript and the production build. `PDF_FIXTURES=1 npm test -- src/lib/pdf-render.test.ts` writes sample documents under ignored `tmp/pdfs/` for visual review. Historical account audit material is excluded from source control.

PDF layout library: https://pdfmake.github.io/docs/0.3/
