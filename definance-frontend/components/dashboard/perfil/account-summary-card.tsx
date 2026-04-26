"use client"
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface AccountSummaryCardProps {
  user: any
}

export const AccountSummaryCard = ({ user }: AccountSummaryCardProps) => {
  return (
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
  )
}