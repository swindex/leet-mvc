# Dependency Audit & Migration Plan — leet-mvc v4.0.40

Generated: 2026-08-31 · Source: `npm audit` + `npm outdated` (no files modified during audit)

## 1. Executive Summary

- **36 vulnerabilities** found: **4 critical**, **19 high**, **10 moderate**, **3 low**.
- **5 direct dependencies are themselves vulnerable**: `swiper`, `expr-eval`, `postcss`, `webpack`, `@babel/core`.
- **1 package has no fix in its current major line**: `expr-eval` (all 1.x versions affected) — requires major upgrade to 2.x.
- **2 fixes require breaking changes** (`npm audit fix --force`): `serialize-javascript` and `uuid`, both resolved by upgrading the very outdated direct dependency `copy-webpack-plugin` (5.1.2 → 14.x).
- Most transitive vulnerabilities are fixed by non-breaking updates of direct dependencies (webpack, webpack-dev-server, html-webpack-plugin, postcss, @babel/core) — see Phase 1.

## 2. Vulnerability Report (npm audit)

### Critical (4)

| Package | Installed | Affected range | Advisory IDs | Direct dep? |
|---|---|---|---|---|
| handlebars | (transitive via html-webpack-plugin) | 4.0.0–4.7.8 | GHSA-3mfm-83xf-c92r, GHSA-2w6w-674q-4c4q, GHSA-2qvq-rjwj-gvw9, GHSA-7rx3-28cr-v5wh, GHSA-442j-39wm-28r2, GHSA-xhpv-hc6g-r9c6, GHSA-9cx6-37pm-9jff, GHSA-xjpj-3mr7-gcpf | No — fixed by html-webpack-plugin 5.6.8 |
| shell-quote | (transitive via webpack-dev-server) | <=1.8.4 | GHSA-w7jw-789q-3m8p, GHSA-395f-4hp3-45gv | No — fixed by webpack-dev-server 5.2.6 |
| swiper | **6.8.4 (direct)** | 6.5.1–12.1.1 | GHSA-hmx5-qpq5-p643 (prototype pollution) | **Yes** — requires major upgrade to ≥12.1.2 (latest 14.2.0) |
| websocket-driver | (transitive via webpack-dev-server) | <=0.7.4 | GHSA-mp7j-qc5w-4988, GHSA-xv26-6w52-cph6 | No — fixed by webpack-dev-server 5.2.6 |

### High (19)

