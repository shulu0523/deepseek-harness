import { useSyncExternalStore } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { SessionListState } from '@deepseek-ai/dsh-client-runtime/client'
import { ThemeSwitcher } from './ThemeSwitcher.tsx'
import type { WorkbuddyActions } from './index.ts'
import { SessionList } from './SessionList.tsx'
import { Conversation } from './Conversation.tsx'
import css from './style.module.css'

/**
 * Top-level WorkBuddy shell. Renders the side session list, the conversation
 * stream, and a theme switcher. Session data comes from the sessions service
 * list feed; imperative actions (open/new session, send prompt) come from the
 * injected `actions` closure.
 */
export function WorkbuddyRoot(props: {
  ctx: ClientContext
  actions: WorkbuddyActions
}): React.JSX.Element {
  const { ctx, actions } = props
  const list = useSyncExternalStore(
    cb => ctx.sessions.list.subscribe(cb),
    () => ctx.sessions.list.getSnapshot(),
  ) as SessionListState
  const themeSnap = useSyncExternalStore(
    cb => ctx.on('theme/change', cb),
    () => ctx.theme.getTheme(),
  )
  const { current } = list
  return (
    <div className={css.root}>
      <aside className={css.sidebar}>
        <div className={css.brand}>
          <span className={css.brandMark}>◆</span>
          <span className={css.brandName}>WorkBuddy</span>
          <ThemeSwitcher preference={themeSnap.preference} set={(id) => { ctx.theme.setTheme(id) }} />
        </div>
        <SessionList
          sessions={list}
          current={current}
          onSelect={actions.openSession}
          onNew={actions.newSession}
        />
      </aside>
      <main className={css.main}>
        {current === undefined
          ? (
            <div className={css.conversationEmpty}>
              <p className={css.conversationEmptyTitle}>会话为空</p>
              <p className={css.conversationEmptyHint}>选择一个会话或新建会话。</p>
            </div>
          )
          : <Conversation id={current} ctx={ctx} actions={actions} />}
      </main>
    </div>
  )
}
