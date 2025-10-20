import { useState, useEffect, useRef } from 'react'
import { X as CloseIcon, Check, Search, ChevronDown, ChevronRight } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { subscribeToAnnotations, toggleAnnotationResolved, deleteAnnotation } from '@/services/firestore'
import type { Annotation } from '@/types/shapes'
import type { Shape } from '@/types/shapes'

interface CommentsPanelProps {
  canvasPath: string
  shapes: Shape[]
  isOpen: boolean
  onClose?: () => void
  selectedAnnotationId?: string
  onAnnotationClick?: (annotation: Annotation, shape: Shape) => void
}

interface GroupedAnnotations {
  shape: Shape
  annotations: Annotation[]
  unresolved: number
}

export function CommentsPanel({
  canvasPath,
  shapes,
  isOpen,
  onClose,
  selectedAnnotationId,
  onAnnotationClick
}: CommentsPanelProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showResolved, setShowResolved] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const { user } = useAuth()
  const selectedRef = useRef<HTMLDivElement>(null)

  // Subscribe to annotations
  useEffect(() => {
    if (!isOpen || !canvasPath) return

    const unsubscribe = subscribeToAnnotations(canvasPath, (firestoreAnnotations) => {
      setAnnotations(firestoreAnnotations)
    })

    return unsubscribe
  }, [canvasPath, isOpen])

  // Auto-scroll to selected annotation
  useEffect(() => {
    if (selectedAnnotationId && selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [selectedAnnotationId])

  // Group annotations by shape
  const groupedAnnotations: GroupedAnnotations[] = []
  const annotationsMap = new Map<string, Annotation[]>()

  annotations.forEach(annotation => {
    if (!annotationsMap.has(annotation.shapeId)) {
      annotationsMap.set(annotation.shapeId, [])
    }
    annotationsMap.get(annotation.shapeId)!.push(annotation)
  })

  // Create grouped structure with shape info
  annotationsMap.forEach((shapeAnnotations, shapeId) => {
    const shape = shapes.find(s => s.id === shapeId)
    if (shape) {
      const unresolved = shapeAnnotations.filter(a => !a.resolved).length
      groupedAnnotations.push({
        shape,
        annotations: shapeAnnotations,
        unresolved
      })
    }
  })

  // Filter by search query
  const filteredGroups = groupedAnnotations.filter(group => {
    if (!searchQuery) return true

    const shapeName = getShapeName(group.shape).toLowerCase()
    const hasMatchingComment = group.annotations.some(a =>
      a.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.userName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return shapeName.includes(searchQuery.toLowerCase()) || hasMatchingComment
  })

  // Filter by resolved status
  const visibleGroups = filteredGroups.map(group => ({
    ...group,
    annotations: showResolved
      ? group.annotations
      : group.annotations.filter(a => !a.resolved)
  })).filter(group => group.annotations.length > 0)

  // Count stats
  const unresolvedCount = annotations.filter(a => !a.resolved).length
  const resolvedCount = annotations.filter(a => a.resolved).length

  const toggleGroup = (shapeId: string) => {
    const newCollapsed = new Set(collapsedGroups)
    if (newCollapsed.has(shapeId)) {
      newCollapsed.delete(shapeId)
    } else {
      newCollapsed.add(shapeId)
    }
    setCollapsedGroups(newCollapsed)
  }

  const handleResolve = async (annotation: Annotation) => {
    await toggleAnnotationResolved(canvasPath, annotation.id, !annotation.resolved)
  }

  const handleDelete = async (annotation: Annotation) => {
    if (window.confirm('Delete this comment?')) {
      await deleteAnnotation(canvasPath, annotation.id)
    }
  }

  const getTimeAgo = (timestamp: Date | number): string => {
    const now = Date.now()
    const time = typeof timestamp === 'number' ? timestamp : timestamp.getTime()
    const diff = now - time

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  if (!isOpen) return null

  return (
    <div
      className="comments-panel"
      style={{
        position: 'fixed',
        top: '60px',
        right: '0px',
        width: '400px',
        height: 'calc(100vh - 80px)',
        backgroundColor: 'white',
        boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10000
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            Comments
          </h2>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '13px',
            color: '#6b7280'
          }}>
            {unresolvedCount} unresolved • {resolvedCount} resolved
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              color: '#6b7280',
              borderRadius: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <CloseIcon size={20} />
          </button>
        )}
      </div>

      {/* Search */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: '#f9fafb',
          borderRadius: '6px',
          border: '1px solid #e5e7eb'
        }}>
          <Search size={16} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              backgroundColor: 'transparent',
              outline: 'none',
              fontSize: '14px',
              color: '#1f2937'
            }}
          />
        </div>
      </div>

      {/* Show Resolved Toggle */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#4b5563'
        }}>
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          Show resolved ({resolvedCount})
        </label>
      </div>

      {/* Annotations List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 0'
      }}>
        {visibleGroups.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#9ca3af'
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500' }}>
              No comments yet
            </p>
            <p style={{ margin: 0, fontSize: '12px' }}>
              Select a shape and add a comment to start
            </p>
          </div>
        ) : (
          visibleGroups.map((group) => {
            const isCollapsed = collapsedGroups.has(group.shape.id)

            return (
              <div key={group.shape.id} style={{ marginBottom: '16px' }}>
                {/* Shape Header */}
                <div
                  onClick={() => toggleGroup(group.shape.id)}
                  style={{
                    padding: '8px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    backgroundColor: '#f9fafb',
                    borderTop: '1px solid #e5e7eb',
                    borderBottom: '1px solid #e5e7eb'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {getShapeName(group.shape)}
                    </span>
                    {group.unresolved > 0 && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#8b5cf6',
                        backgroundColor: '#ede9fe',
                        padding: '2px 6px',
                        borderRadius: '10px'
                      }}>
                        {group.unresolved}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {group.annotations.length} comment{group.annotations.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Annotations */}
                {!isCollapsed && (
                  <div style={{ padding: '12px 20px' }}>
                    {group.annotations.map((annotation) => {
                      const isSelected = annotation.id === selectedAnnotationId
                      const isCurrentUser = annotation.userId === user?.uid

                      return (
                        <div
                          key={annotation.id}
                          ref={isSelected ? selectedRef : null}
                          onClick={() => onAnnotationClick?.(annotation, group.shape)}
                          style={{
                            padding: '12px',
                            marginBottom: '8px',
                            backgroundColor: isSelected ? '#f0fdf4' : '#f9fafb',
                            border: `1px solid ${isSelected ? '#86efac' : '#e5e7eb'}`,
                            borderRadius: '8px',
                            cursor: onAnnotationClick ? 'pointer' : 'default',
                            opacity: annotation.resolved ? 0.6 : 1,
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (onAnnotationClick && !isSelected) {
                              e.currentTarget.style.backgroundColor = '#f3f4f6'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (onAnnotationClick && !isSelected) {
                              e.currentTarget.style.backgroundColor = '#f9fafb'
                            }
                          }}
                        >
                          {/* User info */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '8px'
                          }}>
                            <div
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: annotation.userColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              {annotation.userName.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#1f2937'
                              }}>
                                {annotation.userName}
                              </div>
                              <div style={{
                                fontSize: '11px',
                                color: '#9ca3af'
                              }}>
                                {getTimeAgo(annotation.createdAt)}
                              </div>
                            </div>
                            {annotation.resolved && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: '600',
                                color: '#10b981',
                                backgroundColor: '#d1fae5',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                <Check size={12} />
                                Resolved
                              </div>
                            )}
                          </div>

                          {/* Comment text */}
                          <div style={{
                            fontSize: '14px',
                            color: '#1f2937',
                            lineHeight: '1.5',
                            marginBottom: '8px',
                            wordWrap: 'break-word'
                          }}>
                            {annotation.comment}
                          </div>

                          {/* Actions */}
                          <div style={{
                            display: 'flex',
                            gap: '8px',
                            paddingTop: '8px',
                            borderTop: '1px solid #e5e7eb'
                          }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleResolve(annotation)
                              }}
                              style={{
                                fontSize: '12px',
                                fontWeight: '500',
                                color: annotation.resolved ? '#9ca3af' : '#8b5cf6',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: '4px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f3f4f6'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }}
                            >
                              {annotation.resolved ? 'Unresolve' : 'Resolve'}
                            </button>
                            {isCurrentUser && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(annotation)
                                }}
                                style={{
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  color: '#ef4444',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '4px 8px',
                                  borderRadius: '4px'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#fef2f2'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent'
                                }}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// Helper function to get shape name
function getShapeName(shape: Shape): string {
  // Check for group name first
  if (shape.groupName) {
    return shape.groupName
  }

  // Use text content if available
  if (shape.type === 'text' && 'text' in shape) {
    const text = (shape as any).text
    return text.length > 20 ? `${text.substring(0, 20)}...` : text
  }

  // Default to shape type with ID
  const typeName = shape.type.charAt(0).toUpperCase() + shape.type.slice(1)
  return `${typeName} #${shape.id.substring(0, 4)}`
}
