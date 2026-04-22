"use client"

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { AuthLayout } from "@/components/auth/auth-layout"
import { useRouter } from "next/navigation"

export default function ForgotPasswordPage() {
  const router = useRouter()
  
  return (
    <AuthLayout>
      <ForgotPasswordForm onBackToLogin={() => router.push("/login")} />
    </AuthLayout>
  )
}