import { RegisterForm } from "@/components/auth/register-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function CadastroPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  )
}
