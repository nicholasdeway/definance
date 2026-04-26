import { useCallback } from "react"
import { useOnboarding } from "./use-onboarding"
import { ONBOARDING_ERRORS, fixedExpenseCategories } from "../constants"
import { IncomeFrequency } from "../types"

export const useOnboardingValidation = () => {
  const {
    motivations,
    incomes,
    selectedIncomeTypes,
    selectedExpenses,
    customExpenses,
    billLoans,
    vehicles,
    debts,
    setStepErrors,
    setWasAttempted,
    formTopRef
  } = useOnboarding()

  const getStepErrors = useCallback((step: number): string[] => {
    const errors: string[] = []

    switch (step) {
      case 1:
        if (!motivations || motivations.length === 0) {
          errors.push(ONBOARDING_ERRORS.motivations.selection)
        }
        break

      case 2:
        if (selectedIncomeTypes.length === 0) {
          errors.push(ONBOARDING_ERRORS.income.selection)
        }
        break

      case 3:
        if (incomes.length === 0 && selectedIncomeTypes.length > 0) {
          // Array vazio, mas ele selecionou fontes
          selectedIncomeTypes.forEach(t => errors.push(ONBOARDING_ERRORS.income.missingValue(t)))
        } else {
          for (const t of selectedIncomeTypes) {
            const inc = incomes.find(i => i.tipo === t)
            if (!inc) {
              errors.push(ONBOARDING_ERRORS.income.missingValue(t))
              continue
            }
            if (!inc.valor || inc.valor === 0) {
              errors.push(ONBOARDING_ERRORS.income.zeroValue(t))
            }
            if (!inc.frequencia) {
              errors.push(ONBOARDING_ERRORS.income.missingFreq(t))
            } else if (inc.frequencia === IncomeFrequency.FIXO_MENSAL || inc.frequencia === IncomeFrequency.QUINZENAL) {
              if (!inc.diasRecebimento || inc.diasRecebimento.trim().length === 0) {
                errors.push(ONBOARDING_ERRORS.income.missingDays(t))
              }
            } else if (inc.frequencia === IncomeFrequency.SEMANAL) {
              if (!inc.diaSemana || inc.diaSemana.trim().length === 0) {
                errors.push(ONBOARDING_ERRORS.income.missingWeeklyDay(t))
              }
            }
          }
        }
        break

      case 4:
        for (const catKey in selectedExpenses) {
          const billValue = selectedExpenses[catKey] || 0
          const cat = fixedExpenseCategories.find(c => c.key === catKey)
          const label = cat?.label || catKey

          if (billValue === 0) {
            errors.push(ONBOARDING_ERRORS.expenses.empty(label))
          }
          if (billLoans[catKey]?.hasLoan) {
            const loanValue = billLoans[catKey].valor || 0
            if (loanValue === 0) {
              errors.push(ONBOARDING_ERRORS.expenses.loanEmpty(label))
            } else if (loanValue > billValue) {
              errors.push(ONBOARDING_ERRORS.expenses.loanConsistency(label))
            }
          }
        }
        for (let i = 0; i < customExpenses.length; i++) {
          const exp = customExpenses[i]
          if (!exp.titulo.trim()) {
            errors.push(ONBOARDING_ERRORS.expenses.customNoName(i + 1))
          }
          if (!exp.valor || exp.valor === 0) {
            errors.push(ONBOARDING_ERRORS.expenses.customNoValue(exp.titulo))
          }
        }
        break

      case 5:
        for (let i = 0; i < vehicles.length; i++) {
          const v = vehicles[i]
          const index = i + 1
          if (!v.tipo) {
            errors.push(ONBOARDING_ERRORS.vehicles.noType(index))
          }
          if (v.tipo === "outro" && !v.nome.trim()) {
            errors.push(ONBOARDING_ERRORS.vehicles.noName(index))
          }
          const yearNum = parseInt(v.ano)
          const currentYear = new Date().getFullYear()
          if (v.ano && (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1)) {
            errors.push(ONBOARDING_ERRORS.vehicles.invalidYear(index, currentYear))
          }
          if (v.financiado) {
            if (!v.parcelasTotal || v.parcelasTotal === 0 || !v.valorParcela || v.valorParcela === 0) {
              errors.push(ONBOARDING_ERRORS.vehicles.financingIncomplete(index))
            } else if ((v.parcelasPagas || 0) > (v.parcelasTotal || 0)) {
              errors.push(ONBOARDING_ERRORS.vehicles.financingConsistency(index))
            }
          }
          if (v.seguro) {
            if (!v.valorSeguro || v.valorSeguro === 0) {
              errors.push(ONBOARDING_ERRORS.vehicles.insuranceIncomplete(index))
            }
          }
          if (v.ipvaAnos && v.ipvaAnos.length > 0) {
            if (v.ipvaAnos.some(y => !y.ano || y.ano.length < 4)) {
              errors.push(ONBOARDING_ERRORS.vehicles.ipvaInvalidYear(index))
            }
            if (v.ipvaAnos.some(y => y.parcelas.length === 0 || y.parcelas.some(p => !p.valor || p.valor === 0 || !p.vencimento))) {
              errors.push(ONBOARDING_ERRORS.vehicles.ipvaIncomplete(index))
            }
          }
        }
        break

      case 6:
        for (let i = 0; i < debts.length; i++) {
          const d = debts[i]
          const index = i + 1
          if (!d.descricao || d.descricao.trim().length === 0) {
            errors.push(ONBOARDING_ERRORS.debts.noDescription(index))
          }
          if (!d.valor || d.valor === 0) {
            errors.push(ONBOARDING_ERRORS.debts.noValue(index))
          }
          if (d.parcelado) {
            if (!d.parcelasTotal || d.parcelasTotal === 0) {
              errors.push(ONBOARDING_ERRORS.debts.parcelsIncomplete(index))
            } else if ((d.parcelasPagas || 0) > (d.parcelasTotal || 0)) {
              errors.push(ONBOARDING_ERRORS.debts.parcelsConsistency(index))
            }
          }
        }
        break
    }
    return errors
  }, [
    motivations,
    selectedIncomeTypes,
    incomes,
    selectedExpenses,
    customExpenses,
    billLoans,
    vehicles,
    debts
  ])

  const validateStep = useCallback((step: number): boolean => {

    const errors = getStepErrors(step)
    setStepErrors(errors)
    setWasAttempted(true)

    if (errors.length > 0) {
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      return false
    }

    return true
  }, [getStepErrors, setStepErrors, setWasAttempted, formTopRef])

  return { getStepErrors, validateStep }
}