import type { ClientContext, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type { PromptContentPart } from '@deepseek-ai/dsh-api-remotes/client'
import { WorkbuddyRoot } from './WorkbuddyRoot.tsx'
import { ThemePresenter } from './theme-presenter.ts'

/** Required client services, injected by the loader as a fiber. */
export const inject = ['slots', 'theme', 'sessions', 'workspaces']

/** Imperative actions the shell performs against the harness session domain. */
export interface WorkbuddyActions {
  /** Open an existing session by id. */
  openSession(id: SessionId): void
  /** Create or reuse a blank session on the resolved workspace and open it. */
  newSession(): void
  /**
   * Send one text prompt into the given session as a queued turn.
   * @param id - target session id.
   * @param text - prompt text.
   * @returns the host's acceptance, or a rejection carrying the business error.
   */
  sendPrompt(id: SessionId, text: string): Promise<void>
}

/**
 * Client plugin body: register the WorkBuddy full-page shell into the single
 * `root` slot, and own the theme DOM presenter (the default ui-layout
 * previously did). The shell renders the side session list, the conversation
 * stream, and a light/dark/system theme switcher, all from harness session
 * data via the sessions service and the `theme` service.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  // Theme presentation: pure DOM writes from resolved snapshots — initial
  // state through the getter once, then event-driven only; no React path.
  ctx.effect(() => {
    const presenter = new ThemePresenter()
    presenter.apply(ctx.theme.getTheme())
    const off = ctx.on('theme/change', (snapshot) => { presenter.apply(snapshot) })
    return () => {
      off()
      presenter.dispose()
    }
  }, 'ui-workbuddy: theme presenter')

  const actions: WorkbuddyActions = {
    openSession: (id) => { ctx.sessions.open(id) },
    newSession: () => {
      // Open a blank session: prefer the recent Workspace, then the first known
      // Workspace. The shell has no workspace picker, so it targets an explicit
      // Workspace instead of relying on the implicit current/recent fallback
      // (which is empty until a Session is open).
      const list = ctx.workspaces.list.getSnapshot()
      const target = list.recentWorkspaceId ?? list.items[0]?.workspaceId
      if (target === undefined) return
      ctx.workspaces.startSession(target)
    },
    sendPrompt: async (id, text) => {
      const binding = ctx.sessions.binding(id)
      if (binding === undefined) throw new Error(`workbuddy: no binding for session ${id}`)
      const content: PromptContentPart[] = [{ type: 'text', text }]
      const result = await binding.session.prompt(content, 'queue')
      if (!result.ok) throw new Error(`workbuddy: prompt rejected: ${result.error.code}: ${result.error.message}`)
    },
  }

  ctx.effect(() => {
    const dispose = ctx.slots.register({
      name: 'root',
      priority: -1,
      inject: () => ({ ctx, actions }),
    }, WorkbuddyRoot)
    return dispose
  }, 'ui-workbuddy: root registration')
}