| Package | Installed | Affected range | Advisory IDs | Direct dep? / Resolution |
|---|---|---|---|---|
| @babel/plugin-transform-modules-systemjs | (transitive via @babel/preset-env) | 7.12.0–7.29.0 | GHSA-fv7c-fp4j-7gwp | Fixed by @babel/preset-env 7.29.7 |
| brace-expansion | (transitive via minimatch) | <=1.1.17 | GHSA-f886-m6hf-6m8v, GHSA-3jxr-9vmj-r5cp, GHSA-mh99-v99m-4gvg, GHSA-rgw5-rvv9-x895 | Fixed by minimatch/picomatch updates |
| expr-eval | **1.2.3 (direct)** | * (all versions) | GHSA-8gw3-rxh4-v6jx (prototype pollution), GHSA-jc85-fpwf-qm7x (unrestricted function evaluation) | **No fix in 1.x — upgrade to 2.0.2 (major, code changes needed)** |
| fast-uri | (transitive via ajv) | 3.0.0–3.1.4 | GHSA-v2hh-gcrm-f6hx, GHSA-7p8r-x3mc-p8w7, GHSA-q3j6-qgpj-74h6, GHSA-4c8g-83qw-93j6, GHSA-v39h-62p7-jpjc | Fixed by ajv update |
| flatted | (transitive) | <=3.4.1 | GHSA-25h7-pfq9-p65f, GHSA-rf6f-7fwh-wjgh | `npm audit fix` |
| form-data | (transitive) | 4.0.0–4.0.5 | GHSA-hmw2-7cc7-3qxx (CRLF injection) | `npm audit fix` |
| immutable | (transitive via sass) | 5.0.0-beta.1–5.1.7 | GHSA-wf6x-7x77-mvgw, GHSA-v56q-mh7h-f735, GHSA-xvcm-6775-5m9r | Fixed by sass 1.103.1 |
| js-yaml | (transitive via jest toolchain) | <=3.15.0 \|\| 4.0.0–4.3.0 | GHSA-mh29-5h37-fv8m, GHSA-h67p-54hq-rp68, GHSA-52cp-r559-cp3m, GHSA-5p4m-2wfm-xmqj (CVE-2026-59870) | `npm audit fix` |
| lodash | (transitive) | <=4.17.23 | GHSA-r5fr-rjxr-66jc, GHSA-f23m-r3pf-42rh, GHSA-xxjr-mmjv-4gpg | `npm audit fix` |
| minimatch | (transitive) | <=3.1.3 | GHSA-3ppc-4f35-3m26, GHSA-7r86-cg39-jmmj, GHSA-23c5-xmqv-rm74 | `npm audit fix` |
| nanoid | (transitive via postcss) | <=3.3.17 | GHSA-28wg-ghj8-5hjv, GHSA-2v37-7h3g-55p8 | Fixed by postcss 8.5.26 |
| node-forge | (transitive via webpack-dev-server) | <=1.3.3 | GHSA-554w-wpv2-vw27, GHSA-5gfm-wpxj-wjgq, GHSA-65ch-62r8-g69g, GHSA-2328-f5f3-gj25, GHSA-q67f-28xg-22rw, GHSA-5m6q-g25r-mvwx, GHSA-ppp5-5v6c-4jwp | Fixed by webpack-dev-server 5.2.6 |
| path-to-regexp | (transitive via express) | <0.1.13 | GHSA-37ch-88jc-xwx2 | Fixed by express update via webpack-dev-server |
| picomatch | (transitive, 2 locations) | <=2.3.1 \|\| 4.0.0–4.0.3 | GHSA-3v7f-55p6-f55p, GHSA-c2c7-rcm5-vvqj | `npm audit fix` |
| postcss | **8.4.31 (direct)** | <=8.5.22 | GHSA-qx2v-qp2m-jg93, GHSA-6g55-p6wh-862q, GHSA-fxqj-rqcc-2cmp, GHSA-r28c-9q8g-f849 | **Yes** — non-breaking update to 8.5.26 |
| serialize-javascript | (transitive via copy-webpack-plugin) | <=7.0.2 | GHSA-5c6j-r48x-rmvq (RCE) | Requires copy-webpack-plugin 14.x (breaking) |
| ws | (transitive: jsdom, webpack-dev-server) | 7.0.0–7.5.10 \|\| 8.0.0–8.20.1 | GHSA-58qx-3vcg-4xpx, GHSA-96hv-2xvq-fx4p | `npm audit fix` |

### Moderate (10)

| Package | Affected range | Advisory IDs | Resolution |
|---|---|---|---|
| ajv (3 locations) | <6.14.0 \|\| >=7.0.0-alpha.0 <8.18.0 | GHSA-2g4f-4pwh-qvx6 | `npm audit fix` |
| body-parser (via express) | <=1.20.5 \|\| 2.0.0-beta.1–2.0.2 | GHSA-v422-hmwv-36x6 | Fixed via webpack-dev-server update |
| follow-redirects (via webpack-dev-server) | <=1.15.11 | GHSA-r4q5-vmmm-2653 | Fixed by webpack-dev-server 5.2.6 |
| http-proxy-middleware (via webpack-dev-server) | >=0.16.0 <2.0.10 | GHSA-64mm-vxmg-q3vj | Fixed by webpack-dev-server 5.2.6 |
| launch-editor (via webpack-dev-server) | <=2.14.0 | GHSA-v6wh-96g9-6wx3 | Fixed by webpack-dev-server 5.2.6 |
| qs (via express/body-parser) | <=6.15.1 | GHSA-w7fw-mjwx-w883, GHSA-6rw7-vpxm-498p, GHSA-q8mj-m7cp-5q26 | Fixed via webpack-dev-server update |
| uuid (via sockjs/webpack-log) | <11.1.1 | GHSA-w5hq-g745-h8pq | Requires copy-webpack-plugin 14.x + webpack-dev-server update |

### Low (3)

| Package | Affected range | Advisory IDs | Resolution |
|---|---|---|---|
| @babel/core (**direct**, installed 7.29.0) | <=7.29.0 | GHSA-4x5r-pxfx-6jf8 (arbitrary file read via sourceMappingURL) | Non-breaking update to 7.29.7 |
| @tootallnate/once | <2.0.1 | GHSA-vpq2-c234-7xj6 | `npm audit fix` |
| webpack (**direct**, installed 5.102.1) | 5.49.0–5.104.0 | GHSA-8fgc-7cc6-rx7x, GHSA-38r7-794h-5758 (buildHttp SSRF) | Non-breaking update to 5.110.2 |

