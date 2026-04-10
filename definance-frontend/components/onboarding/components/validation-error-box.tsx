import React from "react"
import { motion } from "framer-motion"
import { Info, X } from "lucide-react"

interface ValidationErrorBoxProps {
  errors: string[]
  onClose: () => void
}

export const ValidationErrorBox = ({ errors, onClose }: ValidationErrorBoxProps) => {
  if (errors.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive relative"
    >
      <div className="flex gap-3">
        <Info className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-sm mb-1 uppercase tracking-wider">Atenção</p>
          <ul className="text-sm space-y-1 list-disc list-inside opacity-90">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-destructive/10 rounded-full transition-colors self-start cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}
