import Anthropic from '@anthropic-ai/sdk'
import type { AIResponse, AIToolCall } from '@/types/ai'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true // Client-side for Day 1
})

export async function sendMessage(
  message: string,
  tools: any[],
  systemPrompt: string
): Promise<AIResponse> {
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514', // Claude 3.7 Sonnet (latest and most capable)
      max_tokens: 8192, // Increased for more complex responses
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
      tools
    })

    // Extract tool calls
    const toolCalls: AIToolCall[] = response.content
      .filter((block) => block.type === 'tool_use')
      .map((block: any) => ({
        name: block.name,
        input: block.input
      }))

    return {
      content: response.content.find((b) => b.type === 'text')?.text || '',
      tool_calls: toolCalls.length > 0 ? toolCalls : undefined
    }
  } catch (error) {
    console.error('Claude API error:', error)
    return {
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
