import type { SessionListState, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import clsx from 'clsx'
import css from './style.module.css'

/** Props for the side session list. */
export interface SessionListProps {
  /** The current session-list snapshot from `useSessions`. */
  sessions: SessionListState
  /** The selected session id, if any. */
  current: SessionId | undefined
  /** Called when a session row is clicked. */
  onSelect: (id: SessionId) => void
  /** Called when the new-session button is clicked. */
  onNew: () => void
}

/** Renders the durable session list plus a new-session entry. */
export function SessionList(props: SessionListProps): React.JSX.Element {
  const { sessions, current, onSelect, onNew } = props
  return (
    <div className={css.sessions}>
      <button className={css.newSession} type="button" onClick={() => { onNew() }}>
        + 新建会话
      </button>
      <ul className={css.list}>
        {sessions.ids.map((id) => {
          const summary = sessions.byId[id]
          return (
            <li
              key={id}
              className={clsx(css.item, id === current && css.itemActive)}
              onClick={() => { onSelect(id) }}
            >
              <span className={css.itemTitle}>{summary?.title ?? id}</span>
              {summary?.cwd !== undefined && <span className={css.itemCwd}>{summary.cwd}</span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
