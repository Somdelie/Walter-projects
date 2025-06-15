"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"

interface FormCardProps {
  title: string
  children: React.ReactNode
  onSubmit: () => Promise<string | void>
  buttonText: string
  isLoading?: boolean
}

export function FormCard({ title, children, onSubmit, buttonText }: FormCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await onSubmit()
      if (typeof result === "string") {
        toast.success(result)
      }
    } catch (error) {
      // Error handling is done in the onSubmit function
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {children}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              buttonText
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
