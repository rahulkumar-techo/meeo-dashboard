"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowRight, Zap } from "lucide-react"
import { AuthCardLayout } from "@/components/auth"
import { Button } from "@/components/ui/button"
import { useLoginMutation } from "@/hooks/use-auth-query"
import { useUserStore } from "@/store/user.store"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect") || "/"
  const isVerified = searchParams.get("verified") === "true"
  const isReset = searchParams.get("reset") === "true"

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [rememberMe, setRememberMe] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const { isAuthenticated } = useUserStore()
  const loginMutation = useLoginMutation()

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectUrl)
    }
  }, [isAuthenticated, redirectUrl, router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    loginMutation.mutate(
      {
        email: email.trim(),
        password,
        deviceName: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 80) : "Web Dashboard",
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            router.push(redirectUrl)
          } else {
            setError(res.message || "Failed to log in. Please check your credentials.")
          }
        },
        onError: (err: any) => {
          const msg =
            err.response?.data?.message ||
            err.message ||
            "Invalid email or password. Please try again."
          setError(msg)
        },
      }
    )
  }

  const fillDemoCredentials = () => {
    setEmail("testing01@gmail.com")
    setPassword("testing@01")
    setError(null)
  }

  return (
    <AuthCardLayout
      title="Welcome back"
      subtitle="Enter your credentials to access your control center."
      badgeText="Secure Sign In"
      footerContent={
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
            Sign up
          </Link>
        </p>
      }
    >
      {isVerified && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>Email successfully verified! You can now log in.</span>
        </div>
      )}

      {isReset && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>Password reset successful! Please log in with your new password.</span>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Work Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="h-10 w-full rounded-lg border border-border/80 bg-background/80 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-foreground">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 w-full rounded-lg border border-border/80 bg-background/80 pl-9 pr-10 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Remember me checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-3.5 rounded border-border text-indigo-600 focus:ring-indigo-500"
            />
            <span>Remember this device</span>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="h-10 w-full gap-2 bg-indigo-600 text-xs font-semibold text-white shadow-md hover:bg-indigo-700"
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      {/* Quick Demo Fill Button */}
      <div className="mt-4 pt-3 border-t border-dashed border-border/60">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fillDemoCredentials}
          className="w-full gap-1.5 text-xs text-muted-foreground hover:text-foreground border-border/80"
        >
          <Zap className="size-3.5 text-amber-500" />
          <span>Fill Demo Credentials (testing01@gmail.com)</span>
        </Button>
      </div>
    </AuthCardLayout>
  )
}
