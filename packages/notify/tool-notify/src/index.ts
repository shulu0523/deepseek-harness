/**
 * Model-facing `notify` tool: the consumer of the notification seam. It
 * resolves `ctx.notify` and stays agnostic to which provider (console, file,
 * remote) is mounted.
 * @module @deepseek-ai/dsh-tool-notify
 */

import { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { NotifyLevel } from '@deepseek-ai/dsh-notify'

export const name = 'tool-notify'
export const inject = ['tools', 'notify']

export function apply(ctx: Context): void {
  ctx.tools.register(defineTool({
    name: 'notify',
    description: 'Send a notification to the user. Use for task completion reminders, error alerts, or approval requests.',
    parameters: {
      title: { type: 'string', required: true, description: 'Notification title.' },
      body: { type: 'string', required: true, description: 'Notification body.' },
      level: { type: 'string', enum: ['info', 'warn', 'error'], description: 'Severity level, defaults to info.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          content: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: value.content }],
    },
    async execute(args, _exec) {
      await ctx.notify.send({
        title: args.title,
        body: args.body,
        ...(args.level ? { level: args.level as NotifyLevel } : {}),
      })
      return { content: `通知已发送：${args.title}` }
    },
  }))
}
