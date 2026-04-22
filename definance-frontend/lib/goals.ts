import { apiClient } from "./api-client"

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  category: string
  startDate: string
  endDate: string
  monthlyReserve: number
  reserveDay: number
  isCompleted: boolean
  linkedBillId?: string
}

export interface CreateUpdateGoalDto {
  name: string
  targetAmount: number
  category: string
  startDate: string
  endDate: string
  monthlyReserve: number
  reserveDay: number
}

export interface DepositGoalDto {
  amount: number
}

export const goalsApi = {
  getGoals: () => apiClient<Goal[]>("/api/goals"),

  getGoalById: (id: string) => apiClient<Goal>(`/api/goals/${id}`),

  createGoal: (data: CreateUpdateGoalDto) =>
    apiClient<Goal>("/api/goals", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  updateGoal: (id: string, data: CreateUpdateGoalDto) =>
    apiClient<Goal>(`/api/goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  deposit: (id: string, data: DepositGoalDto) =>
    apiClient<Goal>(`/api/goals/${id}/deposit`, {
      method: "PATCH",
      body: JSON.stringify(data)
    }),

  deleteGoal: (id: string) =>
    apiClient<void>(`/api/goals/${id}`, {
      method: "DELETE"
    })
}