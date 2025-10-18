interface AIStatusIndicatorProps {
  status: 'idle' | 'processing' | 'success' | 'error'
  message?: string
}

export function AIStatusIndicator({ status, message }: AIStatusIndicatorProps) {
  if (status === 'idle') return null

  return (
    <div className={`ai-status ai-status-${status}`}>
      {status === 'processing' && '⏳ AI is thinking...'}
      {status === 'success' && `✅ ${message || 'Success!'}`}
      {status === 'error' && `❌ ${message || 'Error'}`}
    </div>
  )
}
