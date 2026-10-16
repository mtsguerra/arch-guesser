# Security checklist (56 items)

Checked on 2026-10-17 against the three lists the author shared (18 checks for an AI-built app, 20 things to do before launch, and part 2 with items 19 to 36). Each item is marked **OK** (done and verified), **N/A** (the app has no such feature) or **MANUAL** (cannot be checked from the repo; needs the Vercel dashboard).

## What the app is, so the N/A items make sense

- **Production** is a static site on Vercel: HTML, JS, CSS and prebuilt JSON (`frontend/public/api/*`). No server code runs, no database, no accounts, no cookies, no forms that send data, no uploads, no payments, no outbound requests.
- **The Spring Boot API** is read-only and used for development only (`GET /api/buildings/*`, `/api/eras`). It has no database and no secrets.
- **Browser storage** holds only game preferences (theme, sound, custom setup, today's daily result, a session's building ids).
- **The answers are in the page's data by design** (an educational game with no scores, stakes or accounts), so "client-only security" is not something the game relies on.

## Results

### List 1: 18 security checks

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Exposed DB credentials | N/A | No database. No credentials anywhere (item 3 scan). |
| 2 | Public .env files | OK | No `.env` file is or ever was committed (all 106 revisions scanned by name). `.gitignore` now ignores `.env`, `.env.*`, keys, `*.db`, `*.log`; a test fails if that rule disappears or a risky file is tracked. `dist/` contains no dotfiles. |
| 3 | Hardcoded secrets | OK | Pattern scan (AWS, GitHub, OpenAI-style, Google, private keys, JWTs, `key=`/`secret=`/`password=` literals, connection strings) over the working tree and every revision: no matches. There is nothing in the app that needs a secret. |
| 4 | Weak auth | N/A | No login. |
| 5 | Missing authorization check | N/A | All data is public. Write methods (POST/PUT/DELETE) are refused with 405 on every endpoint (test `theApiIsReadOnly`). |
| 6 | Cross-user access | N/A | No users; state lives in each browser. |
| 7 | Open DB permissions | N/A | No database. |
| 8 | Cloud service misconfiguration | MANUAL | Headers and build are in `vercel.json` (tested). Project settings are not visible from the repo: see "Do in the Vercel dashboard". |
| 9 | Unprotected admin route | OK | There is no admin route. `/actuator/*` is 404, no Spring Boot Actuator or DevTools dependency, and a test asserts no management endpoint is exposed. |
| 10 | Exposed prod debug tools | OK | The Vite dev server is not deployed; no `console.*` or `debugger` in the source; no source maps in `dist/` (item 36). |
| 11 | Logs leak secrets | OK | No secrets exist to leak; the app logs no request bodies; `*.log` is git-ignored; the frontend does not log. |
| 12 | Verbose prod errors | OK | `server.error.include-{stacktrace,exception,message,binding-errors}` are locked to "never" and the whitelabel page is off (test `SecurityConfigTest`). Probed on a live server: 404/405 answer with a short problem+json, an encoded `../` or NUL byte gets Tomcat's bare 400 page with no version, `/error` answers without detail. The UI shows a fixed message, never `error.message`. |
| 13 | Secrets in git | OK | Same scan as item 3, over all history. |
| 14 | Secrets in JS | OK | The built bundle was scanned: the only "password:" hit is React's table of input types. |
| 15 | Client-only security | OK (by design) | The game's answers ship with the data, so nothing in the game depends on the client being honest. What does matter (headers, link and data validation, deploy config) is enforced at build or deploy time and tested. Accepted: a player can read the daily's answer. |
| 16 | Input validation | OK | The inputs are the URL hash (an allow-list in `routeFrom`), stored values (rebuilt from known-good parts on every read: config, session, daily result), typed guesses (compared, never rendered as HTML) and the API's `exclude`, `lang` and id (tests; the request-header limit gives 400 for huge values). |
| 17 | SQL injection | N/A | No SQL. |
| 18 | NoSQL injection | N/A | No database. |

