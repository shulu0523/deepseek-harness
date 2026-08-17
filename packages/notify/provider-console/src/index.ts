/**
 * Console implementation of `ctx.notify`: prints each notification to stdout.
 * @module @deepseek-ai/dsh-notify-provider-console
 */

import { NotifyService } from '@deepseek-ai/dsh-notify'
import type { NotifyMessage } from '@deepseek-ai/dsh-notify'

/** Console notification provider. */
export class ConsoleNotifyProvider extends NotifyService {
  async send(message: NotifyMessage): Promise<void> {
    const level = message.level ?? 'info'
    const prefix = `[${level.toUpperCase()}]`
    console.log(`${prefix} ${message.title}`)
    console.log(`  ${message.body}`)
    if (message.meta) {
      console.log(`  meta: ${JSON.stringify(message.meta)}`)
    }
  }
}

export default ConsoleNotifyProvider
