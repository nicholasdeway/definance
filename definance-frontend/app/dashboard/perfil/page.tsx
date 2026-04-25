"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Camera, Save, Trash2, Shield, Loader2, Mail, Phone, Eye, EyeOff, Check, Circle, X } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { ImageCropperModal } from "@/components/dashboard/perfil/image-cropper-modal"
import { BillsAlert } from "@/components/dashboard/bills-alert"

export default function PerfilPage() {
  const { user, updateProfile, changePassword, updateAvatar, removeAvatar, isActionLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isGoogleAccount = user?.avatar?.includes("googleusercontent.com")

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isCropperOpen, setIsCropperOpen] = useState(false)

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwords.newPassword && passwords.newPassword !== passwords.confirmNewPassword) {
      return
    }

    if (passwords.newPassword.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres")
      return
    }

    const result = await changePassword({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    })

    if (result.success) {
      toast.success("Senha alterada com sucesso!")
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      })
    } else {
      toast.error(result.message || "Erro ao alterar senha")
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
    
    // Reset input value to allow selecting same file again
    if (fileInputRef.current) fileInputRef.current.value = ""
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
      {/* Image Cropper Modal */}
      <ImageCropperModal
        image={selectedImage}
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        onCropComplete={handleCropComplete}
      />

      {/* Overlay de carregamento (Spinner do Dashboard) */}
      {isActionLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-[2px] transition-all duration-300">
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <Spinner className="h-10 w-10 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Carregando...</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
          <Shield className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{user?.role === 'admin' ? 'Administrador' : 'Membro'}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground">Informações Pessoais</CardTitle>
              <CardDescription>Atualize seus dados pessoais</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      required
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      required
                      placeholder="Seu sobrenome"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    Email
                    {isGoogleAccount && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Google</span>}
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="pl-9 bg-muted/30"
                      title="O email não pode ser alterado."
                    />
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">O endereço de e-mail é usado para login e não pode ser alterado por segurança.</p>
                </div>
                
                {!isGoogleAccount && (
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: formatPhoneNumber(e.target.value) })}
                        placeholder="(00) 00000-0000"
                        className="pl-9"
                        maxLength={15}
                      />
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="bg-primary/70 text-primary-foreground hover:bg-primary min-w-[140px] cursor-pointer"
                  disabled={isActionLoading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Salvar alterações
                </Button>
              </form>
            </CardContent>
          </Card>

          {!isGoogleAccount && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base text-card-foreground">Alterar Senha</CardTitle>
                <CardDescription>Mantenha sua conta segura</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currentPassword">Senha atual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwords.currentPassword}
                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                        required
                        placeholder="••••••••"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="newPassword">Nova senha</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwords.newPassword}
                          onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                          required
                          placeholder="••••••••"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirmNewPassword">Confirmar nova senha</Label>
                      <div className="relative">
                        <Input
                          id="confirmNewPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwords.confirmNewPassword}
                          onChange={(e) => setPasswords({ ...passwords, confirmNewPassword: e.target.value })}
                          required
                          placeholder="••••••••"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 space-y-1.5 px-1">
                    {[
                      { label: "Pelo menos 8 caracteres", met: passwords.newPassword.length >= 8 },
                      { label: "Uma letra maiúscula", met: /[A-Z]/.test(passwords.newPassword) },
                      { label: "Um caractere especial (!@#$%, etc)", met: /[!@#$%^&*(),.?":{}|<>]/.test(passwords.newPassword) },
                    ].map((req, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] transition-colors duration-200">
                        {req.met ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Circle className="h-3 w-3 text-muted-foreground/40" />
                        )}
                        <span className={req.met ? "text-emerald-500/90" : "text-muted-foreground"}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                    
                    {passwords.confirmNewPassword && (
                      <div className="flex items-center gap-1.5 text-[11px] transition-all duration-200">
                        {passwords.newPassword === passwords.confirmNewPassword ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-500" />
                            <span className="text-emerald-500/90 italic">As senhas correspondem</span>
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3 text-destructive" />
                            <span className="text-destructive/90 italic">As senhas não correspondem</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    variant="outline"
                    disabled={isActionLoading}
                  >
                    Alterar senha
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

        </div>

        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground">Foto de Perfil</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-background shadow-2xl transition-transform group-hover:scale-[1.02]">
                  <AvatarImage src={user?.avatar || ""} alt="Avatar" />
                  <AvatarFallback className="bg-primary text-3xl text-primary-foreground">{initials}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 flex gap-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <Button
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isActionLoading}
                    className="h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform"
                    title="Alterar foto"
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                  {user?.avatar && !user.avatar.includes("googleusercontent") && (
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={handleRemoveAvatar}
                      disabled={isActionLoading}
                      className="h-10 w-10 rounded-full shadow-lg hover:scale-105 transition-transform"
                      title="Remover foto"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
              <p className="mt-6 text-center text-xs text-muted-foreground max-w-[200px]">
                Imagens em formato JPG ou PNG (max. 2MB).
              </p>
              {isGoogleAccount && (
                <div className="mt-4 flex items-center gap-1.5 text-[10px] text-primary font-bold bg-primary/5 px-3 py-1.5 rounded-full border border-primary/20 uppercase tracking-tighter">
                  <CheckCircle2 className="h-3 w-3" />
                  Sincronizado via Google
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground">Resumo da Conta</CardTitle>
              <CardDescription>Informações gerais do seu plano</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Conta criada em</span>
                <span className="font-semibold text-card-foreground">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "---"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Plano Atual</span>
                <span className="font-bold text-primary uppercase text-[10px] tracking-widest bg-primary/10 px-2 py-0.5 rounded border border-primary/20">Free</span>
              </div>
              <Separator className="my-2" />
              <Button variant="ghost" className="w-full text-xs font-bold text-muted-foreground/70" disabled>
                Upgrade disponível em breve
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>

    </div>
  )
}

function CheckCircle2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}