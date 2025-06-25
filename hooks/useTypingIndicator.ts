"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface TypingUser {
  userId: string
  userName: string
}

interface UseTypingIndicatorReturn {
  typingUsers: TypingUser[]
  startTyping: (userId: string, userName: string) => void
  stopTyping: (userId: string) => void
  clearTyping: () => void
}

export const useTypingIndicator = (timeout = 3000): UseTypingIndicatorReturn => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const startTyping = useCallback(
    (userId: string, userName: string) => {
      // Clear existing timeout for this user
      const existingTimeout = timeoutRefs.current.get(userId)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      // Add or update user in typing list
      setTypingUsers((prev) => {
        const filtered = prev.filter((user) => user.userId !== userId)
        return [...filtered, { userId, userName }]
      })

      // Set new timeout to remove user from typing list
      const newTimeout = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((user) => user.userId !== userId))
        timeoutRefs.current.delete(userId)
      }, timeout)

      timeoutRefs.current.set(userId, newTimeout)
    },
    [timeout],
  )

  const stopTyping = useCallback((userId: string) => {
    const existingTimeout = timeoutRefs.current.get(userId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
      timeoutRefs.current.delete(userId)
    }

    setTypingUsers((prev) => prev.filter((user) => user.userId !== userId))
  }, [])

  const clearTyping = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach((timeout) => clearTimeout(timeout))
    timeoutRefs.current.clear()
    setTypingUsers([])
  }, [])

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout))
      timeoutRefs.current.clear()
    }
  }, [])

  return {
    typingUsers,
    startTyping,
    stopTyping,
    clearTyping,
  }
}
