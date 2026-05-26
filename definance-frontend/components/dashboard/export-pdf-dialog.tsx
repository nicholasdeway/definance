"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FileText, Download, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/currency"

interface ExportColumn {
  header: string
  key: string
  type?: 'currency' | 'date' | 'text'
}

interface ExportPdfDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle?: string
  data: Record<string, string | number | boolean | null | undefined>[]
  columns: ExportColumn[]
  fileName?: string
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

export function ExportPdfDialog({
  open,
  onOpenChange,
  title,
  subtitle = "Deseja realmente baixar os dados em formato PDF?",
  data,
  columns,
  fileName = "relatorio"
}: ExportPdfDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)

    try {
      let logoBase64 = ""
      try {
        logoBase64 = await getBase64ImageFromUrl("/logo.png")
      } catch (e) {
        console.error("Erro ao obter base64 da logo:", e)
      }

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Erro ao abrir janela de impressão. Verifique seu bloqueador de popups.");
        return;
      }

      const now = new Date().toLocaleString('pt-BR');

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <style>
              @page { size: A4; margin: 20mm; }
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 0; color: #1e293b; line-height: 1.5; }
              header { border-bottom: 2px solid #22c55e; padding-bottom: 10px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
              h1 { color: #22c55e; margin: 0; font-size: 24px; }
              .meta { font-size: 12px; color: #64748b; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { background-color: #f8fafc; text-align: left; padding: 12px 8px; border-bottom: 2px solid #e2e8f0; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
              td { padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
              tr:nth-child(even) { background-color: #fcfcfc; }
              .currency { font-family: monospace; font-weight: 600; text-align: right; }
              .footer { position: fixed; bottom: 0; width: 100%; font-size: 10px; color: #94a3b8; text-align: center; padding: 10px 0; border-top: 1px solid #f1f5f9; }
              .summary { margin-top: 30px; text-align: right; font-weight: bold; font-size: 16px; color: #1e293b; border-top: 2px solid #f1f5f9; padding-top: 10px; }
            </style>
          </head>
          <body>
            <header>
              <div style="display: flex; align-items: center; gap: 15px;">
                ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" style="width: 40px; height: 40px; border-radius: 8px;">` : `<img src="${window.location.origin}/logo.png" alt="Logo" style="width: 40px; height: 40px; border-radius: 8px;">`}
                <div>
                  <h1>Definance</h1>
                  <p style="margin: 0; font-size: 14px; color: #64748b;">${title}</p>
                </div>
              </div>
              <div class="meta">Gerado em: ${now}</div>
            </header>
            
            <table>
              <thead>
                <tr>
                  ${columns.map(col => `<th>${col.header}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.map(item => `
                  <tr>
                    ${columns.map(col => {
        const formatPdfText = (s: string | number | boolean | null | undefined): string => {
          if (s === null || s === undefined) return '';
          if (typeof s !== 'string') return String(s);

          const formatTerm = (term: string): string => {
            const trimmed = term.trim();
            const lowered = trimmed.toLowerCase();

            if (lowered === 'clt' || lowered === 'pj') {
              return trimmed.toUpperCase();
            }
            if (lowered === 'outros' || lowered === 'outro' || lowered === 'outroe') {
              return 'Outros';
            }
            if (lowered === 'viagem') return 'Viagem';
            if (lowered === 'lazer') return 'Lazer';
            if (lowered === 'alimentacao' || lowered === 'alimentação') return 'Alimentação';
            if (lowered === 'filho') return 'Filho';
            if (lowered === 'veiculo' || lowered === 'veículo') return 'Veículo';
            if (lowered === 'moradia') return 'Moradia';
            if (lowered === 'transporte') return 'Transporte';
            if (lowered === 'servicos' || lowered === 'serviços') return 'Serviços';
            if (lowered === 'compras') return 'Compras';

            if (trimmed.length > 0) {
              return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
            }
            return trimmed;
          };

          if (s.startsWith('Despesa:') || s.startsWith('Receita:')) {
            const parts = s.split(':');
            const prefix = parts[0];
            const value = parts.slice(1).join(':');
            return `${formatTerm(prefix)}: ${formatTerm(value)}`;
          }

          return formatTerm(s);
        };

        let val = item[col.key];
        const className = col.type === 'currency' ? 'class="currency"' : '';

        if (col.type === 'currency') {
          val = formatCurrency(Number(val || 0));
        } else if (typeof val === 'boolean') {
          val = val ? 'Recorrente' : 'Não Recorrente';
        } else {
          val = formatPdfText(val);
        }

        return `<td ${className}>${val}</td>`;
      }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="footer">
              Este documento é um relatório gerado eletronicamente pelo sistema Definance.
            </div>

            <script>
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                  window.onafterprint = () => window.close();
                }, 500);
              }
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();

      toast.success("Relatório preparado com sucesso!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao gerar relatório.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[400px]">
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <AlertDialogTitle className="text-center">Confirmar Exportação</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {subtitle}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-3 mt-4">
          <AlertDialogCancel disabled={loading} className="flex-1 cursor-pointer">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleExport();
            }}
            disabled={loading}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary/70 dark:hover:bg-primary/90 cursor-pointer"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download PDF
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}