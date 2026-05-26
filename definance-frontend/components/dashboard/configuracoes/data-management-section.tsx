"use client"

import React, { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import {
  ArrowDownLeft,
  ArrowUpRight,
  History,
  CalendarDays,
  CreditCard,
  Target,
  Tags,
  Database,
  Download,
  FileText
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface ExportItem {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  apiType: string
}

interface IncomeExport {
  id: string
  name: string
  amount: number
  type: string
  date: string
  isRecurring: boolean
}

interface ExpenseExport {
  id: string
  name: string
  amount: number
  category: string
  date: string
  expenseType: string
  status: string
  dueDate?: string
}

interface HistoryExport {
  date: string
  name: string
  amount: number
  type: string
  category: string
}

interface BillExport {
  id: string
  name: string
  amount: number
  category: string
  dueDate?: string
  dueDay?: number
  status: string
}

interface GoalExport {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  endDate?: string
}

interface CategoryExport {
  id: string
  name: string
  type: string
}

interface ExportDataResponse {
  incomes: IncomeExport[]
  expenses: ExpenseExport[]
  history: HistoryExport[]
  dailyExpenses: ExpenseExport[]
  bills: BillExport[]
  goals: GoalExport[]
  categories: CategoryExport[]
}

interface GoogleTokenResponse {
  access_token: string
  error?: string
}

const GOOGLE_CLIENT_ID = "917547352580-fr7v6rttq865gc6ga8tqjgvrrj8j8ndn.apps.googleusercontent.com"

const formatDate = (dateStr: string): string => {
  if (!dateStr) return ""
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`
  }
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ""
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(val)
}

const getBase64ImageFromUrl = async (imageUrl: string): Promise<string> => {
  const res = await fetch(imageUrl)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener("load", () => resolve(reader.result as string), false)
    reader.onerror = () => reject(new Error("Failed to read image blob"))
    reader.readAsDataURL(blob)
  })
}

const formatPdfText = (s: string | null | undefined): string => {
  if (!s) return ""
  const trimmed = s.trim()
  const lowered = trimmed.toLowerCase()
  if (lowered === "clt" || lowered === "pj") {
    return trimmed.toUpperCase()
  }
  if (lowered === "outros" || lowered === "outro" || lowered === "outroe") {
    return "Outros"
  }
  if (lowered === "viagem") return "Viagem"
  if (lowered === "lazer") return "Lazer"
  if (lowered === "alimentacao" || lowered === "alimentação") return "Alimentação"
  if (lowered === "filho") return "Filho"
  if (lowered === "veiculo" || lowered === "veículo") return "Veículo"
  if (lowered === "moradia") return "Moradia"
  if (lowered === "transporte") return "Transporte"
  if (lowered === "servicos" || lowered === "serviços") return "Serviços"
  if (lowered === "compras") return "Compras"

  if (trimmed.length > 0) {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
  }
  return trimmed
}

export default function DataManagementSection() {
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({
    incomes: true,
    expenses: true,
    history: true,
    "daily-expenses": true,
    bills: true,
    goals: true,
    categories: true
  })

  const [isCsvLoading, setIsCsvLoading] = useState(false)
  const [isSheetsLoading, setIsSheetsLoading] = useState(false)
  const [isPdfLoading, setIsPdfLoading] = useState(false)

  const exportItems: ExportItem[] = [
    {
      id: "incomes",
      title: "Entradas",
      description: "Exportar todas as receitas registradas na sua conta.",
      icon: ArrowDownLeft,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20",
      apiType: "incomes"
    },
    {
      id: "expenses",
      title: "Saídas",
      description: "Exportar todas as despesas lançadas na sua conta.",
      icon: ArrowUpRight,
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20",
      apiType: "expenses"
    },
    {
      id: "history",
      title: "Histórico",
      description: "Exportar todas as entradas e saídas consolidadas cronologicamente.",
      icon: History,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20",
      apiType: "history"
    },
    {
      id: "daily-expenses",
      title: "Gastos Diários",
      description: "Exportar apenas despesas classificadas como 'Variável'.",
      icon: CalendarDays,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20",
      apiType: "daily-expenses"
    },
    {
      id: "bills",
      title: "Minhas Contas",
      description: "Exportar faturas e boletos registrados na plataforma.",
      icon: CreditCard,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20",
      apiType: "bills"
    },
    {
      id: "goals",
      title: "Metas",
      description: "Exportar metas e objetivos financeiros configurados.",
      icon: Target,
      color: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20",
      apiType: "goals"
    },
    {
      id: "categories",
      title: "Categorias",
      description: "Exportar categorias de receitas e despesas.",
      icon: Tags,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20",
      apiType: "categories"
    }
  ]

  const selectedKeys = Object.keys(selectedItems).filter((key) => selectedItems[key])
  const selectedCount = selectedKeys.length
  const allSelected = selectedCount === exportItems.length

  const handleToggleItem = (id: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleToggleSelectAll = () => {
    const targetState = !allSelected
    const updated: Record<string, boolean> = {}
    exportItems.forEach((item) => {
      updated[item.id] = targetState
    })
    setSelectedItems(updated)
  }

  const handleExportCsv = async () => {
    if (selectedCount === 0) return

    setIsCsvLoading(true)
    try {
      const typesParam = selectedKeys.join(",")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api-proxy"

      const response = await fetch(`${API_URL}/api/profile/export/csv?types=${typesParam}`, {
        credentials: "include"
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Erro ao exportar arquivo CSV."
        try {
          const parsed = JSON.parse(errorText)
          errorMessage = parsed.message || errorMessage
        } catch {
          if (errorText && errorText.length < 200) {
            errorMessage = errorText
          }
        }
        throw new Error(errorMessage)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url

      const contentDisposition = response.headers.get("content-disposition")
      let filename = selectedCount === 1 ? `${selectedKeys[0]}.csv` : "definance-export.zip"
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/)
        if (match) {
          filename = match[1]
        }
      }

      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Exportação CSV concluída com sucesso.")
    } catch (error: unknown) {
      console.error("Erro na exportação CSV:", error)
      const message = error instanceof Error ? error.message : "Erro desconhecido ao exportar CSV."
      toast.error(message)
    } finally {
      setIsCsvLoading(false)
    }
  }

  const getSheetTitle = (key: string): string => {
    switch (key) {
      case "incomes": return "Entradas"
      case "expenses": return "Saídas"
      case "history": return "Histórico"
      case "daily-expenses": return "Gastos Diários"
      case "bills": return "Minhas Contas"
      case "goals": return "Metas"
      case "categories": return "Categorias"
      default: return key
    }
  }

  const formatSheetData = (key: string, data: ExportDataResponse): (string | number)[][] => {
    switch (key) {
      case "incomes": {
        const headers = ["Data", "Nome", "Valor", "Tipo", "Recorrente"]
        const rows = (data.incomes || []).map((item) => [
          formatDate(item.date),
          item.name || "",
          item.amount || 0,
          item.type || "",
          item.isRecurring ? "Sim" : "Não"
        ])
        return [headers, ...rows]
      }
      case "expenses": {
        const headers = ["Data", "Nome", "Valor", "Categoria", "Tipo", "Status", "Vencimento"]
        const rows = (data.expenses || []).map((item) => [
          formatDate(item.date),
          item.name || "",
          item.amount || 0,
          item.category || "",
          item.expenseType || "",
          item.status || "",
          item.dueDate ? formatDate(item.dueDate) : ""
        ])
        return [headers, ...rows]
      }
      case "history": {
        const headers = ["Data", "Nome", "Valor", "Tipo (Receita/Despesa)", "Categoria"]
        const rows = (data.history || []).map((item) => [
          formatDate(item.date),
          item.name || "",
          item.amount || 0,
          item.type || "",
          item.category || ""
        ])
        return [headers, ...rows]
      }
      case "daily-expenses": {
        const headers = ["Data", "Nome", "Valor", "Categoria"]
        const rows = (data.dailyExpenses || []).map((item) => [
          formatDate(item.date),
          item.name || "",
          item.amount || 0,
          item.category || ""
        ])
        return [headers, ...rows]
      }
      case "bills": {
        const headers = ["Nome", "ValorOriginal", "ValorPago", "Vencimento", "Status", "Parcela"]
        const rows = (data.bills || []).map((item) => [
          item.name || "",
          item.amount || 0,
          item.status === "Pago" ? item.amount : 0,
          item.dueDate ? formatDate(item.dueDate) : (item.dueDay ? `Dia ${item.dueDay}` : ""),
          item.status || "",
          ""
        ])
        return [headers, ...rows]
      }
      case "goals": {
        const headers = ["Nome", "ValorAlvo", "ValorAtual", "Prazo", "Progresso"]
        const rows = (data.goals || []).map((item) => {
          const progress = item.targetAmount > 0 ? (item.currentAmount / item.targetAmount) * 100 : 0
          return [
            item.name || "",
            item.targetAmount || 0,
            item.currentAmount || 0,
            item.endDate ? formatDate(item.endDate) : "",
            `${progress.toFixed(2)}%`
          ]
        })
        return [headers, ...rows]
      }
      case "categories": {
        const headers = ["Nome", "Tipo (Entrada/Saída/Ambos)"]
        const rows = (data.categories || []).map((item) => [
          item.name || "",
          item.type || ""
        ])
        return [headers, ...rows]
      }
      default:
        return [[]]
    }
  }

  const processGoogleSheetsExport = useCallback(async (token: string) => {
    setIsSheetsLoading(true)
    try {
      // 1. Fetch entire user data structure
      const data = await apiClient<ExportDataResponse>("/api/profile/export/json")

      // 2. Prepare sheets to create
      const activeKeys = selectedKeys

      // 3. Create Google Spreadsheet via REST API
      const createResponse = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          properties: {
            title: `Definance - Exportação de Dados (${new Date().toLocaleDateString("pt-BR")})`
          },
          sheets: activeKeys.map((key) => ({
            properties: {
              title: getSheetTitle(key)
            }
          }))
        })
      })

      if (!createResponse.ok) {
        const errorText = await createResponse.text()
        throw new Error(`Erro ao criar planilha: ${errorText}`)
      }

      interface GoogleSpreadsheetResponse {
        spreadsheetId: string
        spreadsheetUrl: string
      }
      const spreadsheet = (await createResponse.json()) as GoogleSpreadsheetResponse
      const { spreadsheetId, spreadsheetUrl } = spreadsheet

      // 4. Format and populate batch data
      const valueRanges = activeKeys.map((key) => {
        const title = getSheetTitle(key)
        const values = formatSheetData(key, data)
        return {
          range: `'${title}'!A1`,
          values
        }
      })

      // 5. Write data values in batch
      const updateResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            valueInputOption: "USER_ENTERED",
            data: valueRanges
          })
        }
      )

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text()
        throw new Error(`Erro ao preencher dados na planilha: ${errorText}`)
      }

      toast.success("Dados exportados para o Google Sheets com sucesso!", {
        action: {
          label: "Abrir Planilha",
          onClick: () => window.open(spreadsheetUrl, "_blank")
        },
        duration: 10000
      })
    } catch (error: unknown) {
      console.error("Erro ao integrar com o Google Sheets:", error)
      const message = error instanceof Error ? error.message : "Erro desconhecido ao exportar para o Google Sheets."
      toast.error(message)
    } finally {
      setIsSheetsLoading(false)
    }
  }, [selectedKeys])

  const loadGoogleScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") return resolve()

      interface GoogleGsiScope {
        accounts?: {
          oauth2?: {
            initTokenClient: (config: {
              client_id: string
              scope: string
              callback: (response: GoogleTokenResponse) => void
            }) => {
              requestAccessToken: (options: { prompt?: string }) => void
            }
          }
        }
      }

      const win = window as unknown as { google?: GoogleGsiScope }
      if (win.google?.accounts?.oauth2) {
        return resolve()
      }

      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = (err) => reject(err)
      document.head.appendChild(script)
    })
  }

  const handleExportGoogleSheets = async () => {
    if (selectedCount === 0) return

    setIsSheetsLoading(true)
    try {
      await loadGoogleScript()

      interface GoogleGsiScope {
        accounts: {
          oauth2: {
            initTokenClient: (config: {
              client_id: string
              scope: string
              callback: (response: GoogleTokenResponse) => void
            }) => {
              requestAccessToken: (options: { prompt?: string }) => void
            }
          }
        }
      }
      const win = window as unknown as { google: GoogleGsiScope }

      const client = win.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/spreadsheets",
        callback: (response: GoogleTokenResponse) => {
          if (response.error) {
            toast.error(`Erro na autenticação Google: ${response.error}`)
            setIsSheetsLoading(false)
            return
          }
          if (response.access_token) {
            processGoogleSheetsExport(response.access_token)
          } else {
            toast.error("Nenhum token de acesso foi retornado pelo Google.")
            setIsSheetsLoading(false)
          }
        }
      })

      client.requestAccessToken({ prompt: "consent" })
    } catch (error: unknown) {
      console.error("Erro ao carregar Google OAuth:", error)
      const message = error instanceof Error ? error.message : "Erro desconhecido ao abrir autenticação do Google."
      toast.error(message)
      setIsSheetsLoading(false)
    }
  }

  const handleExportPdf = async () => {
    if (selectedCount === 0) return

    setIsPdfLoading(true)
    try {
      const data = await apiClient<ExportDataResponse>("/api/profile/export/json")

      let logoBase64 = ""
      try {
        logoBase64 = await getBase64ImageFromUrl("/logo.png")
      } catch (e) {
        console.error("Erro ao obter base64 da logo:", e)
      }

      const doc = new jsPDF()

      const margin = 14
      const pageWidth = doc.internal.pageSize.width
      const pageHeight = doc.internal.pageSize.height
      let currentY = 20

      doc.setFillColor(15, 23, 42) // Slate 900
      doc.rect(0, 0, pageWidth, 40, "F")

      if (logoBase64) {
        try {
          doc.addImage(logoBase64, "PNG", margin, 11, 18, 18)
        } catch (e) {
          console.error("Erro ao adicionar imagem ao PDF:", e)
        }

        doc.setTextColor(255, 255, 255)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(22)
        doc.text("DEFINANCE", margin + 22, 20)

        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        doc.setTextColor(200, 200, 200)
        doc.text("Relatório de Exportação Consolidado", margin + 22, 29)
      } else {
        doc.setTextColor(255, 255, 255)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(22)
        doc.text("DEFINANCE", margin, 20)

        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        doc.setTextColor(200, 200, 200)
        doc.text("Relatório de Exportação Consolidado", margin, 29)
      }

      const formattedDate = new Date().toLocaleString("pt-BR")
      doc.text(`Gerado em: ${formattedDate}`, pageWidth - margin - 60, 29)

      doc.setTextColor(30, 41, 59) // Slate 800

      currentY = 55
      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.text("Resumo Financeiro", margin, currentY)
      currentY += 8

      const totalIncomes = (data.incomes || []).reduce((acc, curr) => acc + (curr.amount || 0), 0)
      const totalExpenses = (data.expenses || []).reduce((acc, curr) => acc + (curr.amount || 0), 0)
      const balance = totalIncomes - totalExpenses

      doc.setFillColor(248, 250, 252) // Slate 50
      doc.setDrawColor(226, 232, 240) // Slate 200
      doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 24, 3, 3, "FD")

      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.setTextColor(100, 116, 139) // Slate 500
      doc.text("Total Receitas", margin + 10, currentY + 8)
      doc.text("Total Despesas", margin + 70, currentY + 8)
      doc.text("Saldo Consolidado", margin + 130, currentY + 8)

      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.setTextColor(16, 185, 129) // Emerald 500
      doc.text(formatCurrency(totalIncomes), margin + 10, currentY + 16)
      doc.setTextColor(239, 68, 68) // Red 500
      doc.text(formatCurrency(totalExpenses), margin + 70, currentY + 16)
      doc.setTextColor(balance >= 0 ? 16 : 239, balance >= 0 ? 185 : 68, balance >= 0 ? 129 : 68)
      doc.text(formatCurrency(balance), margin + 130, currentY + 16)

      currentY += 38

      const checkSpace = (requiredHeight: number) => {
        if (currentY + requiredHeight > pageHeight - 20) {
          doc.addPage()
          doc.setFont("helvetica", "normal")
          doc.setFontSize(8)
          doc.setTextColor(148, 163, 184) // Slate 400
          doc.text("Definance - Relatório Consolidado", margin, 12)
          doc.setDrawColor(241, 245, 249)
          doc.line(margin, 14, pageWidth - margin, 14)
          currentY = 25
        }
      }

      for (const key of selectedKeys) {
        checkSpace(35)

        let title = ""
        let headers: string[] = []
        let rows: any[][] = []

        switch (key) {
          case "incomes":
            title = "Receitas / Entradas"
            headers = ["Data", "Nome", "Valor", "Tipo", "Recorrente"]
            rows = (data.incomes || []).map(item => [
              formatDate(item.date),
              formatPdfText(item.name),
              formatCurrency(item.amount || 0),
              formatPdfText(item.type),
              item.isRecurring ? "Sim" : "Não"
            ])
            break

          case "expenses":
            title = "Despesas / Saídas"
            headers = ["Data", "Nome", "Valor", "Categoria", "Tipo", "Status", "Vencimento"]
            rows = (data.expenses || []).map(item => [
              formatDate(item.date),
              formatPdfText(item.name),
              formatCurrency(item.amount || 0),
              formatPdfText(item.category),
              item.expenseType || "",
              item.status || "",
              item.dueDate ? formatDate(item.dueDate) : ""
            ])
            break

          case "history":
            title = "Histórico Consolidado"
            headers = ["Data", "Nome", "Valor", "Tipo", "Categoria"]
            rows = (data.history || []).map(item => [
              formatDate(item.date),
              formatPdfText(item.name),
              formatCurrency(item.amount || 0),
              formatPdfText(item.type),
              formatPdfText(item.category)
            ])
            break

          case "daily-expenses":
            title = "Gastos Diários (Variáveis)"
            headers = ["Data", "Nome", "Valor", "Categoria"]
            rows = (data.dailyExpenses || []).map(item => [
              formatDate(item.date),
              formatPdfText(item.name),
              formatCurrency(item.amount || 0),
              formatPdfText(item.category)
            ])
            break

          case "bills":
            title = "Minhas Contas"
            headers = ["Nome", "Valor Original", "Valor Pago", "Vencimento", "Status"]
            rows = (data.bills || []).map(item => [
              formatPdfText(item.name),
              formatCurrency(item.amount || 0),
              item.status === "Pago" ? formatCurrency(item.amount || 0) : "R$ 0,00",
              item.dueDate ? formatDate(item.dueDate) : (item.dueDay ? `Dia ${item.dueDay}` : ""),
              item.status || ""
            ])
            break

          case "goals":
            title = "Objetivos / Metas"
            headers = ["Nome", "Valor Alvo", "Valor Atual", "Progresso", "Prazo"]
            rows = (data.goals || []).map(item => {
              const progress = item.targetAmount > 0 ? (item.currentAmount / item.targetAmount) * 100 : 0
              return [
                formatPdfText(item.name),
                formatCurrency(item.targetAmount || 0),
                formatCurrency(item.currentAmount || 0),
                `${progress.toFixed(2)}%`,
                item.endDate ? formatDate(item.endDate) : ""
              ]
            })
            break

          case "categories":
            title = "Categorias Personalizadas"
            headers = ["Nome", "Tipo"]
            rows = (data.categories || []).map(item => [
              formatPdfText(item.name),
              item.type || ""
            ])
            break
        }

        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.setTextColor(30, 41, 59)
        doc.text(title, margin, currentY)
        currentY += 4

        autoTable(doc, {
          startY: currentY,
          head: [headers],
          body: rows,
          theme: "striped",
          headStyles: {
            fillColor: [79, 70, 229], // Indigo 600
            textColor: [255, 255, 255],
            fontStyle: "bold"
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252] // Slate 50
          },
          styles: {
            fontSize: 8,
            cellPadding: 3
          },
          margin: { left: margin, right: margin }
        })

        currentY = (doc as any).lastAutoTable.finalY + 15
      }

      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.setTextColor(148, 163, 184)
        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth / 2 - 8,
          pageHeight - 10
        )
      }

      doc.save(`definance-relatorio-${new Date().toISOString().slice(0, 10)}.pdf`)
      toast.success("Relatório PDF exportado com sucesso!")
    } catch (error: unknown) {
      console.error("Erro na exportação PDF:", error)
      const message = error instanceof Error ? error.message : "Erro desconhecido ao exportar PDF."
      toast.error(message)
    } finally {
      setIsPdfLoading(false)
    }
  }

  return (
    <Card className="border-border/50 bg-card/85 dark:bg-card/65 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-border flex flex-col h-full col-span-1">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle className="text-base text-card-foreground">Gestão de Dados</CardTitle>
          </div>
          <button
            type="button"
            onClick={handleToggleSelectAll}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer border-none bg-transparent"
          >
            {allSelected ? "Desmarcar Todos" : "Selecionar Todos"}
          </button>
        </div>
        <CardDescription>
          Selecione as informações desejadas e exporte-as em lote.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
        <div className="divide-y divide-border/60">
          {exportItems.map((item) => {
            const Icon = item.icon
            const isChecked = !!selectedItems[item.id]
            return (
              <div
                key={item.id}
                className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg border shrink-0 mt-0.5 ${item.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-semibold text-foreground">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-normal max-w-md">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Switch
                    checked={isChecked}
                    onCheckedChange={() => handleToggleItem(item.id)}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/60">
          <Button
            variant="outline"
            onClick={handleExportCsv}
            disabled={isCsvLoading || isSheetsLoading || isPdfLoading || selectedCount === 0}
            className="text-xs font-semibold h-10 gap-2 cursor-pointer rounded-lg px-4 transition-all shadow-sm w-full"
          >
            {isCsvLoading ? (
              <>
                <Spinner className="h-4 w-4" />
                Processando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 text-primary" />
                Exportar (CSV)
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleExportGoogleSheets}
            disabled={isCsvLoading || isSheetsLoading || isPdfLoading || selectedCount === 0}
            className="text-xs font-semibold h-10 gap-2 cursor-pointer border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-950/20 rounded-lg px-4 transition-all shadow-sm w-full"
          >
            {isSheetsLoading ? (
              <>
                <Spinner className="h-4 w-4" />
                Integrando...
              </>
            ) : (
              <>
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM6 6h5v5H6V6zm0 6h5v6H6v-6zm12 6h-5v-5h5v5zm0-7h-5V6h5v5z" />
                </svg>
                Google Sheets
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleExportPdf}
            disabled={isCsvLoading || isSheetsLoading || isPdfLoading || selectedCount === 0}
            className="text-xs font-semibold h-10 gap-2 cursor-pointer border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-950/20 rounded-lg px-4 transition-all shadow-sm w-full"
          >
            {isPdfLoading ? (
              <>
                <Spinner className="h-4 w-4" />
                Gerando PDF...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                Exportar (PDF)
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
