/**
 * File-log implementation of `ctx.notify`: appends each notification to a
 * configured log file.
 * @module @deepseek-ai/dsh-notify-provider-file
 */

import { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { appendFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { NotifyService } from '@deepseek-ai/dsh-notify'
import type { NotifyMessage } from '@deepseek-ai/dsh-notify'

/** Configuration for the file notification backend. */
export interface Config {
  /** Absolute path of the log file notifications are appended to. */
  logPath: string
}

/** File-log notification provider. */
export class FileNotifyProvider extends NotifyService {
  static Config: z<Config> = z.object({
    logPath: z.string().default('/tmp/notify.log'),
  })

  readonly logPath: string

  constructor(ctx: Context, config: Config) {
    super(ctx)
    this.logPath = resolve(config.logPath)
  }

  async send(message: NotifyMessage): Promise<void> {
    const level = message.level ?? 'info'
    const timestamp = new Date().toISOString()
    const line = `[${timestamp}] [${level.toUpperCase()}] ${message.title} | ${message.body}${message.meta ? ' | ' + JSON.stringify(message.meta) : ''}\n`
    await appendFile(this.logPath, line, 'utf-8')
  }
}

export default FileNotifyProvider
