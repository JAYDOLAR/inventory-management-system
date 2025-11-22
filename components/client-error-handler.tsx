"use client"

import { useEffect } from "react"

export function ClientErrorHandler() {
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      // MetaMask and other wallet extensions can throw unhandled rejections
      // when they fail to inject or connect. We can safely ignore these
      // as they are not related to our application logic.
      if (event.reason?.message?.includes("MetaMask") || event.reason?.toString().includes("MetaMask")) {
        event.preventDefault()
        console.warn("[Nexus IMS] Suppressed MetaMask error:", event.reason)
      }
    }

    window.addEventListener("unhandledrejection", handler)
    return () => window.removeEventListener("unhandledrejection", handler)
  }, [])

  return null
}
