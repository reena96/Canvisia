import { useState, useEffect, useRef } from 'react'
import { Pin, ArrowRight, ArrowLeft, ChevronRight, Mic, SquarePlus, X as CloseIcon, Check, CheckCheck } from 'lucide-react'
import { useAI } from '@/hooks/useAI'
import { useAuth } from '@/components/auth/AuthProvider'
import { addChatMessage, subscribeToChatMessages, markMessageAsRead, createChatTab, hideChatTab, unhideChatTab, renameChatTab, subscribeToChatTabs } from '@/services/firestore'

// Component to format and render message text with markdown-like formatting
const FormattedMessage = ({ text }: { text: string }) => {
  const lines = text.split('\n')

  const formatLine = (line: string, index: number) => {
    // Handle numbered lists (1. 2. 3.)
    const numberedListMatch = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*(.*)$/)
    if (numberedListMatch) {
      return (
        <div key={index} style={{ marginBottom: '8px' }}>
          <strong>{numberedListMatch[1]}. {numberedListMatch[2]}</strong>
          {numberedListMatch[3]}
        </div>
      )
    }

    // Handle bold text **text**
    if (line.includes('**')) {
      const parts = line.split(/(\*\*.*?\*\*)/)
      return (
        <div key={index} style={{ marginBottom: line.trim() ? '4px' : '0' }}>
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i}>{part.slice(2, -2)}</strong>
            }
            return part
          })}
        </div>
      )
    }

    // Regular line
    if (line.trim()) {
      return <div key={index} style={{ marginBottom: '4px' }}>{line}</div>
    }

    // Empty line for spacing
    return <div key={index} style={{ height: '8px' }} />
  }

  return <div>{lines.map((line, index) => formatLine(line, index))}</div>
}

// Generate consistent gradient color for each user based on their email/ID
const getUserGradient = (userEmail?: string): string => {
  if (!userEmail) {
    return 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)' // Default gray
  }

  // Predefined gradients in purple/violet color family to match toolbar
  const gradients = [
    'linear-gradient(135deg, #5e63de 0%, #7244d5 100%)', // Main Purple (matches toolbar)
    'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', // Indigo-Violet
    'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', // Violet-Purple
    'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', // Deep Indigo-Violet
    'linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%)', // Purple-Light Purple
    'linear-gradient(135deg, #6d28d9 0%, #9333ea 100%)', // Deep Purple-Bright Purple
    'linear-gradient(135deg, #5b21b6 0%, #7e22ce 100%)', // Very Deep Purple
    'linear-gradient(135deg, #4c1d95 0%, #6b21a8 100%)', // Dark Purple
    'linear-gradient(135deg, #7e22ce 0%, #a855f7 100%)', // Purple-Light Violet
    'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)', // Indigo-Purple
  ]

  // Simple hash function to convert email to a number
  let hash = 0
  for (let i = 0; i < userEmail.length; i++) {
    hash = ((hash << 5) - hash) + userEmail.charCodeAt(i)
    hash = hash & hash // Convert to 32-bit integer
  }

  // Use absolute value and modulo to get an index
  const index = Math.abs(hash) % gradients.length
  return gradients[index]
}

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: number
  userName?: string
  userEmail?: string
  readBy?: string[] // Array of user emails who have read this message
}

interface ChatTab {
  id: string
  name: string
  messages: Message[]
}

interface AIChatProps {
  canvasId: string
  isOpen?: boolean
  onClose?: () => void
}

type WindowState = 'minimized' | 'normal' | 'maximized'
type PinPosition = 'floating' | 'right' | 'left'

