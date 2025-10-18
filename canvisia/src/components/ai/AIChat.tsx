import { useState, useEffect, useRef } from 'react'
import { Pin, ArrowRight, ArrowLeft, ChevronRight, Mic } from 'lucide-react'
import { useAI } from '@/hooks/useAI'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: number
}

interface AIChatProps {
  canvasId: string
}

type WindowState = 'minimized' | 'normal' | 'maximized'
type PinPosition = 'floating' | 'right' | 'left'

export function AIChat({ canvasId }: AIChatProps) {
  const [command, setCommand] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [windowState, setWindowState] = useState<WindowState>('normal')
  const [pinPosition, setPinPosition] = useState<PinPosition>('right')
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 100 })
  const [size, setSize] = useState({ width: 400, height: 500 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleAIMessage = (_userMsg: string, aiResponse: string) => {
    // Update the last message (which should be the "Processing..." placeholder)
    setMessages(prev => {
      // Find the index of the last "Processing..." message
      const index = prev.findIndex((msg, i) =>
        msg.sender === 'ai' &&
        msg.text === 'Processing...' &&
        i === prev.length - 1 // Only check the last message
      )

      if (index === -1) {
        console.warn('No Processing message found to update')
        return prev
      }

      // Create a completely new array with the updated message
      return prev.map((msg, i) =>
        i === index
          ? { ...msg, text: aiResponse }
          : msg
      )
    })
  }

  const { sendCommand, isProcessing, isLocked, lockOwner } = useAI(canvasId, handleAIMessage)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('aiChatState')
    if (saved) {
      try {
        const { windowState: ws, pinPosition: pp, position: pos, size: sz } = JSON.parse(saved)
        if (ws) setWindowState(ws)
        if (pp) setPinPosition(pp)
        if (pos) setPosition(pos)
        if (sz) setSize(sz)
      } catch (e) {
        console.error('Failed to load chat state:', e)
      }
    }
  }, [])

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('aiChatState', JSON.stringify({
      windowState,
      pinPosition,
      position,
      size
    }))
  }, [windowState, pinPosition, position, size])

  // Cmd+K to focus or toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (windowState === 'minimized') {
          setWindowState('normal')
        }
        document.getElementById('ai-chat-input')?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [windowState])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim() || isProcessing) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: command,
      sender: 'user',
      timestamp: Date.now()
    }

    // Add AI response placeholder BEFORE sending command
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'Processing...',
      sender: 'ai',
      timestamp: Date.now() + 1
    }

    setMessages(prev => [...prev, userMessage, aiMessage])

    const userCommand = command
    setCommand('')

    // Send to AI (response will be handled by callback)
    await sendCommand(userCommand)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowState === 'maximized' || pinPosition !== 'floating') return
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  const toggleMinimize = () => {
    setWindowState(prev => prev === 'minimized' ? 'normal' : 'minimized')
  }

  const toggleMaximize = () => {
    setWindowState(prev => prev === 'maximized' ? 'normal' : 'maximized')
  }

  const handlePinToggle = () => {
    if (pinPosition !== 'floating') {
      // If already pinned, unpin to floating
      setPinPosition('floating')
    } else {
      // If floating, pin to closest side based on current position
      const windowWidth = window.innerWidth
      const chatCenterX = position.x + size.width / 2

      // Pin to right if center of window is on right half of screen
      if (chatCenterX > windowWidth / 2) {
        setPinPosition('right')
      } else {
        setPinPosition('left')
      }
    }
  }

  const moveLeft = () => {
    if (pinPosition === 'right') {
      setPinPosition('floating')
    } else if (pinPosition === 'floating') {
      setPinPosition('left')
    }
  }

  const moveRight = () => {
    if (pinPosition === 'left') {
      setPinPosition('floating')
    } else if (pinPosition === 'floating') {
      setPinPosition('right')
    }
  }

  // Calculate position and size based on state
  const getWindowStyle = (): React.CSSProperties => {
    if (windowState === 'minimized') {
      return {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '300px',
        height: '50px',
        zIndex: 10000
      }
    }

    if (windowState === 'maximized') {
      return {
        position: 'fixed',
        top: '60px',
        left: '20px',
        right: '20px',
        bottom: '20px',
        width: 'auto',
        height: 'auto',
        zIndex: 10000
      }
    }

    if (pinPosition === 'right') {
      return {
        position: 'fixed',
        top: '60px',
        right: '0px',
        width: '400px',
        height: 'calc(100vh - 80px)',
        zIndex: 10000
      }
    }

    if (pinPosition === 'left') {
      return {
        position: 'fixed',
        top: '60px',
        left: '0px',
        width: '400px',
        height: 'calc(100vh - 80px)',
        zIndex: 10000
      }
    }

    // Floating
    return {
      position: 'fixed',
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: `${size.width}px`,
      height: `${size.height}px`,
      zIndex: 10000
    }
  }

  return (
    <div ref={chatRef} className="ai-chat-window" style={getWindowStyle()}>
      {/* Header */}
      <div
        className="ai-chat-header"
        onMouseDown={handleMouseDown}
        style={{ cursor: pinPosition === 'floating' && windowState !== 'maximized' ? 'move' : 'default' }}
      >
        <div className="ai-chat-title">
          <img src="/vega-icon.svg" alt="Vega" style={{ width: '20px', height: '20px', marginRight: '6px' }} />
          Vega
          {isLocked && <span className="ai-chat-status"> (Busy with {lockOwner})</span>}
        </div>
        <div className="ai-chat-controls">
          <button
            onClick={moveLeft}
            className="ai-chat-control-btn"
            title="Move left"
            disabled={pinPosition === 'left'}
            style={{
              opacity: pinPosition === 'left' ? 0.3 : 1,
              cursor: pinPosition === 'left' ? 'not-allowed' : 'pointer'
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={handlePinToggle}
            className="ai-chat-control-btn"
            title={pinPosition === 'floating' ? 'Pin to closest side' : 'Unpin'}
            style={{
              backgroundColor: pinPosition !== 'floating' ? 'rgba(255, 255, 255, 0.9)' : undefined,
              color: pinPosition !== 'floating' ? '#667eea' : undefined,
              boxShadow: pinPosition !== 'floating' ? '0 0 12px rgba(255, 255, 255, 0.6), inset 0 0 0 2px rgba(102, 126, 234, 0.3)' : undefined,
              transform: pinPosition !== 'floating' ? 'scale(1.05)' : undefined
            }}
          >
            <Pin size={16} style={{
              transform: pinPosition !== 'floating' ? 'rotate(-45deg)' : undefined,
              transition: 'transform 0.2s'
            }} />
          </button>
          <button
            onClick={moveRight}
            className="ai-chat-control-btn"
            title="Move right"
            disabled={pinPosition === 'right'}
            style={{
              opacity: pinPosition === 'right' ? 0.3 : 1,
              cursor: pinPosition === 'right' ? 'not-allowed' : 'pointer'
            }}
          >
            <ArrowRight size={16} />
          </button>
          <button
            onClick={toggleMinimize}
            className="ai-chat-control-btn"
            title="Minimize"
          >
            −
          </button>
          <button
            onClick={toggleMaximize}
            className="ai-chat-control-btn"
            title={windowState === 'maximized' ? 'Restore' : 'Maximize'}
          >
            {windowState === 'maximized' ? '⊡' : '□'}
          </button>
        </div>
      </div>

      {/* Messages - Hidden when minimized */}
      {windowState !== 'minimized' && (
        <>
          <div className="ai-chat-messages">
            {messages.length === 0 && (
              <div className="ai-chat-empty">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                  <img src="/vega-icon.svg" alt="Vega" style={{ width: '32px', height: '32px' }} />
                  <span style={{ fontSize: '18px', fontWeight: '600' }}>Hi! I'm Vega</span>
                </div>
                <p>Your AI canvas assistant</p>
                <p>Try: "Create a blue circle" or "Hello"</p>
                <p><kbd>Cmd+K</kbd> to focus</p>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`ai-chat-message ai-chat-message-${msg.sender}`}>
                <div className="ai-chat-message-content">{msg.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="ai-chat-input-form">
            <button
              type="button"
              className="ai-chat-voice-btn"
              title="Voice input (coming soon)"
              disabled={isProcessing || isLocked}
            >
              <Mic size={18} />
            </button>
            <input
              id="ai-chat-input"
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder={
                isLocked
                  ? `AI busy with ${lockOwner}...`
                  : isProcessing
                  ? 'Processing...'
                  : 'Type a command...'
              }
              disabled={isProcessing || isLocked}
              className="ai-chat-input"
            />
            <button
              type="submit"
              disabled={isProcessing || isLocked || !command.trim()}
              className="ai-chat-submit-btn"
            >
              {isProcessing ? '⏳' : <ChevronRight size={20} />}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
