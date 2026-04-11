"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  Palette, 
  Bell, 
  Shield, 
  Database, 
  Monitor, 
  Moon, 
  Sun, 
  Download,
  Trash2,
  Lock,
  Smartphone,
  Clock
} from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ConfiguracoesPage() {
  const [isActionLoading, setIsActionLoading] = useState(false)
  
  // Estados para Mockup
  const [theme, setTheme] = useState("dark")
  const [discreetMode, setDiscreetMode] = useState(false)
  
  const [notifs, setNotifs] = useState({
    expenses: true,
    dueDates: true,
    weeklyReport: false,
    marketing: false
  })

  const [security, setSecurity] = useState({
    twoFactor: false,
    autoLogout: "30"
  })

  const handleSave = () => {
    setIsActionLoading(true)
    setTimeout(() => {
      setIsActionLoading(false)
      toast.success("Configurações salvas com sucesso!")
    }, 1000)
  }

  return (
    <div className="relative space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Personalize sua experiência no Definance</p>
        </div>
        <Button onClick={handleSave} disabled={isActionLoading} className="bg-primary hover:bg-primary/70 text-primary-foreground cursor-pointer">
          Salvar Alterações
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Preferências de Exibição */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle className="text-base text-card-foreground">Preferências de Exibição</CardTitle>
            </div>
            <CardDescription>Personalize o visual da plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="max-w-[70%]">
                  <Label className="text-card-foreground">Tema do Sistema</Label>
                  <p className="text-xs text-muted-foreground">Escolha entre o modo claro, escuro ou automático</p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-[120px] bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-3 w-3" />
                        <span>Claro</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-3 w-3" />
                        <span>Escuro</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-3 w-3" />
                        <span>Sistema</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />

              <div className="flex items-center justify-between">
                <div className="max-w-[75%]">
                  <Label className="text-card-foreground">Modo Discreto</Label>
                  <p className="text-xs text-muted-foreground">Oculta valores monetários sensíveis na tela inicial para privacidade em público</p>
                </div>
                <Switch 
                  checked={discreetMode} 
                  onCheckedChange={setDiscreetMode}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-base text-card-foreground">Notificações</CardTitle>
            </div>
            <CardDescription>Gerencie como você recebe alertas e relatórios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-card-foreground">Alertas de Gastos</Label>
                <p className="text-xs text-muted-foreground">Notificar ao atingir 80% do teto mensal de categorias</p>
              </div>
              <Switch 
                checked={notifs.expenses} 
                onCheckedChange={(v) => setNotifs({...notifs, expenses: v})}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-card-foreground">Contas a Vencer</Label>
                <p className="text-xs text-muted-foreground">Avisar 2 dias antes do vencimento de boletos registrados</p>
              </div>
              <Switch 
                checked={notifs.dueDates} 
                onCheckedChange={(v) => setNotifs({...notifs, dueDates: v})}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-card-foreground">Relatório Semanal</Label>
                <p className="text-xs text-muted-foreground">Receber um resumo financeiro por e-mail toda segunda-feira</p>
              </div>
              <Switch 
                checked={notifs.weeklyReport} 
                onCheckedChange={(v) => setNotifs({...notifs, weeklyReport: v})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Gestão de Dados */}
        <Card className="border-border/50 flex flex-col h-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle className="text-base text-card-foreground">Gestão de Dados</CardTitle>
            </div>
            <CardDescription>Controle total sobre as suas informações</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="text-xs h-auto py-12 px-2 flex flex-col gap-3 cursor-pointer hover:border-primary/50 transition-all group">
                <Download className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-semibold">Exportar (CSV)</span>
              </Button>
              <Button variant="outline" className="text-xs h-auto py-12 px-2 flex flex-col gap-3 cursor-pointer hover:border-emerald-500/50 transition-all group">
                <Download className="h-6 w-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">Exportar (Excel)</span>
              </Button>
            </div>
            </div>
            
            <div className="mt-auto pt-4">
              <Separator className="mb-4" />
              <Button variant="outline" className="w-full text-xs text-muted-foreground hover:text-destructive hover:border-destructive/50 cursor-pointer border-border/40 transition-all h-10">
                <Trash2 className="mr-2 h-3 w-3" />
                Limpar Dados de Transações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}