### List 2: 20 things to do before launching

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | Hide API keys | N/A | The app uses none (Wikimedia images are public). |
| 2 | Purge Git secrets | OK | Nothing to purge (items 3 and 13). If one is ever found: rotate it first, then rewrite history. |
| 3 | Use public DB key | N/A | No database. |
| 4 | Row-level security | N/A | No database. |
| 5 | Encrypt sensitive data | OK | No sensitive data is stored. In transit: HTTPS is forced (item 19). |
| 6 | Server-side auth | N/A | No accounts. |
| 7 | Lock record access | N/A | No records per user. |
| 8 | Block field tampering | OK | Nothing is written to a server. Tampered browser storage is validated on read (tests, and the break-protections script proves the tests can fail). |
| 9 | Secure session cookies | OK | The app sets no cookie (checked on a live response; test asserts no `Set-Cookie`). |
| 10 | Hash passwords | N/A | No passwords. |
| 11 | Rate limit login | N/A | No login. |
| 12 | Bot protection | MANUAL | Optional: Vercel Firewall / Bot Protection in the dashboard. Static files are served by Vercel's CDN. |
| 13 | Parameterize queries | N/A | No queries. |
| 14 | Validate all input | OK | See item 16 of list 1. |
| 15 | Escape user content | OK | React escapes all text; no `dangerouslySetInnerHTML`, `innerHTML`, `eval`; every link that comes from data is `https://` on Wikipedia or Wikimedia (Java validator, a test over the pt-BR overlay, and a guard in the static build that stops the deploy). |
| 16 | Restrict file uploads | N/A | No uploads. |
| 17 | Trim API responses | OK | Responses carry only game data; no internal fields, timestamps or ids beyond building ids. The whole building is needed by a round. |
| 18 | Security headers | OK | `vercel.json`: Content-Security-Policy (self-only scripts, images only from Wikimedia, `connect-src 'self'`, no objects, no framing, `upgrade-insecure-requests`), `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` (camera, microphone, geolocation, payment, usb, topics off), `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`. All asserted in `deploy.test.js`. |
| 19 | Force HTTPS | OK | Vercel redirects http to https; HSTS (2 years) and `upgrade-insecure-requests` added; no `http://` literal in the code or data. |
| 20 | Scan dependencies | OK | `npm audit`: 0 vulnerabilities (production and dev); `npm update` applied (React 19.3.1 and others). The Gradle wrapper download is now pinned to its SHA-256. Java: see "Dependency scan" below (3 packages had advisories; fixed). |

### List 3: part 2, items 19 to 36

| # | Item | Result | Evidence |
|---|---|---|---|
| 19 | XSS | OK | See list 2, item 15; plus the CSP's `script-src 'self'` (no inline scripts, no `eval`). |
| 20 | CSRF | N/A | No cookies, no sessions and no state-changing endpoint (405 tests). |
| 21 | Insecure file uploads | N/A | No uploads. |
| 22 | Path traversal | OK | Probed live: `..%2f..%2fetc%2fpasswd` and NUL bytes are refused (400). The backend looks buildings up by id in a map and serves no file by user path; the frontend only fetches ids that match `^[a-z0-9-]+$`. |
| 23 | SSRF | N/A | The backend makes no outbound request (no HTTP client in the code); the page may only connect to itself (`connect-src 'self'`). |
| 24 | Broken password reset | N/A | No passwords. |
| 25 | Weak session management | N/A | No sessions. |
| 26 | JWT secrets | N/A | No JWTs. |
| 27 | Permissive CORS | OK | No CORS configuration; a request with a foreign `Origin` gets no `Access-Control-*` header; static files send `Cross-Origin-Resource-Policy: same-origin`. |
| 28 | Rate limits | MANUAL | None in the app (nothing writes or costs per request). Production traffic goes through Vercel's CDN; add a rule in Vercel Firewall if abuse ever shows. |
| 29 | Exposed environments | MANUAL | Vercel preview deployments (every branch and pull request) have public URLs unless Deployment Protection is on: see below. |
| 30 | Default credentials | N/A | No credentials of any kind. |
| 31 | Unsigned webhooks | N/A | No webhooks. |
| 32 | Frontend payment checks | N/A | No payments. |
| 33 | IDOR / BOLA | N/A | All data is public and identical for everyone; ids are public. |
| 34 | APIs + user input | OK | Same as list 1, item 16; the unknown-language and traversal cases are tests. |
| 35 | Exposed logs | OK | No endpoint serves logs; `*.log` is git-ignored. Vercel's build and runtime logs are private to the project. |
| 36 | Exposed source maps | OK | The production build emits none (no `.map` files, no `sourceMappingURL`). |

