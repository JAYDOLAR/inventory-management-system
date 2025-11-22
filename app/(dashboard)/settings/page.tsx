import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { LogOut, User, Bell, Shield } from "lucide-react"
import { NotificationToggle } from "@/components/settings/notification-toggle"
import { ChangePasswordButton } from "@/components/settings/change-password-button"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  async function signOut() {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/auth")
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>
              Your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="text-sm font-medium">Email</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
            <div className="grid gap-2">
              <div className="text-sm font-medium">User ID</div>
              <div className="text-sm text-muted-foreground font-mono">{user.id}</div>
            </div>
            <div className="grid gap-2">
              <div className="text-sm font-medium">Account Created</div>
              <div className="text-sm text-muted-foreground">
                {new Date(user.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Configure your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <NotificationToggle
                userId={user.id}
                label="Low Stock Alerts"
                description="Get notified when products reach minimum stock level"
                settingKey="low_stock"
                defaultEnabled={true}
              />
              <NotificationToggle
                userId={user.id}
                label="Email Notifications"
                description="Receive email updates for important events"
                settingKey="email"
                defaultEnabled={false}
              />
              <NotificationToggle
                userId={user.id}
                label="Movement Alerts"
                description="Get notified of large inventory movements"
                settingKey="movements"
                defaultEnabled={false}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>
              Manage your account security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Password</div>
                  <div className="text-sm text-muted-foreground">
                    Update your password to keep your account secure
                  </div>
                </div>
                <ChangePasswordButton />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              <CardTitle>Session</CardTitle>
            </div>
            <CardDescription>
              Manage your login session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={signOut}>
              <Button variant="destructive" type="submit">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
