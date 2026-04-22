import { Suspense } from "react"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Metadata } from "next"
import { Spinner } from "@/components/ui/spinner"

export const metadata: Metadata = {
  title: 'Redefinir Senha | Definance',
  description: 'Escolha uma nova senha para sua conta Definance.',
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<Spinner className="h-8 w-8 text-primary" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  )
}