## Dependency scan

- **npm** (`npm audit`, production and dev): 0 vulnerabilities, after `npm update`.
- **Java** (all 39 packages on the runtime classpath, checked against the public OSV database by exact version): 3 packages had advisories with Spring Boot 4.1.1's managed versions.
  - `tomcat-embed-core 11.0.24`: three critical advisories about DIGEST and FORM authentication and access control (GHSA-9xv2-5v5q-p794, GHSA-gcx9-497g-6cp6, GHSA-h3x4-894j-xpx5). This app uses no Tomcat authentication, so the real risk was low. Fixed in 11.0.25.
  - `jackson-core 3.1.5` and `jackson-databind 3.1.5`: seven high or moderate advisories, mostly denial of service when parsing untrusted JSON (for example GHSA-7hhh-6rmp-j9qf, GHSA-cxp5-3px4-pw24, GHSA-wv8q-qhhj-9h54). The backend only reads its own data files at startup, so the real risk was low. Fixed in 3.1.7.
  - **Fix:** `build.gradle` overrides the two managed versions (`tomcat.version` 11.0.25, `jackson-bom.version` 3.1.7); tests pass, and a second OSV check shows 0 advisories. No newer Spring Boot existed yet; when one ships with these versions, delete the two override lines (the comment in `build.gradle` says so).
- The OWASP `dependency-check` tool was tried first; without an NVD API key its database download was too slow, so OSV was used instead. Re-run OSV (or dependency-check with a key) after any dependency change.

## What changed in the code for this checklist

- `vercel.json`: HSTS, `X-Frame-Options`, COOP, CORP, `upgrade-insecure-requests`, wider Permissions-Policy.
- `application.properties`: errors never carry internals; `SecurityConfigTest` and two controller tests (read-only API, no leaks, no cookie, odd `lang`).
- `.gitignore`: secrets, keys, databases and logs; Gradle wrapper pinned to a checksum.
- Static build (`build-static-api.mjs`): refuses to build if any shipped link (English or pt-BR) is not an https Wikipedia article or Commons file page; the Java side has a matching test over the pt-BR overlay.
- `deploy.test.js`: asserts every header above, the wrapper checksum, the ignore rules and that no secret-looking file is tracked.
- `break-protections.mjs`: now breaks 16 protections on purpose (CSP x4, HSTS, framing, http upgrade, COOP, wrapper checksum, ignore rules, stored-data checks x3, error stack traces, error messages); every line says CAUGHT.
- Dependencies: `npm update` (patch and minor within the declared ranges) and the Tomcat and Jackson overrides above.

## Do in the Vercel dashboard (cannot be done from the repo)

1. **Preview protection.** Project Settings, Deployment Protection: keep it on for preview deployments (the `overnight` branch and any pull request get a public URL otherwise).
2. **Environment variables.** Review the list: the build injects `NPM_CONFIG_CACHE_DIR` (the repo now ignores that one variable). Remove anything you do not recognise.
3. **Firewall and bot protection (optional).** Turn on Bot Protection or add a rate-limit rule if you see abuse.
4. **The "2 Recommendations"** shown under Deployment Settings in the deploy page: read them; they are Vercel's own suggestions and are not visible from here.

## Accepted risks and limits of this review

- The daily answer and every building's answer can be read from the shipped JSON. That is how the game works.
- Not tested: a real browser (headers were checked in the config, not on the live site). After deploying, run `curl -I https://<your-domain>` and look for the headers above.
- The static `dist/` was scanned with patterns, not a dedicated secret scanner (none is installed here).