export function AIChat({ canvasId, isOpen = true, onClose }: AIChatProps) {
  const [command, setCommand] = useState('')
  const [tabs, setTabs] = useState<ChatTab[]>([])
  const [activeTabId, setActiveTabId] = useState('1')
  const [windowState, setWindowState] = useState<WindowState>('normal')
  const [pinPosition, setPinPosition] = useState<PinPosition>('right')
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 100 })
  const [size, setSize] = useState({ width: 400, height: 500 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [editingTabName, setEditingTabName] = useState('')
  const [tabsLoaded, setTabsLoaded] = useState(false)

  // Get active tab
  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0]
  const messages = activeTab?.messages || []

  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Handle AI responses
  const handleAIResponse = async (_userMsg: string, aiResponse: string) => {
    // Add AI response to chat
    const aiMessage: Message = {
      id: Date.now().toString(),
      text: aiResponse,
      sender: 'ai',
      timestamp: Date.now(),
      userName: 'Vega'
    }
    await addChatMessage(canvasId, activeTabId, aiMessage)
  }

  const { sendCommand, isProcessing, isLocked, lockOwner } = useAI(canvasId, handleAIResponse)

  // Reset to right-pinned when opened from toolbar
  useEffect(() => {
    if (isOpen) {
      setWindowState('normal')
      setPinPosition('right')
    }
  }, [isOpen])

  // Subscribe to chat tabs from Firestore
  useEffect(() => {
    if (!isOpen || !user?.email) return

    const unsubscribe = subscribeToChatTabs(canvasId, async (firestoreTabs) => {
      // If no tabs exist, create the default tab
      if (firestoreTabs.length === 0) {
        await createChatTab(canvasId, '1', 'Chat 1')
        return
      }

      // Filter out tabs hidden by current user
      const visibleTabs = firestoreTabs.filter(tab => {
        const hiddenBy = tab.hiddenBy || []
        return !hiddenBy.includes(user.email || '')
      })

      // Update tabs state (will merge with messages below)
      setTabs(prev => {
        // Merge existing messages with new tab list
        return visibleTabs.map(tab => {
          const existingTab = prev.find(t => t.id === tab.id)
          return {
            id: tab.id,
            name: tab.name,
            messages: existingTab?.messages || []
          }
        })
      })
      setTabsLoaded(true)
    })

    return () => unsubscribe()
  }, [canvasId, isOpen, user?.email])

  // Subscribe to messages for ALL tabs (to detect messages on hidden tabs)
  useEffect(() => {
    if (!isOpen || !tabsLoaded || !user?.email) return

    const unsubscribes: (() => void)[] = []

    // Get all tabs including hidden ones from Firestore
    subscribeToChatTabs(canvasId, (allTabs) => {
      // Clean up previous subscriptions
      unsubscribes.forEach(unsub => unsub())
      unsubscribes.length = 0

      // Subscribe to each tab's messages
      allTabs.forEach(tab => {
        const unsubscribe = subscribeToChatMessages(canvasId, tab.id, async (firestoreMessages) => {
          // If new messages arrive on a hidden tab from another user, unhide it
          if (firestoreMessages.length > 0 && user?.email) {
            const lastMessage = firestoreMessages[firestoreMessages.length - 1]
            const hiddenBy = tab.hiddenBy || []

            // If tab is hidden and message is from someone else, unhide it
            if (hiddenBy.includes(user.email) && lastMessage.userEmail !== user.email) {
              await unhideChatTab(canvasId, tab.id, user.email)
            }
          }

          // Update messages for this tab
          setTabs(prev => prev.map(t =>
            t.id === tab.id
              ? { ...t, messages: firestoreMessages }
              : t
          ))
        })

        unsubscribes.push(unsubscribe)
      })
    })

    return () => {
      unsubscribes.forEach(unsub => unsub())
    }
  }, [canvasId, isOpen, tabsLoaded, user?.email])

  // Mark messages as read when viewing them
  useEffect(() => {
    if (!isOpen || !user?.email || !activeTabId) return

    // Mark all messages from other users as read
    messages.forEach(async (msg) => {
      // Skip if this is the current user's message
      if (msg.userEmail === user?.email) return

      // Skip if current user already read this message
      if (!user?.email || msg.readBy?.includes(user.email)) return

      // Mark as read
      try {
        await markMessageAsRead(canvasId, activeTabId, msg.id, user.email)
      } catch (error) {
        console.error('Failed to mark message as read:', error)
      }
    })
  }, [messages, canvasId, activeTabId, user?.email, isOpen])

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

  // Cmd+K to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        // Focus the input if chat is open
        if (isOpen) {
          document.getElementById('ai-chat-input')?.focus()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea based on content
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommand(e.target.value)

    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without Shift sends the message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (command.trim() && !isProcessing && !isLocked) {
        handleSubmit(e as any)
      }
    }
    // Shift+Enter adds a new line (default behavior)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim() || isProcessing) return

    // Add user message to Firestore with user info
    const userMessage: Message = {
      id: Date.now().toString(),
      text: command,
      sender: 'user',
      timestamp: Date.now(),
      userName: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
      userEmail: user?.email || undefined
    }

    // Save to Firestore (will be synced to all users)
    await addChatMessage(canvasId, activeTabId, userMessage)

    const userCommand = command
    setCommand('')

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    // Send to AI (response will be handled by handleAIResponse callback)
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
    if (windowState === 'minimized') {
      // When expanding from minimized, default to right side
      setWindowState('normal')
      setPinPosition('right')
    } else {
      // When minimizing, close the chat (return to toolbar)
      if (onClose) {
        onClose()
      } else {
        setWindowState('minimized')
      }
    }
  }

  const toggleMaximize = () => {
    if (windowState === 'maximized') {
      // Return to previous state (right side)
      setWindowState('normal')
      setPinPosition('right')
    } else if (windowState === 'normal' && pinPosition !== 'floating') {
      // Only allow maximize when pinned to a side
      setWindowState('maximized')
    } else if (windowState === 'normal' && pinPosition === 'floating') {
      // If floating, first pin to right, then can maximize on next click
      setPinPosition('right')
    }
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

  // If not open, don't render anything
  if (!isOpen) return null

  const moveLeft = () => {
    if (windowState === 'minimized') {
      // When minimized, expand to left side
      setWindowState('normal')
      setPinPosition('left')
    } else if (pinPosition === 'right') {
      setPinPosition('floating')
    } else if (pinPosition === 'floating') {
      setPinPosition('left')
    }
  }

  const moveRight = () => {
    if (windowState === 'minimized') {
      // When minimized, expand to right side
      setWindowState('normal')
      setPinPosition('right')
    } else if (pinPosition === 'left') {
      setPinPosition('floating')
    } else if (pinPosition === 'floating') {
      setPinPosition('right')
    }
  }

  const handleNewTab = async () => {
    // Create a new tab in Firestore
    const newTabId = Date.now().toString()
    const newTabName = `Chat ${tabs.length + 1}`
    await createChatTab(canvasId, newTabId, newTabName)
    setActiveTabId(newTabId)
  }

  const handleCloseTab = async (tabId: string) => {
    if (tabs.length === 1) {
      // Don't allow closing the last tab
      return
    }

    if (!user?.email) return

    const tabIndex = tabs.findIndex(tab => tab.id === tabId)

    // If closing active tab, switch to another tab first
    if (tabId === activeTabId) {
      const newActiveIndex = Math.max(0, tabIndex - 1)
      const remainingTabs = tabs.filter(tab => tab.id !== tabId)
      if (remainingTabs.length > 0) {
        setActiveTabId(remainingTabs[newActiveIndex].id)
      }
    }

    // Hide tab for current user (not delete)
    await hideChatTab(canvasId, tabId, user.email)
  }

  const handleStartRename = (tabId: string, currentName: string) => {
    setEditingTabId(tabId)
    setEditingTabName(currentName)
  }

  const handleFinishRename = async () => {
    if (editingTabId && editingTabName.trim()) {
      await renameChatTab(canvasId, editingTabId, editingTabName.trim())
    }
    setEditingTabId(null)
    setEditingTabName('')
  }

  const handleCancelRename = () => {
    setEditingTabId(null)
    setEditingTabName('')
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  // Calculate position and size based on state
  const getWindowStyle = (): React.CSSProperties => {
    // Minimized state is now handled by toolbar, so we shouldn't render in minimized state
    if (windowState === 'minimized') {
      return { display: 'none' }
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
          <img src="/vega-icon.svg" alt="Vega" style={{ width: '30px', height: '30px', marginRight: '6px' }} />
          Vega
          {isLocked && <span className="ai-chat-status"> (Busy with {lockOwner})</span>}
        </div>
        <div className="ai-chat-controls">
          <button
            onClick={moveLeft}
            className="ai-chat-control-btn"
            title={windowState === 'minimized' ? 'Expand to left' : 'Move left'}
            disabled={windowState !== 'minimized' && pinPosition === 'left'}
            style={{
              opacity: (windowState !== 'minimized' && pinPosition === 'left') ? 0.3 : 1,
              cursor: (windowState !== 'minimized' && pinPosition === 'left') ? 'not-allowed' : 'pointer'
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={handlePinToggle}
            className="ai-chat-control-btn"
            title={pinPosition === 'floating' ? 'Pin to closest side' : 'Unpin'}
            disabled={windowState === 'minimized'}
            style={{
              backgroundColor: pinPosition !== 'floating' ? 'rgba(255, 255, 255, 0.9)' : undefined,
              color: pinPosition !== 'floating' ? '#667eea' : undefined,
              boxShadow: pinPosition !== 'floating' ? '0 0 12px rgba(255, 255, 255, 0.6), inset 0 0 0 2px rgba(102, 126, 234, 0.3)' : undefined,
              transform: pinPosition !== 'floating' ? 'scale(1.05)' : undefined,
              opacity: windowState === 'minimized' ? 0.3 : 1
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
            title={windowState === 'minimized' ? 'Expand to right' : 'Move right'}
            disabled={windowState !== 'minimized' && pinPosition === 'right'}
            style={{
              opacity: (windowState !== 'minimized' && pinPosition === 'right') ? 0.3 : 1,
              cursor: (windowState !== 'minimized' && pinPosition === 'right') ? 'not-allowed' : 'pointer'
            }}
          >
            <ArrowRight size={16} />
          </button>
          <button
            onClick={handleNewTab}
            className="ai-chat-control-btn"
            title="New Tab"
          >
            <SquarePlus size={16} />
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
          <button
            onClick={handleClose}
            className="ai-chat-control-btn"
            title="Close"
          >
            <CloseIcon size={16} />
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      {tabs.length > 1 && (
        <div style={{
          display: 'flex',
          backgroundColor: '#f3f4f6',
          borderBottom: '1px solid #e5e7eb',
          overflowX: 'auto',
          gap: '2px',
          padding: '4px 8px'
        }}>
          {tabs.map(tab => {
            // Check if tab has unread messages
            const unreadMessages = tab.messages.filter(msg => {
              const readBy = msg.readBy || []
              return msg.sender !== 'ai' && msg.userEmail !== user?.email && !readBy.includes(user?.email || '')
            })
            const hasUnread = unreadMessages.length > 0
            const unreadCount = unreadMessages.length

            return (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  backgroundColor: tab.id === activeTabId ? 'white' : 'transparent',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: hasUnread ? '600' : (tab.id === activeTabId ? '500' : '400'),
                  color: tab.id === activeTabId ? '#1f2937' : (hasUnread ? '#667eea' : '#6b7280'),
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  border: tab.id === activeTabId ? '1px solid #e5e7eb' : (hasUnread ? '1px solid #667eea40' : '1px solid transparent'),
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (tab.id !== activeTabId) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (tab.id !== activeTabId) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
              {editingTabId === tab.id ? (
                <input
                  type="text"
                  value={editingTabName}
                  onChange={(e) => setEditingTabName(e.target.value)}
                  onBlur={handleFinishRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleFinishRename()
                    } else if (e.key === 'Escape') {
                      handleCancelRename()
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  style={{
                    border: '1px solid #3b82f6',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '13px',
                    outline: 'none',
                    width: '100px',
                    backgroundColor: 'white'
                  }}
                />
              ) : (
                <>
                  <span
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      handleStartRename(tab.id, tab.name)
                    }}
                    title="Double-click to rename"
                  >
                    {tab.name}
                  </span>
                  {hasUnread && (
                    <span
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        borderRadius: '10px',
                        padding: '2px 6px',
                        fontSize: '10px',
                        fontWeight: '600',
                        minWidth: '18px',
                        textAlign: 'center'
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </>
              )}
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCloseTab(tab.id)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#9ca3af',
                    borderRadius: '3px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e5e7eb'
                    e.currentTarget.style.color = '#4b5563'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#9ca3af'
                  }}
                >
                  <CloseIcon size={14} />
                </button>
              )}
            </div>
            )
          })}
        </div>
      )}

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
            {messages.map((msg, index) => {
              // Show username if it's the first message or if the sender changed
              const showUserName = index === 0 || messages[index - 1].userName !== msg.userName
              const isCurrentUser = msg.sender === 'user' && msg.userEmail === user?.email
              const userGradient = msg.sender === 'user' ? getUserGradient(msg.userEmail) : undefined

              // Calculate read receipt status for current user's messages
              let showReadReceipt = false
              let isReadByAll = false

              if (msg.sender === 'user' && isCurrentUser) {
                showReadReceipt = true

                // Get all unique contributors (human users only, not AI)
                const allContributors = new Set<string>()
                messages.forEach(m => {
                  if (m.sender === 'user' && m.userEmail) {
                    allContributors.add(m.userEmail)
                  }
                })

                // Remove the current user from the list of contributors
                allContributors.delete(user?.email || '')

                // Check if all other contributors have read this message
                const readBy = msg.readBy || []
                const otherContributorsCount = allContributors.size

                // If there are other contributors, check if all have read
                if (otherContributorsCount > 0) {
                  const otherContributorsWhoRead = Array.from(allContributors).filter(email =>
                    readBy.includes(email)
                  )
                  isReadByAll = otherContributorsWhoRead.length === otherContributorsCount
                } else {
                  // If no other contributors, show double check (just the sender)
                  isReadByAll = true
                }
              }

              return (
                <div key={msg.id} className={`ai-chat-message ai-chat-message-${isCurrentUser ? 'user' : 'ai'}`}>
                  <div style={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
                    gap: '4px',
                    maxWidth: '85%'
                  }}>
                    {showUserName && msg.userName && (
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: msg.sender === 'ai' ? '#667eea' : '#6b7280',
                        paddingLeft: !isCurrentUser ? '4px' : '0',
                        paddingRight: isCurrentUser ? '4px' : '0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {msg.sender === 'ai' && (
                          <img src="/vega-icon.svg" alt="Vega" style={{ width: '14px', height: '14px' }} />
                        )}
                        <span>{msg.userName}</span>
                        <span style={{ fontSize: '10px', fontWeight: '400', color: '#9ca3af' }}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div
                        className="ai-chat-message-content"
                        style={msg.sender === 'user' && userGradient ? {
                          background: userGradient,
                          color: 'white'
                        } : undefined}
                      >
                        {msg.sender === 'ai' ? (
                          <FormattedMessage text={msg.text} />
                        ) : (
                          msg.text
                        )}
                      </div>
                      {showReadReceipt && (
                        <div style={{
                          color: isReadByAll ? '#667eea' : '#9ca3af',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          {isReadByAll ? <CheckCheck size={14} /> : <Check size={14} />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
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
            <textarea
              ref={inputRef}
              id="ai-chat-input"
              value={command}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                isLocked
                  ? `AI busy with ${lockOwner}...`
                  : isProcessing
                  ? 'Processing...'
                  : 'Type a command...'
              }
              disabled={isProcessing || isLocked}
              className="ai-chat-input"
              rows={1}
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
