"use client"

import { useState, useEffect } from "react"
import { Shield, UserCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { ImageCropperModal } from "@/components/dashboard/perfil/image-cropper-modal"
import { BillsAlert } from "@/components/dashboard/bills-alert"
import { PersonalInfoForm } from "@/components/dashboard/perfil/personal-info-form"
import { PasswordChangeForm } from "@/components/dashboard/perfil/password-change-form"
import { ProfileAvatarSection } from "@/components/dashboard/perfil/profile-avatar-section"
import { AccountSummaryCard } from "@/components/dashboard/perfil/account-summary-card"

export default function PerfilPage() {
  const { user, updateProfile, changePassword, updateAvatar, removeAvatar, isActionLoading } = useAuth()
  
  const isGoogleAccount = !!user?.avatar?.includes("googleusercontent.com")

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isCropperOpen, setIsCropperOpen] = useState(false)

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  // Sincronizar estado local com os dados do usuário do AuthProvider
  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: formatPhoneNumber(user.phone || ""),
      })
    }
  }, [user])

  function formatPhoneNumber(value: string) {
    if (!value) return ""
    const digits = value.replace(/\D/g, "")
    const len = digits.length
    
    if (len <= 2) return digits
    if (len <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Limpar formatação antes de enviar
    const cleanPhone = profile.phone.replace(/\D/g, "")

    const result = await updateProfile({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: isGoogleAccount ? null : cleanPhone,
    })

    if (result.success) {
      toast.success("Perfil atualizado com sucesso!")
    } else {
      toast.error(result.message || "Erro ao atualizar perfil")
      
      // Restaurar dados originais do contexto se a atualização falhar
      if (user) {
        setProfile({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone ? formatPhoneNumber(user.phone) : "",
        })
      }
    }
  }

  const handleChangePassword = async (passwords: any) => {
    if (passwords.newPassword && passwords.newPassword !== passwords.confirmNewPassword) {
      return false
    }

    if (passwords.newPassword.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres")
      return false
    }

    const result = await changePassword({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    })

    if (result.success) {
      toast.success("Senha alterada com sucesso!")
      return true
    } else {
      toast.error(result.message || "Erro ao alterar senha")
      return false
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione um arquivo de imagem válido.")
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit for raw image
      toast.error("A imagem deve ter no máximo 5MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setSelectedImage(reader.result as string)
      setIsCropperOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    const result = await updateAvatar(croppedBlob)
    if (result.success) {
      toast.success("Foto de perfil atualizada!")
    } else {
      toast.error(result.message || "Erro ao atualizar foto")
    }
  }

  const handleRemoveAvatar = async () => {
    if (!window.confirm("Deseja realmente remover sua foto de perfil?")) return

    const result = await removeAvatar()
    if (result.success) {
      toast.success("Foto de perfil removida!")
    } else {
      toast.error(result.message || "Erro ao remover foto")
    }
  }

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.firstName 
      ? user.firstName.slice(0, 2).toUpperCase()
      : "US"

  return (
    <div className="relative space-y-6">
      <BillsAlert />
      <ImageCropperModal
        image={selectedImage}
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        onCropComplete={handleCropComplete}
      />

      {isActionLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-[2px] transition-all duration-300">
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <Spinner className="h-10 w-10 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Carregando...</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UserCircle className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Perfil</h1>
          </div>
          <p className="text-muted-foreground text-sm">Gerencie suas informações pessoais e segurança</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
          <Shield className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{user?.role === 'admin' ? 'Administrador' : 'Membro'}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <PersonalInfoForm 
            profile={profile}
            setProfile={setProfile}
            isGoogleAccount={isGoogleAccount}
            isActionLoading={isActionLoading}
            onSubmit={handleUpdateProfile}
            formatPhoneNumber={formatPhoneNumber}
          />

          {!isGoogleAccount && (
            <PasswordChangeForm 
              isActionLoading={isActionLoading}
              onSubmit={handleChangePassword}
            />
          )}
        </div>

        <div className="space-y-6">
          <ProfileAvatarSection 
            user={user}
            initials={initials}
            isActionLoading={isActionLoading}
            isGoogleAccount={isGoogleAccount}
            handleFileChange={handleFileChange}
            handleRemoveAvatar={handleRemoveAvatar}
          />

          <AccountSummaryCard user={user} />
        </div>
      </div>
    </div>
  )
}