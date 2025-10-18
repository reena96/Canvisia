import { useState, useEffect, useRef } from 'react'
import { ChevronRight, Mic } from 'lucide-react'
import { useAI } from '@/hooks/useAI'

interface AICommandInputProps {
  canvasId: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export function AICommandInput({ canvasId }: AICommandInputProps) {
  const [command, setCommand] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { sendCommand, isProcessing, isLocked, lockOwner } = useAI(canvasId, (userMsg, aiResponse) => {
    // Callback to add messages to history
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: userMsg, timestamp: Date.now() },
      { id: (Date.now() + 1).toString(), role: 'assistant', content: aiResponse, timestamp: Date.now() + 1 }
    ])
  })

  // Cmd+K to toggle panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
        if (!isOpen) {
          setTimeout(() => document.getElementById('ai-command-input')?.focus(), 100)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim() || isProcessing) return

    await sendCommand(command)
    setCommand('')
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="ai-panel-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side Panel */}
      <div className={`ai-side-panel ${isOpen ? 'ai-panel-open' : ''}`}>
        <div className="ai-panel-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/vega-icon.svg" alt="Vega" style={{ width: '20px', height: '20px' }} />
            Vega
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="ai-close-btn"
            title="Close (Cmd+K)"
          >
            ✕
          </button>
        </div>

        <div className="ai-messages">
          {messages.length === 0 ? (
            <div className="ai-empty-state">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
                <img src="/vega-icon.svg" alt="Vega" style={{ width: '32px', height: '32px' }} />
                <span style={{ fontSize: '18px', fontWeight: '600' }}>Hi! I'm Vega</span>
              </div>
              <p>I can help you create and manipulate shapes on the canvas.</p>
              <p>Try asking me to:</p>
              <ul>
                <li>Create shapes (circles, rectangles, etc.)</li>
                <li>Add text labels</li>
                <li>Draw arrows and connections</li>
              </ul>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`ai-message ai-message-${msg.role}`}>
                <div className="ai-message-content">{msg.content}</div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="ai-input-form">
          <button
            type="button"
            className="ai-panel-voice-btn"
            title="Voice input (coming soon)"
            disabled={isProcessing || isLocked}
          >
            <Mic size={18} />
          </button>
          <input
            id="ai-command-input"
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder={
              isLocked
                ? `AI busy with ${lockOwner}'s command...`
                : isProcessing
                ? 'Processing...'
                : 'Type your command...'
            }
            disabled={isProcessing || isLocked}
            className="ai-panel-input"
          />
          <button
            type="submit"
            disabled={isProcessing || isLocked || !command.trim()}
            className="ai-panel-submit-btn"
          >
            {isProcessing ? '⏳' : <ChevronRight size={20} />}
          </button>
        </form>
      </div>

      {/* Toggle Button (when closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="ai-toggle-btn"
          title="Open Vega (Cmd+K)"
        >
          <img src="/vega-icon.svg" alt="Vega" style={{ width: '28px', height: '28px' }} />
        </button>
      )}
    </>
  )
}