## 3. Outdated Dependencies (npm outdated)

| Package | Current | Wanted (in-range) | Latest | Notes |
|---|---|---|---|---|
| @babel/core | 7.29.0 | 7.29.7 | 8.0.1 | Stay on 7.x; 8.x is a major rewrite |
| @babel/preset-env | 7.22.20 | 7.29.7 | 8.0.2 | Stay on 7.x |
| @babel/preset-typescript | 7.23.0 | 7.29.7 | 8.0.1 | Stay on 7.x |
| @types/jest | 29.5.14 | 29.5.14 | 30.0.0 | Follows jest major |
| @types/piwik-tracker | 0.1.30 | 0.1.32 | 0.1.32 | Patch |
| @types/promise.prototype.finally | 2.0.4 | 2.0.6 | 2.0.6 | Patch |
| autoprefixer | 10.4.16 | 10.5.4 | 10.5.4 | Minor |
| babel-loader | 9.1.0 | 9.2.1 | 10.1.1 | Stay on 9.x (10.x requires webpack/babel alignment check) |
| copy-webpack-plugin | **5.1.2** | 5.1.2 | **14.0.0** | Major jump; `files` option renamed to `patterns`; needed to fix serialize-javascript/uuid RCE chain |
| core-js | 3.32.2 | 3.50.0 | 3.50.0 | Minor (polyfills) |
| css-loader | 5.2.7 | 5.2.7 | 7.1.5 | No in-range update; 7.x is a major — defer |
| dayjs | 1.11.18 | 1.11.23 | 1.11.23 | Patch |
| eslint | 9.38.0 | 9.39.5 | 10.9.1 | Stay on 9.x; 10.x is a major — defer |
| expr-eval | **1.2.3** | 1.2.3 | **2.0.2** | Major; API changes in parser/evaluate — code migration required (core/binder/ExpressionCompiler.ts) |
| html-loader | 4.2.0 | 4.2.0 | 5.1.0 | No in-range update; defer |
| html-webpack-plugin | 5.5.3 | 5.6.8 | 5.6.8 | Patch — fixes critical handlebars chain |
| htmlparser2 | **3.10.1** | 3.10.1 | **12.0.0** | Major jump; used by core/binder/TemplateParser.ts — code migration required |
| jest / jest-environment-jsdom | 29.7.0 | 29.7.0 | 30.5.0 | Major — defer (ts-jest compatibility) |
| postcss | **8.4.31** | **8.5.26** | 8.5.26 | In-range; fixes 4 high advisories |
| postcss-loader | 7.3.3 | 7.3.4 | 8.2.1 | Patch in-range; 8.x major — defer |
| sass | 1.97.3 | 1.103.1 | 1.103.1 | Minor — fixes immutable chain |
| sass-loader | 13.3.2 | 13.3.3 | 17.0.1 | Patch in-range; 17.x major — defer |
| style-loader | 3.3.3 | 3.3.4 | 4.0.0 | Patch in-range; 4.x major — defer |
| swiper | **6.8.4** | 6.8.4 | **14.2.0** | Major jump (v7+ changed module imports, CSS paths, API) — code migration required (components/SwiperComponent.ts, components/SwiperForms.ts) |
| ts-jest | 29.4.6 | 29.4.12 | 29.4.12 | Patch |
| ts-loader | 9.4.4 | 9.6.2 | 9.6.2 | Minor |
| typescript | 5.2.2 | 5.9.3 | 7.0.2 | Update to 5.9.3; 7.x (native compiler) — defer |
| webpack | **5.102.1** | **5.110.2** | 5.110.2 | In-range; fixes buildHttp SSRF advisories |
| webpack-bundle-analyzer | 4.10.2 | 4.10.2 | 5.3.2 | No in-range update; defer |
| webpack-cli | 6.0.1 | 6.0.1 | 7.2.3 | No in-range update; defer (verify compatibility if wds 6.x adopted) |
| webpack-dev-server | **5.2.2** | **5.2.6** | 6.0.0 | In-range; fixes shell-quote/websocket-driver/node-forge/express chains |
| webpack-merge | 5.9.0 | 5.10.0 | 6.0.1 | Minor in-range |

## 4. Update / Migration Plan

### Phase 1 — Non-breaking security updates (no code changes expected)

Goal: eliminate the majority of vulnerabilities, including all criticals except `swiper`.

