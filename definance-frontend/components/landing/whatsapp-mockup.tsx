"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MoreVertical, Phone, Video, CheckCheck, Mic, Paperclip, Smile, ChevronLeft, Camera } from "lucide-react"

interface Message {
  id: number
  text: string
  sender: "user" | "ai"
  time: string
  category?: string
}

const conversation: Message[] = [
  {
    id: 1,
    text: "Definance pronto! Como posso ajudar a organizar sua vida financeira hoje? 💸",
    sender: "ai",
    time: "10:15"
  },
  {
    id: 2,
    text: "Gastei 120 reais no mercado agora no crédito",
    sender: "user",
    time: "10:16"
  },
  {
    id: 3,
    text: "Entendido! 🛒 R$ 120,00 no Supermercado registrado com sucesso.",
    sender: "ai",
    time: "10:16",
    category: "Alimentação"
  },
  {
    id: 4,
    text: "Isso representa 12% do seu orçamento de alimentação. Quer que eu projete seus gastos até o fim do mês? 🔮",
    sender: "ai",
    time: "10:16"
  }
]

export function WhatsAppMockup() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [step, setStep] = useState(0)
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    if (step < conversation.length) {
      const currentMsg = conversation[step]
      
      // Se for a IA respondendo, mostra o "digitando" antes
      if (currentMsg.sender === "ai") {
        setIsTyping(true)
        const typingDuration = currentMsg.text.length * 30 // Simula tempo de digitação
        
        const timeout = setTimeout(() => {
          setIsTyping(false)
          setMessages(prev => [...prev, currentMsg])
          setStep(step + 1)
        }, Math.max(1500, typingDuration))
        return () => clearTimeout(timeout)
      } else {
        // Se for o usuário, espera um pouco e envia
        const timeout = setTimeout(() => {
          setMessages(prev => [...prev, currentMsg])
          setStep(step + 1)
        }, 2000)
        return () => clearTimeout(timeout)
      }
    } else {
      // Reinicia a conversa após um tempo
      const timeout = setTimeout(() => {
        setMessages([])
        setStep(0)
        setCycle(prev => prev + 1)
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [step])

  return (
    <div className="relative mx-auto w-[320px] h-[640px] bg-[#050505] rounded-[3.5rem] border-[12px] border-[#0a0a0a] shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_20px_50px_rgba(0,0,0,0.8)] font-sans select-none ring-1 ring-white/10 group">
      
      {/* Physical Buttons */}
      <div className="absolute -left-[14px] top-24 w-[3px] h-12 bg-gradient-to-r from-[#0a0a0a] to-[#2a2a2a] rounded-l-sm border-y border-l border-white/5" /> {/* Volume Up */}
      <div className="absolute -left-[14px] top-40 w-[3px] h-12 bg-gradient-to-r from-[#0a0a0a] to-[#2a2a2a] rounded-l-sm border-y border-l border-white/5" /> {/* Volume Down */}
      <div className="absolute -right-[14px] top-32 w-[3px] h-20 bg-gradient-to-l from-[#0a0a0a] to-[#2a2a2a] rounded-r-sm border-y border-r border-white/5" /> {/* Power Button */}

      <div className="relative h-full w-full overflow-hidden rounded-[2.8rem]">
        {/* WhatsApp Header */}
        <div className="bg-[#202c33] p-4 pt-10 flex items-center gap-2 text-white relative z-50">
          <ChevronLeft className="h-5 w-5 text-[#00a884]" />
          <div className="h-9 w-9 rounded-full bg-background flex items-center justify-center overflow-hidden border border-border shadow-inner p-1.5">
             <img src="/logo1.png" alt="Definance Logo" className="h-full w-full object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h4 className="text-[13px] font-bold truncate">Definance</h4>
              <div className="h-3.5 w-3.5 bg-[#00a884] rounded-full flex items-center justify-center shadow-sm">
                <CheckCheck className="h-2 w-2 text-[#0b141a]" />
              </div>
            </div>
            <p className="text-[10px] text-[#00a884] font-medium animate-pulse">online agora</p>
          </div>
        <div className="flex items-center gap-3 text-white/70">
          <Video className="h-4 w-4" />
          <Phone className="h-4 w-4" />
          <MoreVertical className="h-4 w-4" />
        </div>
      </div>

      {/* Chat Wallpaper Background */}
      <div className="absolute inset-0 top-[88px] bottom-0 opacity-[0.04] pointer-events-none" 
           style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }} />

      {/* Messages Area */}
      <div className="h-[492px] overflow-y-auto p-4 flex flex-col gap-2 no-scrollbar relative z-10">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, index) => (
            <motion.div
              key={`${cycle}-${msg.id}-${index}`}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className={`max-w-[85%] flex flex-col ${msg.sender === "user" ? "self-end items-end" : "self-start items-start"}`}
            >
              <div className={`p-2.5 rounded-2xl text-[13px] shadow-sm relative ${
                msg.sender === "user" 
                  ? "bg-[#005c4b] text-white rounded-tr-none" 
                  : "bg-[#202c33] text-white rounded-tl-none"
              }`}>
                {msg.text}
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[9px] opacity-50 uppercase">{msg.time}</span>
                  {msg.sender === "user" && <CheckCheck className="h-3 w-3 text-[#53bdeb]" />}
                </div>
              </div>
              
              {msg.category && (
                <div className="flex gap-1 mt-1">
                   <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] text-primary font-bold">
                     {msg.category}
                   </div>
                   <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-white/40 font-bold">
                     Finanças
                   </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="self-start bg-[#202c33] p-3 rounded-2xl rounded-tl-none"
          >
            <div className="flex gap-1">
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="h-1.5 w-1.5 bg-white/40 rounded-full" />
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="h-1.5 w-1.5 bg-white/40 rounded-full" />
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="h-1.5 w-1.5 bg-white/40 rounded-full" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Bar */}
      <div className="absolute bottom-5 left-0 right-0 px-3 flex items-center gap-2 z-20">
        <div className="flex-1 bg-[#2a3942] rounded-full h-8 flex items-center px-2.5 gap-1.5 shadow-lg">
          <Smile className="h-3.5 w-3.5 text-white/40" />
          <div className="flex-1 text-white/20 text-[11px]">Mensagem</div>
          <Paperclip className="h-3.5 w-3.5 text-white/40 -rotate-45" />
          <Camera className="h-3.5 w-3.5 text-white/40" />
        </div>
        <div className="h-8 w-8 rounded-full bg-[#00a884] flex items-center justify-center shadow-lg active:scale-90 transition-transform">
          <Mic className="h-3.5 w-3.5 text-[#0b141a]" />
        </div>
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/10 rounded-full" />
      </div>
    </div>
  )
}
