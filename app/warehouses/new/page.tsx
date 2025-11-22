"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function NewWarehousePage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const warehouse = {
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      type: formData.get("type") as string,
    }

    const { error } = await supabase.from("warehouses").insert(warehouse)

    setLoading(false)

    if (error) {
      toast.error("Failed to create warehouse")
      console.error(error)
    } else {
      toast.success("Warehouse created successfully")
      router.push("/warehouses")
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">New Warehouse</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Location Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="e.g. Main Distribution Center" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location / Address</Label>
              <Input id="location" name="location" placeholder="e.g. 123 Warehouse Blvd, New York, NY" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type" defaultValue="warehouse">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="store">Retail Store</SelectItem>
                  <SelectItem value="return_center">Return Center</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Warehouse"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