1. Bump direct dependencies within their existing semver ranges in [`package.json`](package.json):
   - `@babel/core` → `^7.29.7`, `@babel/preset-env` → `^7.29.7`, `@babel/preset-typescript` → `^7.29.7`
   - `postcss` → `^8.5.26` (fixes 4 high advisories)
   - `webpack` → `^5.110.2` (fixes buildHttp SSRF)
   - `webpack-dev-server` → `^5.2.6` (fixes shell-quote, websocket-driver, node-forge, follow-redirects, http-proxy-middleware, launch-editor, express/body-parser/qs/path-to-regexp chains)
   - `html-webpack-plugin` → `^5.6.8` (fixes critical handlebars chain)
   - `sass` → `^1.103.1` (fixes immutable chain)
   - Housekeeping: `core-js` → `^3.50.0`, `dayjs` → `^1.11.23`, `autoprefixer` → `^10.5.4`, `babel-loader` → `^9.2.1`, `ts-loader` → `^9.6.2`, `typescript` → `^5.9.3`, `ts-jest` → `^29.4.12`, `eslint` → `^9.39.5`, `webpack-merge` → `^5.10.0`, `postcss-loader` → `^7.3.4`, `style-loader` → `^3.3.4`, `sass-loader` → `^13.3.3`, `@types/piwik-tracker` → `^0.1.32`, `@types/promise.prototype.finally` → `^2.0.6`
