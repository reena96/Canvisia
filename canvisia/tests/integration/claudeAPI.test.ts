import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendMessage } from '@/services/ai/client'
import { AI_TOOLS, SYSTEM_PROMPT } from '@/services/ai/tools'

// Create mock functions that can be reconfigured
let mockCreate = vi.fn()

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: (...args: any[]) => mockCreate(...args)
      }
    }))
  }
})

describe('Claude API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should send message and receive response', async () => {
    mockCreate.mockResolvedValue({
      id: 'msg_test',
      type: 'message',
      role: 'assistant',
      content: [{ type: 'text', text: 'Hello! How can I help you?' }],
      model: 'claude-3-5-sonnet-20241022',
      stop_reason: 'end_turn',
      usage: { input_tokens: 10, output_tokens: 20 }
    })

    const response = await sendMessage(
      'Hello',
      [],
      SYSTEM_PROMPT
    )
    expect(response).toBeDefined()
    expect(response.content).toBeTruthy()
  }, 10000)

  it('should handle function calling', async () => {
    mockCreate.mockResolvedValue({
      id: 'msg_test',
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'tool_use',
          id: 'tool_test',
          name: 'create_shape',
          input: { type: 'circle', x: 100, y: 200, fill: 'blue' }
        }
      ],
      model: 'claude-3-5-sonnet-20241022',
      stop_reason: 'tool_use',
      usage: { input_tokens: 10, output_tokens: 20 }
    })

    const response = await sendMessage(
      'Create a blue circle at 100, 200',
      AI_TOOLS,
      SYSTEM_PROMPT
    )
    expect(response.tool_calls).toBeDefined()
    expect(response.tool_calls?.length).toBeGreaterThan(0)
  }, 10000)
})
