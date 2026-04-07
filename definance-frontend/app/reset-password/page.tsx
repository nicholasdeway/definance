import { Suspense } from "react"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Metadata } from "next"
import { Spinner } from "@/components/ui/spinner"

export const metadata: Metadata = {
  title: 'Redefinir Senha | Definance',
  description: 'Escolha uma nova senha para sua conta Definance.',
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <Suspense fallback={<Spinner className="h-8 w-8 text-primary" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}