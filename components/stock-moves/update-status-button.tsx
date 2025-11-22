"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle } from "lucide-react"

interface UpdateStatusButtonProps {
  moveId: string
  currentStatus: string
}

export default function UpdateStatusButton({ moveId, currentStatus }: UpdateStatusButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  if (currentStatus === "done") {
    return null
  }

  const handleValidate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/stock-moves/${moveId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "done" }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update status")
      }

      toast({
        title: "Success",
        description: "Stock move validated and inventory updated.",
      })
      
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleValidate} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Validating...
        </>
      ) : (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Validate & Update Stock
        </>
      )}
    </Button>
  )
}
