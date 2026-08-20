/**
 * Notification Service Definition for the DeepSeek Harness. Providers implement
 * {@link NotifyService.send}; consumers (tools, agent loop, UI) depend only on
 * this contract and never on a concrete provider.
 * @module @deepseek-ai/dsh-notify
 */

import { Context, Service } from '@deepseek-ai/cordis'
import type { Scoped } from '@deepseek-ai/dsh-scope'
import type { NotifyMessage } from './types.ts'

export type { NotifyLevel, NotifyMessage } from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    notify: NotifyService
  }
  interface Events {
    // 通知发送后触发
    'notify/sent'(this: Scoped<NotifyService>, message: NotifyMessage): void
    // 通知发送失败时触发，waterfall 允许监听器决定是否重试
    'notify/error'(this: Scoped<NotifyService>, message: NotifyMessage, error: Error, next: () => boolean): boolean
  }
}

/**
 * Abstract notification service. Every provider extends this class and
 * implements {@link send}; consumers resolve `ctx.notify` and stay agnostic
 * to the active provider.
 */
export abstract class NotifyService extends Service {
  constructor(ctx: Context) {
    super(ctx, 'notify')
  }

  /**
   * Deliver a notification through the active provider.
   * @param message - the notification to deliver.
   */
  abstract send(message: NotifyMessage): Promise<void>
}
