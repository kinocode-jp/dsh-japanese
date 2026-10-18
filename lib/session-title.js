// Japanese session titles (host side).
//
// DSH's built-in title provider (@deepseek-ai/dsh-session-title-first-prompt-llm)
// tells the model to "use the language of the messages". Japanese messages share
// kanji with Chinese, so DeepSeek models sometimes answer with a Simplified
// Chinese title (e.g. 「图像生成功能可用性」 for a Japanese question). This
// provider replaces it: it always asks for a Japanese title and, when the reply
// still contains Simplified-only characters, asks once more.
//
// Adapted from @deepseek-ai/dsh-session-title-first-prompt-llm 0.2.1-rc.2
// (MIT License, Copyright (c) 2026 DeepSeek). Only the instruction text and the
// Simplified-Chinese retry differ; execution goes through the same shared
// module, @deepseek-ai/dsh-session-title-llm.

import { SessionTitleProviderId, normalizeSessionTitle } from '@deepseek-ai/dsh-session-title'
import { executeSessionTitleLlm, resolveSessionTitleLlmConfig } from '@deepseek-ai/dsh-session-title-llm'

export const name = 'session-title-japanese-llm'

// Same execution limits and length targets as dsh-base's session-title-llm row.
const TARGET_CJK_CHARACTERS = 10
const EXECUTION = { maxInputBytes: 4096, maxOutputTokens: 4096, timeoutMs: 60000 }

/** Common Simplified-only characters that never appear in Japanese text. */
const SIMPLIFIED_ONLY = /[图们这个时间开关设备单复记录总进过还让对应说语词义务员团队门页项标确认库为无额费输缓读计统价订阅续启选择请键码钱账户获显隐态则实际询导检测从积优质级发现变换传讯视频书馆网络问题签动]/u

/** Whether a title looks like Simplified Chinese rather than Japanese. */
export function looksSimplifiedChinese(title) {
  return SIMPLIFIED_ONLY.test(title)
}

function systemPrompt(strict) {
  return [
    'Create a concise title for an AI coding-assistant session from the supplied human messages.',
    'Return only the title on one line, **in plain text of natural language**, with no quotes, prefix, explanation, Markdown, XML, or terminal control codes. No code is allowed.',
    'Write the title in natural Japanese (kanji and kana as a Japanese speaker writes them), whatever language the messages use.',
    'Never write Chinese. Use Japanese kanji forms and Japanese wording: for example 画像生成, not 图像生成; 設定, not 设置.',
    ...(strict ? ['Your previous answer was Chinese. Answer again in Japanese only.'] : []),
    `Aim for about ${TARGET_CJK_CHARACTERS} characters.`,
    'If the messages give little to name, still return a short best-effort title, such as 挨拶, instead of explaining.',
  ].join('\n')
}

/** Frame the selected messages as JSON so user text cannot break structural delimiters. */
function frameMessages(messages) {
  return `Generate the session title from this JSON array of human messages:\n${JSON.stringify(messages)}`
}

const selectReasoningEffort = model => model.reasoning?.efforts[0]?.id

/** Asterisk emphasis wrapping a whole line, such as `**Title**`. */
const EMPHASIS_WRAPPER = /^(?<marker>\*{1,3})(?<inner>\S(?:.*\S)?)\k<marker>$/u

function titleFromOutput(text) {
  const line = text.split(/\r?\n/u).map(item => item.trim()).find(item => item.length > 0) ?? ''
  const groups = EMPHASIS_WRAPPER.exec(line)?.groups
  const marker = groups?.marker
  const inner = groups?.inner
  return marker === undefined || inner === undefined || inner.includes(marker) ? line : inner
}

function titleFromResponse(response) {
  if (response.finish.kind === 'tool-calls') throw new Error('session-title-llm: title output must contain text only')
  if (response.finish.kind === 'max-tokens') throw new Error('session-title-llm: title output reached maxOutputTokens')
  if (response.finish.kind !== 'stop') throw new Error(`session-title-llm: unexpected finish ${response.finish.kind}`)
  if (response.blocks.some(block => block.type === 'tool-call')) throw new Error('session-title-llm: title output must contain text only')
  const text = response.blocks.filter(block => block.type === 'text').map(block => block.text).join(' ')
  const title = normalizeSessionTitle(titleFromOutput(text), Number.MAX_SAFE_INTEGER)
  if (title.length === 0) throw new Error('session-title-llm: title model produced no text')
  return title
}

/**
 * Register the Japanese first-prompt title provider.
 * @param ctx - context exposing the session-title and LLM services.
 * @returns nothing; the registration is owned by ctx.
 */
export function registerJapaneseSessionTitle(ctx) {
  const resolved = resolveSessionTitleLlmConfig(EXECUTION)
  const titleProvider = SessionTitleProviderId(name)
  ctx.sessionTitle.register({
    id: titleProvider,
    automatic: 'first-prompt',
    async generate(request) {
      const first = request.messages[0]
      if (first === undefined) throw new Error('first-prompt title provider requires one human message')
      const run = async strict => {
        const response = await executeSessionTitleLlm(ctx, resolved, request, titleProvider, {
          system: systemPrompt(strict),
          input: frameMessages([first]),
          messageSeqs: [first.seq],
          selectReasoningEffort,
        })
        return { title: titleFromResponse(response), model: response.model }
      }
      let result = await run(false)
      if (looksSimplifiedChinese(result.title)) result = await run(true)
      return { title: result.title, messageSeqs: [first.seq], model: result.model }
    },
  })
}
