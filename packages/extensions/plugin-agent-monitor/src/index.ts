/**
 * Agent behavior monitor plugin: listens to agent runtime events and logs them.
 * Subscribes to lifecycle, status, step interception, errors, and tool results.
 * @module @deepseek-ai/plugin-agent-monitor
 */

import { Context } from '@deepseek-ai/cordis'
// Side-effect imports: trigger module augmentation so agent/* and tools/* event
// names resolve as keyof Events.
import '@deepseek-ai/dsh-agent'
import '@deepseek-ai/dsh-tools'

export const name = 'plugin-agent-monitor'
export const inject: string[] = []

export function apply(ctx: Context): void {
  ctx.on('agent/created', (payload) => {
    console.log(`[agent-monitor] Agent 创建：${payload.agent.id}`)
  })

  ctx.on('agent/status', (payload) => {
    console.log(`[agent-monitor] Agent ${payload.agent.id} 状态：${payload.status}`)
  })

  ctx.on('agent/disposed', (payload) => {
    console.log(`[agent-monitor] Agent 回收：${payload.agent.id}`)
  })

  ctx.on('agent/pre-step', async (payload, next) => {
    const { messages, turn, step } = payload
    console.log(`[agent-monitor] 步骤 ${turn}.${step} 开始，消息数：${messages.length}`)
    const start = Date.now()
    const decision = await next()
    const elapsed = Date.now() - start
    console.log(`[agent-monitor] 步骤 ${turn}.${step} 完成，耗时：${elapsed}ms`)
    return decision
  })

  ctx.on('agent/error', (payload) => {
    console.warn(`[agent-monitor] Agent ${payload.agent.id} 在轮次 ${payload.turn}.${payload.step} 出错：${payload.error}`)
  })

  ctx.on('tools/result', (exec, _result) => {
    console.log(`[agent-monitor] 工具调用完成：${exec.name}`)
  })
}
