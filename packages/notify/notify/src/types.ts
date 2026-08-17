/**
 * Notification capability seam — vocabulary types.
 * @module @deepseek-ai/dsh-notify
 */

/** Notification severity level. */
export type NotifyLevel = 'info' | 'warn' | 'error'

/** A notification message. */
export interface NotifyMessage {
  /** Notification title. */
  title: string
  /** Notification body. */
  body: string
  /** Severity level, defaults to `info`. */
  level?: NotifyLevel
  /** Optional structured metadata. */
  meta?: Record<string, string>
}
