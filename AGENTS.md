# Nostro project rules

## Current scope

The user authorised GitHub Pages publishing to `aonsyed/nostro-demo` on 12 September 2026. This supersedes the earlier local-only restriction for that destination. GPT Sites remains prohibited. The initial repository must contain exactly one commit named `Initial commit`; inspect history before the first push.

## Product

- This is a fictional static demo. Use JSON and browser state, never real Nostro APIs, account values or credentials. Preserve the signed-in original account unchanged.
- Keep full monochrome light/dark themes. Desktop navigation is Home, Transactions, Cards, Accounts, Settings; mobile retains centre Home. Cards are assumed launched and share the account ledger.
- Keep the demo explanation in the footer, without source-attribution banners or repeated demo notes. Identifiers remain invalid and documents retain a fictional-data footer. Do not invent banking guarantees.
- Use HashRouter and base-aware assets/checkout links. Test a repository subpath and direct-route refreshes.
- PDFMake and bundled fonts generate exports in the browser. Do not reintroduce an export server. Inspect rendered PDFs, including empty and multipage records, and distinguish generation from a verified saved download.

## Verification and files

Run relevant tests and drive real UI behaviour before claiming it works. Check the deployed URL after publishing. Root-width checks are not exhaustive responsive or animation coverage. Keep noindex metadata.

Historical local audits and previous task notes are excluded from Git; consult them only if present and relevant. Use ordinary file tools and apply_patch, not Python for routine file work. Do not include private audit notes or transient verification files in commits.
