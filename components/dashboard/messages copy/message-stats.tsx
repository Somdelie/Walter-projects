import { Mail, Eye, Clock, User } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"

interface MessageStatsProps {
  totalMessages: number
  unreadCount: number
}

export function MessageStats({ totalMessages, unreadCount }: MessageStatsProps) {

  const todayCount = new Date().getDate(); // Placeholder for today's count

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{totalMessages}</p>
            </div>
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
            </div>
            <Eye className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-green-600">{todayCount}</p>
            </div>
            <User className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
        <Card>
            <CardContent className="p-4">
            <div className="flex items-center justify-between">
                <div>
                <p className="text-sm font-medium text-gray-600">Pinned Messages</p>
                <p className="text-2xl font-bold text-yellow-600">N/A</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            </CardContent>
        </Card>
    </div>
  )
}