2. Run `npm install` to regenerate the lockfile, then `npm audit fix` to sweep remaining transitive patches (ajv, flatted, form-data, js-yaml, lodash, minimatch, picomatch, brace-expansion, ws, @tootallnate/once).
3. **Verify**: `npm audit` (expect only swiper, expr-eval, serialize-javascript/uuid-via-copy-webpack-plugin remaining), full webpack build (`webpack --config webpack.config.js` or the project's build script), and `npx jest` test suite.

### Phase 2 — Major upgrades requiring code migration (one per work item, each with its own verification)

1. **swiper 6.8.4 → 14.x** (critical prototype pollution):
   - Review Swiper v7–v14 breaking changes: ES-module imports (`import Swiper from 'swiper'` + named module imports instead of `Swiper.Component`), CSS import path change (`swiper/swiper.min.css` → `swiper/css`), removed/renamed params.
   - Migrate [`components/SwiperComponent.ts`](components/SwiperComponent.ts) and [`components/SwiperForms.ts`](components/SwiperForms.ts); check any SCSS that imports swiper styles.
   - Verify: build + jest + manual smoke test of SwiperTabs/Swiper pages in `test/`.
2. **expr-eval 1.2.3 → 2.0.2** (high, no fix in 1.x):
   - Review v2 API changes (parser construction, `parse()` return shape, `.evaluate()` signature, function restriction behavior).
   - Migrate [`core/binder/ExpressionCompiler.ts`](core/binder/ExpressionCompiler.ts) and any other importers; run the binder test specs (`spec/tests/TestBindDirectivePage-spec.ts`, `TestDirectivesPage-spec.ts`, etc.).
3. **copy-webpack-plugin 5.1.2 → 14.x** (fixes serialize-javascript RCE + uuid chain):
   - Migrate [`webpack.base.config.js`](webpack.base.config.js) (and any other config using it): `files` option → `patterns`, changed plugin constructor options, webpack 5 alignment.
   - Verify: production build output contains the expected copied assets (img/, fonts).
4. **htmlparser2 3.10.1 → 12.x** (outdated; no open advisory but 9 major versions behind):
   - Migrate [`core/binder/TemplateParser.ts`](core/binder/TemplateParser.ts) and any other importers to the v12 API (`Parser`, `DomHandler`/`DefaultHandler`, `Document`/`Element` node shapes).
   - Verify: full jest suite, especially TemplateParser-spec and directive specs.

### Phase 3 — Deferred / optional (recommend tracking separately, not part of this security pass)

- jest 29 → 30 (+ @types/jest 30, ts-jest compatibility check)
- typescript 5.x → 7.x (native compiler; wait for ecosystem stability)
- webpack-dev-server 5 → 6, webpack-cli 6 → 7 (adopt together)
- babel 7 → 8, eslint 9 → 10, css-loader 5 → 7, html-loader 4 → 5, sass-loader 13 → 17, style-loader 3 → 4, postcss-loader 7 → 8, webpack-bundle-analyzer 4 → 5

### Rollback strategy

Each phase is a separate commit. If verification fails, revert the phase commit; Phase 1 and each Phase 2 item are independent of one another (except copy-webpack-plugin must land before `npm audit fix --force` for serialize-javascript/uuid).

## 5. Expected Outcome After Phases 1+2

- All 4 critical vulnerabilities resolved (handlebars, shell-quote, swiper, websocket-driver).
- All high/moderate/low advisories resolved except any newly introduced by the major upgrades (re-run `npm audit` after each Phase 2 item to confirm zero regressions).
- Target: **0 known vulnerabilities** in `npm audit`.

## 6. Execution Results (completed 2026-08-31)

### What was done

**Phase 1 — non-breaking updates** (all applied, verified):
- Bumped @babel/core, @babel/preset-env, @babel/preset-typescript → ^7.29.7; postcss → ^8.5.26; webpack → ^5.110.2; html-webpack-plugin → ^5.6.8; sass → ^1.103.1; plus housekeeping patches (core-js, dayjs, autoprefixer, babel-loader, ts-loader, typescript 5.9.3, ts-jest, eslint, webpack-merge, postcss-loader, style-loader, sass-loader, @types/*).
- `npm install` + `npm audit fix` swept the remaining transitive patches (ajv, flatted, form-data, js-yaml, lodash, minimatch, picomatch, brace-expansion, ws, etc.).

**Phase 2 — major migrations** (all applied, verified):
1. **swiper 6.8.4 → 14.2.0**: migrated [`components/SwiperComponent.ts`](components/SwiperComponent.ts) (`swiper/bundle` + `swiper/swiper-bundle.css` → `swiper` + `swiper/css`; removed deprecated `iOSEdgeSwipeDetection`; fixed duplicated nested `.swiper-wrapper` in template), [`components/SwiperForms.ts`](components/SwiperForms.ts) (`swiper/dist/css/swiper.css` → `swiper/css`), [`components/SwiperTabs/SwiperTabs.ts`](components/SwiperTabs/SwiperTabs.ts) (`swiper/swiper.scss` → `swiper/css`). Renamed root class `swiper-container` → `swiper` in all templates (v8+ breaking change). [`components/PageComponent.ts`](components/PageComponent.ts) needed no changes (type-only usage).
2. **expr-eval 1.2.3 → 2.0.2**: the only importer is [`core/form_validator.ts`](core/form_validator.ts) (`new Parser()` + `p.evaluate(expr, _data)` in the `math` field action); the v2 API is compatible with this usage — no code changes required.
3. **copy-webpack-plugin 5.1.2 → 14.0.0**: migrated [`webpack.base.config.js`](webpack.base.config.js) from the v5 array constructor to the v6+ `new CopyWebpackPlugin({ patterns: [...] })` API. This eliminated the serialize-javascript RCE and uuid chains.
4. **htmlparser2 3.10.1 → 12.0.0**: [`core/binder/TemplateParser.ts`](core/binder/TemplateParser.ts) needed no code changes — v12's `DomHandler`/`Parser` API and node shapes (`type: 'tag'|'text'|'comment'`, `name`, `attribs`, `children`) are compatible. However, htmlparser2 v12 and its entire dependency tree (entities, domhandler, domutils, domelementtype, dom-serializer) are **ESM-only**, so [`jest.config.js`](jest.config.js) now includes a scoped `babel-jest` transform + `transformIgnorePatterns` whitelist for those 6 packages.
5. **webpack-dev-server 5.2.6 → 6.0.0** (added during final cleanup): required to fully resolve the uuid advisory via sockjs; existing devServer config options are compatible with v6.

### Final verification

- `npx jest`: **18/18 suites, 433/433 tests passed**.
- `npx webpack` (production build): **compiled successfully** (only pre-existing warning about missing `src/static` directory, unrelated to this change).
- `npm audit`: **36 → 1 vulnerability** (was: 4 critical / 19 high / 10 moderate / 3 low; now: 1 high).

### Remaining known issue

| Package | Severity | Advisory IDs | Status |
|---|---|---|---|
| expr-eval 2.0.2 (latest) | high | GHSA-8gw3-rxh4-v6jx, GHSA-jc85-fpwf-qm7x | npm reports **"No fix available"** — the advisories affect all published versions including 2.0.2. Risk is mitigated in practice: the only usage ([`core/form_validator.ts`](core/form_validator.ts) `math` action) evaluates developer-authored rule strings against internal form data, not untrusted user input. Options if this must be closed: (a) wait for an upstream fix and re-run `npm audit`, (b) replace expr-eval with a hand-rolled arithmetic evaluator for the `math` action, or (c) add an npm `overrides`/audit suppression with documented justification. |
