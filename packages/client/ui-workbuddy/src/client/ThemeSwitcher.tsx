import clsx from 'clsx'
import css from './style.module.css'

/** The three selectable theme modes, in display order. */
const MODES = [
  { id: 'light', label: '浅色', icon: '☀' },
  { id: 'dark', label: '深色', icon: '☾' },
  { id: 'system', label: '跟随系统', icon: '⚙' },
] as const

/**
 * Compact segmented control that switches between light, dark, and system theme
 * modes through the `theme` service.
 * @param preference - the active theme preference id.
 * @param set - callback that applies a new theme id.
 */
export function ThemeSwitcher(props: { preference: string; set: (id: string) => void }): JSX.Element {
  return (
    <div className={css.switcher} role="group" aria-label="主题切换">
      {MODES.map(mode => (
        <button
          key={mode.id}
          type="button"
          className={clsx(css.switchBtn, props.preference === mode.id && css.switchBtnActive)}
          aria-pressed={props.preference === mode.id}
          title={mode.label}
          onClick={() => props.set(mode.id)}
        >
          <span aria-hidden>{mode.icon}</span>
        </button>
      ))}
    </div>
  )
}
