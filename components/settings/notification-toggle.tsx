"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface NotificationToggleProps {
  userId: string
  label: string
  description: string
  defaultEnabled?: boolean
  settingKey: string
}

export function NotificationToggle({ 
  userId, 
  label, 
  description, 
  defaultEnabled = false,
  settingKey 
}: NotificationToggleProps) {
  const [enabled, setEnabled] = useState(defaultEnabled)
  const [loading, setLoading] = useState(false)

  async function handleToggle(checked: boolean) {
    setLoading(true)
    try {
      // In a real app, this would save to a user_settings table
      // For now, we'll store in localStorage and show a toast
      localStorage.setItem(`notification_${settingKey}`, JSON.stringify(checked))
      setEnabled(checked)
      toast.success(checked ? `${label} enabled` : `${label} disabled`)
    } catch (error) {
      toast.error("Failed to update settings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor={settingKey}>{label}</Label>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      <Switch 
        id={settingKey}
        checked={enabled} 
        onCheckedChange={handleToggle}
        disabled={loading}
      />
    </div>
  )
}
