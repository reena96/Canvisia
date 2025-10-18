// AI Command Types
export interface AICommand {
  id: string
  text: string
  timestamp: number
  userId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

// Tool call types
export interface AIToolCall {
  name: string
  input: Record<string, any>
}

// AI Response
export interface AIResponse {
  content: string
  tool_calls?: AIToolCall[]
  error?: string
}

// Lock types
export interface AILock {
  userId: string
  userName: string
  timestamp: number
  command: string
}
