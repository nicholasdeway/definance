"use client"
import React, { useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Trash2, CheckCircle2 } from "lucide-react"

interface ProfileAvatarSectionProps {
  user: any
  initials: string
  isActionLoading: boolean
  isGoogleAccount: boolean
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleRemoveAvatar: () => Promise<void>
}

export const ProfileAvatarSection = ({
  user,
  initials,
  isActionLoading,
  isGoogleAccount,
  handleFileChange,
  handleRemoveAvatar
}: ProfileAvatarSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
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
  )
}