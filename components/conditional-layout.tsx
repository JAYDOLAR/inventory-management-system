"use client"

import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import LowStockNotifier from "@/components/notifications/low-stock-notifier"
import { ThemeToggle } from "@/components/theme-toggle"

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Check if we're on an auth page or the landing page
  const isAuthPage = pathname?.startsWith('/auth')
  const isLandingPage = pathname === '/'
  
  // If auth page or landing page, render without sidebar
  if (isAuthPage || isLandingPage) {
    return <>{children}</>
  }
  
  // Otherwise render with dashboard layout
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-border" />
          <div className="flex-1" />
          <ThemeToggle />
        </header>
        <main className="flex flex-1 flex-col">
          <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </SidebarInset>
      <LowStockNotifier />
    </SidebarProvider>
  )
}
