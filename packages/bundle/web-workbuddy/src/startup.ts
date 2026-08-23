/**
 * @deepseek-ai/dsh-web-workbuddy — surface bundle startup.
 *
 * The WorkBuddy web surface reuses the standard web runtime owned by
 * `@deepseek-ai/dsh-web-app` (its `web-runtime` row is forwarded in this
 * bundle's patch and loads `@deepseek-ai/dsh-web-app/startup`). This entry
 * therefore carries no extra host bootstrap; the web server, dist serving, and
 * URL line are assembled by that shared runtime. The file exists so the bundle
 * satisfies the surface-bundle startup contract.
 * @module @deepseek-ai/dsh-web-workbuddy/startup
 */

/** Stable Cordis plugin name for the bundle startup. */
export const name = 'web-workbuddy'

/** No host bootstrap beyond the forwarded standard web runtime. */
export function apply(): void {}
