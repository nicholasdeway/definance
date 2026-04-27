import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { BillsAlert } from "@/components/dashboard/bills-alert"
import { LayoutDashboard } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          </div>
          <p className="text-muted-foreground text-sm">Visão geral das suas finanças</p>
        </div>
      </div>

      <BillsAlert />
      
      <DashboardCards />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCharts />
        <RecentTransactions />
      </div>
    </div>
  )
}