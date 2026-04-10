import { useCallback } from "react"
import { useOnboarding } from "./use-onboarding"
import { ONBOARDING_ERRORS, fixedExpenseCategories } from "../constants"

export const useOnboardingValidation = () => {
  const {
    monthlyIncome,
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
        if (selectedIncomeTypes.length === 0) {
          errors.push(ONBOARDING_ERRORS.income.selection)
        }
        break

      case 2:
        const incomeValue = parseInt(monthlyIncome || "0")
        if (!monthlyIncome || monthlyIncome === "") {
          errors.push(ONBOARDING_ERRORS.income.empty)
        } else if (incomeValue === 0) {
          errors.push(ONBOARDING_ERRORS.income.zero)
        }
        break

      case 3:
        for (const catKey in selectedExpenses) {
          const billValue = parseInt(selectedExpenses[catKey] || "0")
          const cat = fixedExpenseCategories.find(c => c.key === catKey)
          const label = cat?.label || catKey

          if (billValue === 0) {
            errors.push(ONBOARDING_ERRORS.expenses.empty(label))
          }
          if (billLoans[catKey]?.hasLoan) {
            const loanValue = parseInt(billLoans[catKey].valor || "0")
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
          if (parseInt(exp.valor || "0") === 0) {
            errors.push(ONBOARDING_ERRORS.expenses.customNoValue(exp.titulo))
          }
        }
        break

      case 4:
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
          const ipvaVal = parseInt(v.ipva || "0")
          const multasVal = parseInt(v.multas || "0")
          if ((v.ipva && isNaN(ipvaVal)) || (v.multas && isNaN(multasVal))) {
            errors.push(ONBOARDING_ERRORS.vehicles.invalidNumeric(index))
          }
          if (v.financiado) {
            if (!v.parcelasTotal || parseInt(v.parcelasTotal) === 0 || !v.valorParcela || parseInt(v.valorParcela) === 0) {
              errors.push(ONBOARDING_ERRORS.vehicles.financingIncomplete(index))
            } else if (parseInt(v.parcelasPagas || "0") > parseInt(v.parcelasTotal)) {
              errors.push(ONBOARDING_ERRORS.vehicles.financingConsistency(index))
            }
          }
          if (v.seguro) {
            if (!v.valorSeguro || parseInt(v.valorSeguro) === 0) {
              errors.push(ONBOARDING_ERRORS.vehicles.insuranceIncomplete(index))
            }
          }
        }
        break

      case 5:
        for (let i = 0; i < debts.length; i++) {
          const d = debts[i]
          const index = i + 1
          if (!d.descricao || d.descricao.trim().length === 0) {
            errors.push(ONBOARDING_ERRORS.debts.noDescription(index))
          }
          if (!d.valor || parseInt(d.valor) === 0) {
            errors.push(ONBOARDING_ERRORS.debts.noValue(index))
          }
          if (d.parcelado) {
            if (!d.parcelasTotal || parseInt(d.parcelasTotal) === 0) {
              errors.push(ONBOARDING_ERRORS.debts.parcelsIncomplete(index))
            } else if (parseInt(d.parcelasPagas || "0") > parseInt(d.parcelasTotal)) {
              errors.push(ONBOARDING_ERRORS.debts.parcelsConsistency(index))
            }
          }
        }
        break
    }
    return errors
  }, [
    selectedIncomeTypes,
    monthlyIncome,
    selectedExpenses,
    customExpenses,
    billLoans,
    vehicles,
    debts
  ])

  const validateStep = useCallback((step: number): boolean => {
    // Especial para o Step 2 (confirmação de renda alta)
    if (step === 2) {
      const incomeValue = parseInt(monthlyIncome || "0")
      if (incomeValue > 99900000000) {
        if (!window.confirm("O valor da renda mensal informado parece muito alto (acima de R$ 999.000.000,00). Você confirma que este valor está correto?")) {
          return false
        }
      }
    }

    const errors = getStepErrors(step)
    setStepErrors(errors)
    setWasAttempted(true)

    if (errors.length > 0) {
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      return false
    }

    return true
  }, [monthlyIncome, getStepErrors, setStepErrors, setWasAttempted, formTopRef])

  return { getStepErrors, validateStep }
}