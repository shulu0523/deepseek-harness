/**
 * @deepseek-ai/dsh-web-workbuddy — the WorkBuddy-style browser-surface bundle.
 *
 * This package is a profile bundle: its value is the `cordis.patch.yml` layer
 * (declared through the `dsh.bundle.patch` manifest field) that boots the
 * WorkBuddy full-page client UI instead of the default AppFrame layout. The
 * Web server, dist serving, and URL line are still owned by `@deepseek-ai/dsh-web-app`
 * (its rows are forwarded in this bundle's patch), so this entry only carries
 * the stable plugin name and a no-op host body.
 * @module @deepseek-ai/dsh-web-workbuddy
 */

/** Stable Cordis plugin name. */
export const name = 'web-workbuddy'

/** No host-side behavior; the bundle's patch layer owns the profile shape. */
export function apply(): void {}
