"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, Loader2, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createReview, updateReview } from "@/actions/reviews"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

interface ReviewFormProps {
  productId: string
  productName: string
  onCancel?: () => void
  existingReview?: {
    id: string
    rating: number
    title: string | null
    comment: string | null
  } | null
  onSuccess?: () => void
}

export default function ReviewForm({ productId, productName, existingReview, onSuccess }: ReviewFormProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState(existingReview?.title || "")
  const [comment, setComment] = useState(existingReview?.comment || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      toast.error("Please sign in to submit a review")
      return
    }

    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    setIsSubmitting(true)

    try {
      const result = existingReview
        ? await updateReview(existingReview.id, {
            rating,
            title: title.trim() || undefined,
            comment: comment.trim() || undefined,
          })
        : await createReview({
            productId,
            rating,
            title: title.trim() || undefined,
            comment: comment.trim() || undefined,
          })

      if (result.success) {
        toast.success(result.message)
        setIsOpen(false)
        onSuccess?.()
        
        // Reset form if creating new review
        if (!existingReview) {
          setRating(0)
          setTitle("")
          setComment("")
        }
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    if (existingReview) {
      setRating(existingReview.rating)
      setTitle(existingReview.title || "")
      setComment(existingReview.comment || "")
    } else {
      setRating(0)
      setTitle("")
      setComment("")
    }
  }

  if (!session) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600 mb-4">Please sign in to write a review</p>
          <Button variant="outline" asChild>
            <a href="/auth/signin">Sign In</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-red-500 hover:bg-red-600"
          onClick={() => {
            setIsOpen(true)
            resetForm()
          }}
        >
          {existingReview ? "Edit Your Review" : "Write a Review"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {existingReview ? "Edit Your Review" : "Write a Review"}
          </DialogTitle>
          <p className="text-sm text-gray-600">{productName}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {rating > 0 && (
                  <>
                    {rating} star{rating !== 1 ? "s" : ""} - {
                      rating === 1 ? "Poor" :
                      rating === 2 ? "Fair" :
                      rating === 3 ? "Good" :
                      rating === 4 ? "Very Good" :
                      "Excellent"
                    }
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title (Optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience..."
              maxLength={100}
            />
            <p className="text-xs text-gray-500">{title.length}/100 characters</p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review (Optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience with this product..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500">{comment.length}/1000 characters</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {existingReview ? "Updating..." : "Submitting..."}
                </>
              ) : (
                existingReview ? "Update Review" : "Submit Review"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
