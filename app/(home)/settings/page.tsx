import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Shield, Calendar } from "lucide-react"
import { getAuthenticatedUser } from "@/config/useAuth"
import { PersonalInfoForm } from "@/components/frontend/settings/PersonalInfoForm"
import { EmailForm } from "@/components/frontend/settings/EmailForm"
import { PasswordForm } from "@/components/frontend/settings/PasswordForm"
import { ProfileImageForm } from "@/components/frontend/settings/ProfileImageForm"
import { DangerZone } from "@/components/frontend/settings/DangerZone"
import { SettingsLoading } from "@/components/frontend/settings/SettingsLoading"
import { formatDate } from "date-fns"

async function SettingsContent() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return (
      <Card className="animate-in fade-in slide-in-from-bottom-4">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Settings className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-red-600">Error Loading Settings</h3>
          <p className="text-muted-foreground">An error occurred while loading settings.</p>
        </CardContent>
      </Card>
    )
  }

  // Handle nullable/undefined properties with fallback values
  const displayName = user.name || "User"
  const displayEmail = user.email || ""
  const isVerified = user.isVerfied || false

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <Card className="animate-in fade-in slide-in-from-top-4 duration-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{displayName}</h2>
                <p className="text-muted-foreground">{displayEmail}</p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={isVerified ? "default" : "secondary"} className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {isVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {user.createdAt && `Member since ${formatDate(user.createdAt, "MMM dd, yyyy")}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Forms */}
      <div className="space-y-6">
        <ProfileImageForm user={{
          name: displayName,
          image: user.image || null
        }} />
        <PersonalInfoForm user={user} />
        <EmailForm user={{
          email: displayEmail,
          isVerfied: isVerified
        }} />
        <PasswordForm />
        <DangerZone />
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 animate-in fade-in slide-in-from-top-4 duration-500">
          Account Settings
        </h1>
        <p className="text-muted-foreground animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
          Manage your account settings and preferences
        </p>
      </div>

      <Suspense fallback={<SettingsLoading />}>
        <SettingsContent />
      </Suspense>
    </div>
  )
}