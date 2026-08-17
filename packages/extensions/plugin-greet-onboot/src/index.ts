import type { Context } from '@deepseek-ai/cordis'

export const name = 'plugin-greet-onboot'
export const inject: string[] = []

export function apply(_ctx: Context): void {
  console.log('👋 Hello! DSH has started successfully.')
}
