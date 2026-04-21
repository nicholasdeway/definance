import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { BillsAlert } from "@/components/dashboard/bills-alert"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral das suas finanças</p>
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