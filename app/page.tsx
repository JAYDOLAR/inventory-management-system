"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, 
  CheckCircle2, 
  BarChart3, 
  Box, 
  RefreshCw, 
  ShieldCheck, 
  Zap,
  Menu,
  X,
  ChevronRight,
  LayoutDashboard,
  Package,
  ArrowLeftRight
} from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-background/80 backdrop-blur-md border-b shadow-sm py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl md:text-2xl tracking-tight">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Box className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <span>Nexus<span className="text-primary">IMS</span></span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
            <Link href="#solutions" className="text-sm font-medium hover:text-primary transition-colors">Solutions</Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
            <div className="flex items-center gap-3 ml-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth">Log in</Link>
              </Button>
              <Button size="sm" className="rounded-full px-6" asChild>
                <Link href="/auth">Get Started</Link>
              </Button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b shadow-lg p-4 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-5">
            <Link href="#features" className="p-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>Features</Link>
            <Link href="#solutions" className="p-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>Solutions</Link>
            <Link href="#pricing" className="p-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
            <div className="h-px bg-border my-2" />
            <Button variant="outline" className="w-full justify-center" asChild>
              <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
            </Button>
            <Button className="w-full justify-center" asChild>
              <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
            </Button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-50 animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-medium text-muted-foreground">v2.0 is now live</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Master Your Inventory <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
              With Precision
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Streamline operations, track stock in real-time, and make data-driven decisions with our comprehensive inventory management solution.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Button size="lg" className="h-12 px-8 rounded-full text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" asChild>
              <Link href="/dashboard">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 rounded-full text-base bg-background/50 backdrop-blur-sm" asChild>
              <Link href="#demo">
                View Demo
              </Link>
            </Button>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 md:mt-24 relative max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-xl blur opacity-20"></div>
            <div className="relative rounded-xl border bg-card shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <div className="mx-auto text-xs font-medium text-muted-foreground bg-background px-3 py-1 rounded-md border shadow-sm">
                  nexus-ims.app/dashboard
                </div>
              </div>
              <div className="aspect-[16/9] bg-muted/10 p-4 md:p-8 grid grid-cols-12 gap-4">
                {/* Mock Dashboard UI */}
                <div className="col-span-3 hidden md:flex flex-col gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-8 w-full bg-muted/50 rounded-md animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
                  ))}
                </div>
                <div className="col-span-12 md:col-span-9 flex flex-col gap-4">
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
                    ))}
                  </div>
                  <div className="flex-1 bg-muted/50 rounded-lg animate-pulse min-h-[200px]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Users", value: "10k+" },
              { label: "Items Tracked", value: "5M+" },
              { label: "Warehouses", value: "500+" },
              { label: "Uptime", value: "99.9%" },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <h3 className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</h3>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to scale</h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed to help you maintain control over your inventory across multiple locations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <LayoutDashboard className="h-6 w-6 text-primary" />,
                title: "Real-time Dashboard",
                description: "Get a bird's eye view of your entire operation with customizable widgets and real-time updates."
              },
              {
                icon: <ArrowLeftRight className="h-6 w-6 text-blue-500" />,
                title: "Stock Movements",
                description: "Track every item's journey from receipt to delivery with complete audit trails and history."
              },
              {
                icon: <BarChart3 className="h-6 w-6 text-green-500" />,
                title: "Advanced Analytics",
                description: "Make informed decisions with detailed reports on turnover, valuation, and forecasting."
              },
              {
                icon: <Package className="h-6 w-6 text-purple-500" />,
                title: "Multi-Warehouse",
                description: "Manage stock across unlimited locations with ease. Transfer items between warehouses instantly."
              },
              {
                icon: <Zap className="h-6 w-6 text-yellow-500" />,
                title: "Low Stock Alerts",
                description: "Never run out of stock again. Set custom thresholds and get notified automatically."
              },
              {
                icon: <ShieldCheck className="h-6 w-6 text-red-500" />,
                title: "Secure & Reliable",
                description: "Enterprise-grade security with role-based access control and daily backups."
              }
            ].map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 max-w-3xl mx-auto">Ready to optimize your inventory?</h2>
          <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses that trust Nexus IMS to manage their stock efficiently.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg rounded-full shadow-lg" asChild>
              <Link href="/auth">
                Get Started for Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link href="/contact">
                Contact Sales
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 pt-16 pb-8 border-t">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 font-bold text-xl mb-4">
                <Box className="h-6 w-6 text-primary" />
                <span>Nexus IMS</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The complete solution for modern inventory management. Track, analyze, and optimize your stock with ease.
              </p>
            </div>
            
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Integrations", "Changelog"]
              },
              {
                title: "Company",
                links: ["About Us", "Careers", "Blog", "Contact"]
              },
              {
                title: "Resources",
                links: ["Documentation", "Help Center", "API Reference", "Status"]
              }
            ].map((column, i) => (
              <div key={i}>
                <h4 className="font-semibold mb-4">{column.title}</h4>
                <ul className="space-y-2">
                  {column.links.map((link, j) => (
                    <li key={j}>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Nexus IMS. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
