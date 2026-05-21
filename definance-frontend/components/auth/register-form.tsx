"use client"

import { useState } from "react"
import { Eye, EyeOff, Check, Circle, X, AlertCircle, Mail, User, Phone, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/auth-provider"
import { toast } from "sonner"

export function RegisterForm() {
  const router = useRouter()
  const { register, loginWithGoogle, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    ddi: "55",
    phone: "",
    password: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    
    // Validação rigorosa de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Por favor, insira um e-mail válido (ex: seu@email.com)")
      return
    }
    const hasMinLength = formData.password.length >= 8
    const hasUpperCase = /[A-Z]/.test(formData.password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)

    if (!hasMinLength || !hasUpperCase || !hasSpecialChar) {
      setError("A senha deve ter no mínimo 8 caracteres, uma letra maiúscula e um caractere especial.")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      return
    }
    
    setIsLoading(true)
    
    // Junta o DDI com o número de telefone (limpando caracteres não numéricos)
    const finalPhone = formData.ddi + formData.phone.replace(/\D/g, "")
    
    const result = await register({
      ...formData,
      phone: finalPhone
    })
    
    if (result.success) {
      await logout()
      toast.success("Conta criada com sucesso!", {
        description: "Agora faça login com suas credenciais para continuar.",
      })
      router.push("/login")
    } else {
      setError(result.message || "Erro ao criar conta")
      setIsLoading(false)
    }
  }

  async function handleGoogleRegister() {
    setIsLoading(true)
    await loginWithGoogle()
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Criar Conta</h1>
        <p className="text-sm text-muted-foreground">
          Preencha os campos abaixo para começar.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-[13px] font-bold text-foreground">Nome</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
              <Input
                id="firstName"
                type="text"
                placeholder="Nome"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                disabled={isLoading}
                className="bg-secondary/50 border-border h-12 pl-10 focus:ring-emerald-500/20 text-foreground rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-[13px] font-bold text-foreground">Sobrenome</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Sobrenome"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              disabled={isLoading}
              className="bg-background dark:bg-secondary/50 border-input dark:border-border h-12 focus:ring-emerald-500/20 text-foreground rounded-xl"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[13px] font-bold text-foreground">E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
              className="bg-background dark:bg-secondary/50 border-input dark:border-border h-12 pl-10 focus:ring-emerald-500/20 text-foreground rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-[13px] font-bold text-foreground">Telefone</Label>
          <div className="flex gap-3">
            {/* Seletor de DDI com Dropdown */}
            <div className="relative w-[160px] shrink-0 group">
              <select
                className="w-full h-12 bg-background dark:bg-secondary/50 border border-input dark:border-border hover:border-emerald-500/50 transition-all rounded-xl pl-12 pr-8 text-xs font-bold text-transparent cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none relative z-20"
                value={formData.ddi}
                onChange={(e) => setFormData({ ...formData, ddi: e.target.value })}
              >
                {/* Américas e Caribe */}
                <optgroup label="Américas e Caribe" className="bg-background dark:bg-[#0f0f0f] text-foreground dark:text-white text-left">
                  <option value="55" className="text-left">🇧🇷 BR +55 Brasil</option>
                  <option value="1" className="text-left">🇺🇸 US +1 Estados Unidos</option>
                  <option value="1-CA" className="text-left">🇨🇦 CA +1 Canadá</option>
                  <option value="52" className="text-left">🇲🇽 MX +52 México</option>
                  <option value="54" className="text-left">🇦🇷 AR +54 Argentina</option>
                  <option value="56" className="text-left">🇨🇱 CL +56 Chile</option>
                  <option value="57" className="text-left">🇨🇴 CO +57 Colômbia</option>
                  <option value="51" className="text-left">🇵🇪 PE +51 Peru</option>
                  <option value="58" className="text-left">🇻🇪 VE +58 Venezuela</option>
                  <option value="593" className="text-left">🇪🇨 EC +593 Equador</option>
                  <option value="591" className="text-left">🇧🇴 BO +591 Bolívia</option>
                  <option value="595" className="text-left">🇵🇾 PY +595 Paraguai</option>
                  <option value="598" className="text-left">🇺🇾 UY +598 Uruguai</option>
                  <option value="507" className="text-left">🇵🇦 PA +507 Panamá</option>
                  <option value="506" className="text-left">🇨🇷 CR +506 Costa Rica</option>
                  <option value="503" className="text-left">🇸🇻 SV +503 El Salvador</option>
                  <option value="502" className="text-left">🇬🇹 GT +502 Guatemala</option>
                  <option value="504" className="text-left">🇭🇳 HN +504 Honduras</option>
                  <option value="505" className="text-left">🇳🇮 NI +505 Nicarágua</option>
                  <option value="53" className="text-left">🇨🇺 CU +53 Cuba</option>
                  <option value="509" className="text-left">🇭🇹 HT +509 Haiti</option>
                  {/* Caribe */}
                  <option value="1-PR" className="text-left">🇵🇷 PR +1 Porto Rico</option>
                  <option value="1-BS" className="text-left">🇧🇸 BS +1 Bahamas</option>
                  <option value="1-BB" className="text-left">🇧🇧 BB +1 Barbados</option>
                  <option value="1-DO" className="text-left">🇩🇴 DO +1 Rep. Dominicana</option>
                  <option value="1-JM" className="text-left">🇯🇲 JM +1 Jamaica</option>
                  <option value="1-TT" className="text-left">🇹🇹 TT +1 Trinidad e Tobago</option>
                  <option value="297" className="text-left">🇦🇼 AW +297 Aruba</option>
                  <option value="599" className="text-left">🇨🇼 CW +599 Curaçao</option>
                  <option value="501" className="text-left">🇧🇿 BZ +501 Belize</option>
                </optgroup>

                {/* Europa */}
                <optgroup label="Europa" className="bg-background dark:bg-[#0f0f0f] text-foreground dark:text-white text-left">
                  <option value="351" className="text-left">🇵🇹 PT +351 Portugal</option>
                  <option value="34" className="text-left">🇪🇸 ES +34 Espanha</option>
                  <option value="44" className="text-left">🇬🇧 GB +44 Reino Unido</option>
                  <option value="33" className="text-left">🇫🇷 FR +33 França</option>
                  <option value="49" className="text-left">🇩🇪 DE +49 Alemanha</option>
                  <option value="39" className="text-left">🇮🇹 IT +39 Itália</option>
                  <option value="41" className="text-left">🇨🇭 CH +41 Suíça</option>
                  <option value="31" className="text-left">🇳🇱 NL +31 Países Baixos</option>
                  <option value="32" className="text-left">🇧🇪 BE +32 Bélgica</option>
                  <option value="43" className="text-left">🇦🇹 AT +43 Áustria</option>
                  <option value="352" className="text-left">🇱🇺 LU +352 Luxemburgo</option>
                  <option value="30" className="text-left">🇬🇷 GR +30 Grécia</option>
                  <option value="420" className="text-left">🇨🇿 CZ +420 Rep. Tcheca</option>
                  <option value="36" className="text-left">🇭🇺 HU +36 Hungria</option>
                  <option value="40" className="text-left">🇷🇴 RO +40 Romênia</option>
                  <option value="385" className="text-left">🇭🇷 HR +385 Croácia</option>
                  <option value="354" className="text-left">🇮🇸 IS +354 Islândia</option>
                  <option value="375" className="text-left">🇧🇾 BY +375 Bielorrússia</option>
                  <option value="373" className="text-left">🇲🇩 MD +373 Moldávia</option>
                  <option value="355" className="text-left">🇦🇱 AL +355 Albânia</option>
                  <option value="387" className="text-left">🇧🇦 BA +387 Bósnia</option>
                  <option value="382" className="text-left">🇲🇪 ME +382 Montenegro</option>
                  <option value="389" className="text-left">🇲🇰 MK +389 Macedônia</option>
                  <option value="383" className="text-left">🇽🇰 XK +383 Kosovo</option>
                  <option value="7" className="text-left">🇷🇺 RU +7 Rússia</option>
                </optgroup>

                {/* Ásia e Oceania */}
                <optgroup label="Ásia e Oceania" className="bg-background dark:bg-[#0f0f0f] text-foreground dark:text-white text-left">
                  <option value="90" className="text-left">🇹🇷 TR +90 Turquia</option>
                  <option value="82" className="text-left">🇰🇷 KR +82 Coreia do Sul</option>
                  <option value="972" className="text-left">🇮🇱 IL +972 Israel</option>
                  <option value="81" className="text-left">🇯🇵 JP +81 Japão</option>
                  <option value="86" className="text-left">🇨🇳 CN +86 China</option>
                  <option value="91" className="text-left">🇮🇳 IN +91 Índia</option>
                  <option value="66" className="text-left">🇹🇭 TH +66 Tailândia</option>
                  <option value="84" className="text-left">🇻🇳 VN +84 Vietnã</option>
                  <option value="60" className="text-left">🇲🇾 MY +60 Malásia</option>
                  <option value="966" className="text-left">🇸🇦 SA +966 Arábia Saudita</option>
                  <option value="971" className="text-left">🇦🇪 AE +971 Emirados Árabes</option>
                  <option value="61" className="text-left">🇦🇺 AU +61 Austrália</option>
                  <option value="64" className="text-left">🇳🇿 NZ +64 Nova Zelândia</option>
                </optgroup>

                {/* África */}
                <optgroup label="África" className="bg-background dark:bg-[#0f0f0f] text-foreground dark:text-white text-left">
                  <option value="27" className="text-left">🇿🇦 ZA +27 África do Sul</option>
                  <option value="244" className="text-left">🇦🇴 AO +244 Angola</option>
                  <option value="258" className="text-left">🇲🇿 MZ +258 Moçambique</option>
                  <option value="238" className="text-left">🇨🇻 CV +238 Cabo Verde</option>
                  <option value="245" className="text-left">🇬🇼 GW +245 Guiné-Bissau</option>
                  <option value="239" className="text-left">🇸🇹 ST +239 São Tomé</option>
                  <option value="20" className="text-left">🇪🇬 EG +20 Egito</option>
                  <option value="212" className="text-left">🇲🇦 MA +212 Marrocos</option>
                </optgroup>
              </select>

              {/* Camada Visual de Exibição */}
              <div className="absolute inset-0 flex items-center pl-4 pr-8 pointer-events-none z-30">
                <span className="text-xs font-black text-foreground dark:text-white flex items-center gap-2 truncate">
                  <div className="w-5 h-3.5 shrink-0 overflow-hidden rounded-sm relative bg-foreground/10 dark:bg-white/10">
                    <img 
                      src={`https://flagcdn.com/w40/${
                        (() => {
                          const mapping: Record<string, string> = {
                            "55": "br", "1": "us", "1-CA": "ca", "52": "mx", "54": "ar", "56": "cl", 
                            "57": "co", "51": "pe", "58": "ve", "593": "ec", "591": "bo", "595": "py", 
                            "598": "uy", "507": "pa", "506": "cr", "503": "sv", "502": "gt", "504": "hn", 
                            "505": "ni", "53": "cu", "509": "ht", "1-PR": "pr", "1-BS": "bs", "1-BB": "bb", 
                            "1-DO": "do", "1-JM": "jm", "1-TT": "tt", "1-KY": "ky", "1-BM": "bm", "1-GD": "gd", 
                            "1-VC": "vc", "1-LC": "lc", "1-AG": "ag", "1-DM": "dm", "297": "aw", "599": "cw", 
                            "590": "gp", "596": "mq", "592": "gy", "597": "sr", "501": "bz", "351": "pt", 
                            "34": "es", "44": "gb", "33": "fr", "49": "de", "39": "it", "41": "ch", 
                            "31": "nl", "32": "be", "43": "at", "352": "lu", "353": "ie", "30": "gr", 
                            "420": "cz", "36": "hu", "40": "ro", "359": "bg", "385": "hr", "381": "rs", 
                            "421": "sk", "386": "si", "354": "is", "356": "mt", "376": "ad", "377": "mc", 
                            "7": "ru", "375": "by", "373": "md", "355": "al", "387": "ba", "382": "me", 
                            "389": "mk", "383": "xk", "90": "tr", "82": "kr", "972": "il", "81": "jp", 
                            "86": "cn", "91": "in", "66": "th", "84": "vn", "60": "my", "966": "sa", 
                            "971": "ae", "61": "au", "64": "nz", "27": "za", "244": "ao", "258": "mz", 
                            "238": "cv", "245": "gw", "239": "st", "20": "eg", "212": "ma"
                          };
                          return mapping[formData.ddi] || "un";
                        })()
                      }.png`}
                      alt="Flag"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="shrink-0 text-foreground/90 dark:text-white/90">
                    +{formData.ddi.split("-")[0]}
                  </span>
                  <span className="opacity-40 font-medium truncate hidden sm:inline">
                    {formData.ddi === "55" ? "Brasil" : 
                     formData.ddi === "1" ? "EUA" : 
                     formData.ddi === "1-CA" ? "Canadá" : 
                     formData.ddi === "351" ? "Portugal" : 
                     formData.ddi === "244" ? "Angola" : 
                     formData.ddi === "258" ? "Moçambique" : "País"}
                  </span>
                </span>
              </div>

              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 z-30">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Campo de Número Local */}
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
              <Input
                id="phone"
                type="tel"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "")
                  let formatted = value
                  if (value.length > 2) formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`
                  if (value.length > 7) formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`
                  setFormData({ ...formData, phone: formatted })
                }}
                required
                disabled={isLoading}
                className="bg-secondary/50 border-border h-12 pl-10 focus:ring-emerald-500/20 text-foreground rounded-xl font-medium placeholder:opacity-30"
              />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/50 font-medium px-1">
            Selecione o DDI do país e informe apenas o número local.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-[13px] font-bold text-foreground">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={isLoading}
              className="bg-secondary/50 border-border h-12 pl-10 pr-10 focus:ring-emerald-500/20 text-foreground rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          
          <div className="mt-2 grid grid-cols-1 gap-1.5 px-1">
            {[
              { label: "Mínimo 8 caracteres", met: formData.password.length >= 8 },
              { label: "Letra maiúscula", met: /[A-Z]/.test(formData.password) },
              { label: "Caractere especial", met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) },
            ].map((req, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] uppercase tracking-wider">
                {req.met ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Circle className="h-3 w-3 text-muted-foreground/30" />
                )}
                <span className={req.met ? "text-emerald-500" : "text-muted-foreground/50"}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-[13px] font-bold text-foreground">Confirmar Senha</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              disabled={isLoading}
              className="bg-secondary/50 border-border h-12 pr-10 focus:ring-emerald-500/20 text-foreground rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="h-12 w-full bg-emerald-600 hover:bg-emerald-500 text-white transition-all font-semibold text-base rounded-xl shadow-lg shadow-emerald-900/20 mt-4 cursor-pointer" 
          disabled={isLoading}
        >
          {isLoading ? <Spinner className="h-4 w-4" /> : "Criar Conta →"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full bg-border" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
          <span className="bg-background px-3 text-muted-foreground/50 font-normal">ou continue com</span>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="h-12 w-full bg-secondary/20 border-border text-foreground hover:bg-secondary/40 rounded-xl font-semibold cursor-pointer" 
        onClick={handleGoogleRegister}
        disabled={isLoading}
      >
        <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Cadastrar com Google
      </Button>

      <div className="text-center text-base">
        <span className="text-muted-foreground">Já tem uma conta?</span>{" "}
        <Link href="/login" className="font-bold text-emerald-500 hover:text-emerald-400 transition-colors">
          Entrar
        </Link>
      </div>

      <div className="mt-4 text-center text-[10px] leading-relaxed text-muted-foreground/40">
        Ao continuar, você concorda com nossos <Link href="/termos" className="underline hover:text-foreground transition-colors">Termos de Serviço</Link> e <Link href="/privacidade" className="underline hover:text-foreground transition-colors">Política de Privacidade</Link>.
      </div>
    </div>
  )
}