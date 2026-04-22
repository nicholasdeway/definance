"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function LoginPage() {
  const [view, setView] = useState<"login" | "forgot-password">("login")

  return (
    <AuthLayout>
      {view === "login" ? (
        <LoginForm onForgotPassword={() => setView("forgot-password")} />
      ) : (
        <ForgotPasswordForm onBackToLogin={() => setView("login")} />
      )}
    </AuthLayout>
  )
}