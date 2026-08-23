import { useState, useSyncExternalStore, type FormEvent } from 'react'
import type { ClientContext, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type {
  AssistantBlock, AssistantMessageNode, ChatConversationViewNode, UserMessageNode,
} from '@deepseek-ai/dsh-client-runtime/client'
import type { WorkbuddyActions } from './index.ts'
import css from './style.module.css'

/** Props for the conversation stream of one session. */
export interface ConversationProps {
  /** The opened session id. */
  id: SessionId
  /** The client root context (for binding lookup and subscriptions). */
  ctx: ClientContext
  /** Imperative session actions (open/new/send). */
  actions: WorkbuddyActions
}

/** Extracts plain text from a finalized chat node (text and reasoning blocks). */
function nodeText(node: ChatConversationViewNode): string {
  switch (node.kind) {
    case 'assistant': {
      const data = node.data as AssistantMessageNode
      return data.blocks
        .map(block => (block.kind === 'text' || block.kind === 'reasoning' ? block.text : ''))
        .join('')
    }
    case 'user':
    case 'steering':
    case 'context':
    case 'tool-result': {
      const data = node.data as UserMessageNode
      return data.content
        .map(block => (block.type === 'text' || block.type === 'reasoning' ? block.text : ''))
        .join('')
    }
    default:
      return ''
  }
}

/** Extracts text from in-progress assistant blocks. */
function partialText(blocks: readonly AssistantBlock[]): string {
  return blocks
    .map(block => (block.kind === 'text' || block.kind === 'reasoning' ? block.text : ''))
    .join('')
}

/** User-/steering-authored message bubble. */
function UserBubble(props: { text: string }): React.JSX.Element {
  return (
    <div className={`${css.turn} ${css.turnUser}`}>
      <div className={`${css.bubble} ${css.bubbleUser}`}>{props.text}</div>
    </div>
  )
}

/** Assistant-authored message bubble (may be empty while streaming). */
function AssistantBubble(props: { text: string }): React.JSX.Element {
  return (
    <div className={`${css.turn} ${css.turnAssistant}`}>
      <div className={`${css.bubble} ${css.bubbleAssistant}`}>{props.text}</div>
    </div>
  )
}

/** Minimal conversation renderer: lists chat nodes plus the streaming partial. */
export function Conversation(props: ConversationProps): React.JSX.Element {
  const { id, ctx, actions } = props
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  // Subscribe to the always-live list feed: it notifies on both current
  // selection changes and session staging, so a binding that materializes
  // after the snapshot is read still drives a re-render. getSnapshot reads the
  // live binding each time, returning undefined until the session is ready.
  const snapshot = useSyncExternalStore(
    cb => ctx.sessions.list.subscribe(cb),
    () => ctx.sessions.binding(id)?.session?.getSnapshot(),
  )

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    const text = draft.trim()
    if (text === '' || sending) return
    setError(null)
    setSending(true)
    try {
      await actions.sendPrompt(id, text)
      setDraft('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setSending(false)
    }
  }

  if (snapshot === undefined) {
    return <div className={css.conversationEmpty}><p>加载会话中…</p></div>
  }

  const chat = snapshot.chat
  const partial = chat.legacy?.partial
  const live = partial === null || partial === undefined ? '' : partialText(partial.blocks)

  const nodes: ChatConversationViewNode[] = chat.order
    .map(key => chat.nodes.get(key))
    .filter((node): node is ChatConversationViewNode => node !== undefined)

  return (
    <div className={css.conversation}>
      <div className={css.stream}>
        {nodes.length === 0 && live === ''
          ? (
            <div className={css.conversationEmpty}>
              <p className={css.conversationEmptyTitle}>会话为空</p>
              <p className={css.conversationEmptyHint}>发送第一条消息以开始对话。</p>
            </div>
          )
          : (
            <>
              {nodes.map((node) => {
                const text = nodeText(node)
                if (node.kind === 'user' || node.kind === 'steering') return <UserBubble key={node.id} text={text} />
                if (node.kind === 'assistant') return <AssistantBubble key={node.id} text={text} />
                // System / context / tool / command nodes: render as a quiet neutral line.
                return <div key={node.id} className={`${css.turn} ${css.turnSystem}`}>{text}</div>
              })}
              {live !== '' && <AssistantBubble text={live} />}
            </>
          )}
      </div>
      {error !== null && <div className={css.promptError}>{error}</div>}
      <form className={css.composer} onSubmit={(event) => { void submit(event) }}>
        <input
          className={css.composerInput}
          value={draft}
          placeholder="输入任务，回车发送…"
          onChange={(event) => { setDraft(event.target.value) }}
          disabled={sending}
        />
        <button className={css.composerSend} type="submit" disabled={sending || draft.trim() === ''}>
          {sending ? '发送中…' : '发送'}
        </button>
      </form>
    </div>
  )
}
