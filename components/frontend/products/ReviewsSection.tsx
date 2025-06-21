"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, ThumbsUp, User, Verified, Edit2, Trash2, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { formatDistanceToNow } from "date-fns"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import ReviewForm from "./ReviewForm"
import { deleteReview, getUserReview } from "@/actions/reviews"


interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
  isVerified: boolean
  isApproved: boolean
  createdAt: Date
  user: {
    name: string | null
    image: string | null
  }
}

interface ReviewsSectionProps {
  product: {
    id: string
    name: string
    reviews: Review[]
  }
  ratingStats: {
    averageRating: number
    totalReviews: number
    ratingDistribution: number[]
  }
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
  }

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

export default function ReviewsSection({ product, ratingStats }: ReviewsSectionProps) {
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const { data: session } = useSession()

  const approvedReviews = product.reviews.filter((review) => review.isApproved)
  const displayedReviews = showAllReviews ? approvedReviews : approvedReviews.slice(0, 3)

  // Fetch user's existing review
  useEffect(() => {
    if (session?.user?.id) {
      getUserReview(product.id).then((result) => {
        if (result.success && result.data) {
          setUserReview(result.data)
        }
      })
    }
  }, [session?.user?.id, product.id, refreshKey])

  const handleDeleteReview = async (reviewId: string) => {
    const result = await deleteReview(reviewId)
    if (result.success) {
      toast.success(result.message)
      setUserReview(null)
      setRefreshKey(prev => prev + 1)
      // Refresh the page to update the reviews list
      window.location.reload()
    } else {
      toast.error(result.error)
    }
  }

  const handleReviewSuccess = () => {
    setShowReviewForm(false)
    setEditingReview(null)
    setRefreshKey(prev => prev + 1)
    // Refresh the page to update the reviews list
    // window.location.reload()
  }

  if (ratingStats.totalReviews === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-600">Be the first to review this product!</p>
            </div>
            {session?.user ? (
              <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                <DialogTrigger asChild>
                  <Button className="bg-red-500 hover:bg-red-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Write a Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                  </DialogHeader>
                  <ReviewForm
                    productId={product.id}
                    productName={product.name}
                    onSuccess={handleReviewSuccess}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </DialogContent>
              </Dialog>
            ) : (
              <p className="text-sm text-gray-500">Please log in to write a review</p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <div className="text-4xl font-bold text-gray-900">{ratingStats.averageRating.toFixed(1)}</div>
                <div>
                  <StarRating rating={ratingStats.averageRating} size="md" />
                  <p className="text-sm text-gray-600 mt-1">
                    Based on {ratingStats.totalReviews} review{ratingStats.totalReviews !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              
              {session?.user ? (
                userReview ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">You reviewed this product</p>
                    <div className="flex gap-2">
                      <Dialog open={editingReview !== null} onOpenChange={(open) => !open && setEditingReview(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingReview(userReview)}
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Your Review</DialogTitle>
                          </DialogHeader>
                          <ReviewForm
                            productId={product.id}
                            productName={product.name}
                            existingReview={editingReview}
                            onSuccess={handleReviewSuccess}
                            onCancel={() => setEditingReview(null)}
                          />
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Review</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete your review? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteReview(userReview.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ) : (
                  <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                    <DialogTrigger asChild>
                      <Button className="bg-red-500 hover:bg-red-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Write a Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Write a Review</DialogTitle>
                      </DialogHeader>
                      <ReviewForm
                        productId={product.id}
                        productName={product.name}
                        onSuccess={handleReviewSuccess}
                        onCancel={() => setShowReviewForm(false)}
                      />
                    </DialogContent>
                  </Dialog>
                )
              ) : (
                <p className="text-sm text-gray-500">Please log in to write a review</p>
              )}
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingStats.ratingDistribution[rating - 1]
                const percentage = ratingStats.totalReviews > 0 ? (count / ratingStats.totalReviews) * 100 : 0

                return (
                  <div key={rating} className="flex items-center gap-3 text-sm">
                    <span className="w-8 text-right">{rating}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="w-8 text-gray-600">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {displayedReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={review.user.image || ""} />
                    <AvatarFallback>
                      {review.user.name ? review.user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{review.user.name || "Anonymous"}</span>
                        {review.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            <Verified className="w-3 h-3 mr-1" />
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Rating */}
                    <StarRating rating={review.rating} />

                    {/* Review Content */}
                    <div className="space-y-2">
                      {review.title && <h4 className="font-medium text-gray-900">{review.title}</h4>}
                      {review.comment && <p className="text-gray-700 leading-relaxed">{review.comment}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-2">
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Helpful
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Show More Button */}
        {approvedReviews.length > 3 && !showAllReviews && (
          <div className="text-center">
            <Button variant="outline" onClick={() => setShowAllReviews(true)}>
              Show All {ratingStats.totalReviews} Reviews
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
