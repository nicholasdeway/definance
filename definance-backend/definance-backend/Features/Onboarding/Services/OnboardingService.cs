using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text.Json;
using definance_backend.Features.Auth.Repositories;
using definance_backend.Features.Onboarding.DTOs;
using definance_backend.Features.Bills.Repositories;
using definance_backend.Domain.Entities;
using definance_backend.Features.Incomes.Repositories;
using definance_backend.Features.Categories.Repositories;
using definance_backend.Features.Expenses.Repositories;
using definance_backend.Features.Shared.Services;

namespace definance_backend.Features.Onboarding.Services
{
    public class OnboardingService : IOnboardingService
    {
        private readonly IUserRepository _userRepository;
        private readonly IBillRepository _billRepository;
        private readonly IIncomeRepository _incomeRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IExpenseRepository _expenseRepository;
        private readonly IDateTimeProvider _dateTimeProvider;

        private static readonly HashSet<string> BaseIncomeTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "salário", "freelance", "investimento", "aluguel", "pensão", "outros",
            "clt", "pj", "autonomo", "freelancer", "mesada"
        };

        public OnboardingService(
            IUserRepository userRepository, 
            IBillRepository billRepository, 
            IIncomeRepository incomeRepository,
            ICategoryRepository categoryRepository,
            IExpenseRepository expenseRepository,
            IDateTimeProvider dateTimeProvider)
        {
            _userRepository = userRepository;
            _billRepository = billRepository;
            _incomeRepository = incomeRepository;
            _categoryRepository = categoryRepository;
            _expenseRepository = expenseRepository;
            _dateTimeProvider = dateTimeProvider;
        }

        public async Task CompleteOnboardingAsync(Guid userId, OnboardingSubmissionDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto), "Os dados de onboarding não podem ser nulos.");

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new ApplicationException("Usuário não encontrado.");

            // Atualiza os dados de onboarding no usuário
            var options = new JsonSerializerOptions 
            { 
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                PropertyNameCaseInsensitive = true 
            };
            var jsonData = JsonSerializer.Serialize(dto, options);
            user.OnboardingData = jsonData;
            user.HasCompletedOnboarding = true;
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            // Sincronização única e otimizada - Passamos o DTO diretamente para evitar Race Condition e IO desnecessário
            await SyncAllEntitiesAsync(userId, dto);
        }

        private async Task SyncAllEntitiesAsync(Guid userId, OnboardingSubmissionDto dto)
        {
            try 
            {
                // Busca todas as entradas existentes UMA VEZ para uso nos métodos otimizados
                var existingIncomes = (await _incomeRepository.GetByUserIdAsync(userId)).ToList();
                var existingBills = (await _billRepository.GetByUserIdAsync(userId)).ToList();

                // Processamento paralelo das sincronizações
                await Task.WhenAll(
                    SyncIncomesOptimizedAsync(userId, dto, existingIncomes),
                    SyncFixedExpensesOptimizedAsync(userId, dto, existingBills),
                    SyncVehiclesOptimizedAsync(userId, dto, existingBills),
                    SyncDebtsOptimizedAsync(userId, dto, existingBills)
                );
            }
            catch (Exception ex)
            {
                // Rethrow para que o chamador possa tratar (Controller ja tem try-catch)
                throw new ApplicationException($"Erro durante a sincronização do onboarding: {ex.Message}", ex);
            }
        }

        public async Task SyncDeleteBillWithProfileAsync(Guid userId, definance_backend.Domain.Entities.Bill bill)
        {
            if (bill == null || bill.Description == null) return;

            // Só processamos se vier do Perfil Financeiro ou Onboarding
            if (!bill.Description.Contains("Perfil Financeiro") && !bill.Description.Contains("Onboarding")) return;

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || string.IsNullOrEmpty(user.OnboardingData)) return;

            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var data = JsonSerializer.Deserialize<OnboardingSubmissionDto>(user.OnboardingData, options);
            if (data == null) return;

            bool changed = false;
            var billNameLower = bill.Name.ToLower();

            // 1. Verificar em SelectedExpenses (Dicionário)
            var expenseKey = data.SelectedExpenses.Keys.FirstOrDefault(k => GetExpenseLabel(k).ToLower() == billNameLower);
            if (expenseKey != null)
            {
                data.SelectedExpenses.Remove(expenseKey);
                data.BillLoans.Remove(expenseKey);
                changed = true;
            }

            // 2. Verificar em CustomExpenses
            var custom = data.CustomExpenses.FirstOrDefault(c => c.Titulo.ToLower() == billNameLower);
            if (custom != null)
            {
                data.CustomExpenses.Remove(custom);
                changed = true;
            }

            // 3. Verificar em Veículos (Empréstimos/Seguros)
            foreach (var v in data.Vehicles)
            {
                if (billNameLower.Contains(v.Nome.ToLower()))
                {
                    if (billNameLower.Contains("parcela") || billNameLower.Contains("financiamento"))
                    {
                        v.Financiado = false;
                        v.ValorParcela = null;
                        changed = true;
                    }
                    if (billNameLower.Contains("seguro"))
                    {
                        v.Seguro = false;
                        v.ValorSeguro = null;
                        changed = true;
                    }
                    if (billNameLower.Contains("ipva"))
                    {
                        var yearStr = billNameLower.Split(' ').FirstOrDefault(x => x.Length == 4 && int.TryParse(x, out _));
                        if (yearStr != null)
                        {
                            v.IpvaAnos.RemoveAll(a => a.Ano == yearStr);
                            changed = true;
                        }
                    }
                }
            }

            // 4. Verificar em Dívidas
            var debt = data.Debts.FirstOrDefault(d => d.Descricao.ToLower() == billNameLower);
            if (debt != null)
            {
                data.Debts.Remove(debt);
                changed = true;
            }

            if (changed)
            {
                user.OnboardingData = JsonSerializer.Serialize(data, options);
                await _userRepository.UpdateAsync(user);
            }
        }

        private static readonly Dictionary<string, string> ExpenseLabels = new()
        {
            { "aluguel", "Aluguel" },
            { "luz", "Energia" },
            { "agua", "Água" },
            { "internet", "Internet" },
            { "celular", "Celular" },
            { "streaming", "Streaming" },
            { "academia", "Academia" },
            { "transporte", "Transporte" },
            { "alimentacao", "Alimentação" },
            { "saude", "Saúde" },
            { "educacao", "Educação" }
        };

        private string GetExpenseLabel(string key)
        {
            return ExpenseLabels.TryGetValue(key.ToLower(), out var label) ? label : key;
        }

        public async Task SaveStepProgressAsync(Guid userId, int stepNumber, System.Text.Json.JsonElement data)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new ApplicationException("Usuário não encontrado.");
            }

            var currentData = string.IsNullOrEmpty(user.OnboardingData)
                ? new OnboardingSubmissionDto()
                : JsonSerializer.Deserialize<OnboardingSubmissionDto>(user.OnboardingData, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) 
                  ?? new OnboardingSubmissionDto();

            currentData.CurrentStep = stepNumber;
            var jsonData = data.GetRawText();
            
            var options = new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
            };
            
            switch (stepNumber)
            {
                case 1:
                    currentData.Motivations = JsonSerializer.Deserialize<List<string>>(jsonData, options) ?? new();
                    break;
                case 2:
                    currentData.SelectedIncomeTypes = JsonSerializer.Deserialize<List<string>>(jsonData, options) ?? new();
                    break;
                case 3:
                    currentData.Incomes = JsonSerializer.Deserialize<List<IncomeDetailDto>>(jsonData, options) ?? new();
                    break;
                case 4:
                    var step4Data = JsonSerializer.Deserialize<OnboardingSubmissionDto>(jsonData, options);
                    if (step4Data != null)
                    {
                        if (step4Data.SelectedExpenses != null) currentData.SelectedExpenses = step4Data.SelectedExpenses;
                        if (step4Data.CustomExpenses != null) currentData.CustomExpenses = step4Data.CustomExpenses;
                        if (step4Data.BillLoans != null) currentData.BillLoans = step4Data.BillLoans;
                    }
                    break;
                case 5:
                    currentData.Vehicles = JsonSerializer.Deserialize<List<VehicleDto>>(jsonData, options) ?? new();
                    break;
                case 6:
                    currentData.Debts = JsonSerializer.Deserialize<List<DebtDto>>(jsonData, options) ?? new();
                    break;
            }

            user.OnboardingData = JsonSerializer.Serialize(currentData, options);
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);
        }

        public async Task SyncIncomesAsync(Guid userId)
        {
            var existingIncomes = (await _incomeRepository.GetByUserIdAsync(userId)).ToList();
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || string.IsNullOrEmpty(user.OnboardingData)) return;

            var options = new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
            };
            var dto = JsonSerializer.Deserialize<OnboardingSubmissionDto>(user.OnboardingData, options);
            if (dto == null) return;

            await SyncIncomesOptimizedAsync(userId, dto, existingIncomes);
        }

        public async Task SyncVehiclesAsync(Guid userId)
        {
            var existingBills = (await _billRepository.GetByUserIdAsync(userId)).ToList();
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || string.IsNullOrEmpty(user.OnboardingData)) return;

            var options = new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
            };
            var dto = JsonSerializer.Deserialize<OnboardingSubmissionDto>(user.OnboardingData, options);
            if (dto == null) return;

            await SyncVehiclesOptimizedAsync(userId, dto, existingBills);
        }

        public async Task SyncFixedExpensesAsync(Guid userId)
        {
            var existingBills = (await _billRepository.GetByUserIdAsync(userId)).ToList();
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || string.IsNullOrEmpty(user.OnboardingData)) return;

            var options = new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
            };
            var dto = JsonSerializer.Deserialize<OnboardingSubmissionDto>(user.OnboardingData, options);
            if (dto == null) return;

            await SyncFixedExpensesOptimizedAsync(userId, dto, existingBills);
        }

        public async Task SyncDebtsAsync(Guid userId)
        {
            var existingBills = (await _billRepository.GetByUserIdAsync(userId)).ToList();
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || string.IsNullOrEmpty(user.OnboardingData)) return;

            var options = new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
            };
            var dto = JsonSerializer.Deserialize<OnboardingSubmissionDto>(user.OnboardingData, options);
            if (dto == null) return;

            await SyncDebtsOptimizedAsync(userId, dto, existingBills);
        }

        private DateTime NormalizeDate(DateTime date)
        {
            return _dateTimeProvider.NormalizeToAppDate(date);
        }

        private async Task SyncIncomesOptimizedAsync(Guid userId, OnboardingSubmissionDto dto, List<Income> existingIncomes)
        {
            if (dto.Incomes == null) return;
            
            var now = _dateTimeProvider.GetCurrentAppDate();
            // Início e fim do mês para deleção segura (apenas do mês que estamos sincronizando)
            var currentMonthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0); 
            var currentMonthEnd = currentMonthStart.AddMonths(1).AddTicks(-1);

            // 1. Identificar e deletar rendas sincronizadas APENAS do mês atual para evitar duplicidade
            var syncedIncomesInCurrentMonth = existingIncomes
                .Where(i => i.Date >= currentMonthStart && i.Date <= currentMonthEnd && BaseIncomeTypes.Contains(i.Type))
                .Select(i => i.Id)
                .ToList();

            if (syncedIncomesInCurrentMonth.Any())
            {
                await _incomeRepository.DeleteBatchAsync(syncedIncomesInCurrentMonth);
            }

            var newIncomes = new List<Income>();
            foreach (var inc in dto.Incomes)
            {
                if (inc.Valor <= 0) continue;

                // --- Lógica de Histórico ---
                // Se o usuário configurou uma nova renda mas o mês atual ainda deve usar a configuração anterior
                decimal valorEfetivo = inc.Valor;
                string freqEfetiva = (inc.Frequencia ?? "fixo_mensal").ToLower();
                string diasEfetivos = inc.DiasRecebimento ?? "";
                string? diaSemanaEfetivo = inc.DiaSemana;

                // Verificar no histórico (do mais antigo para o mais recente)
                // Pegamos a primeira configuração cujo mês de validade seja igual ou posterior ao mês atual
                var configHistorica = inc.HistoricoConfiguracoes?
                    .Where(h => !string.IsNullOrEmpty(h.ValidoAte))
                    .OrderBy(h => DateTime.TryParse(h.ValidoAte, out var d) ? d : DateTime.MaxValue)
                    .FirstOrDefault(h => 
                    {
                        if (DateTime.TryParse(h.ValidoAte, out var d))
                        {
                            // Comparamos apenas mês e ano para evitar problemas de fuso horário/dia
                            var syncMonth = new DateTime(now.Year, now.Month, 1);
                            var validityMonth = new DateTime(d.Year, d.Month, 1);
                            return syncMonth <= validityMonth;
                        }
                        return false;
                    });

                if (configHistorica != null)
                {
                    valorEfetivo = configHistorica.Valor;
                    freqEfetiva = configHistorica.Frequencia.ToLower();
                    diasEfetivos = configHistorica.DiasRecebimento ?? "";
                    diaSemanaEfetivo = configHistorica.DiaSemana;
                }
                else if (inc.ConfiguracaoAnterior != null && !string.IsNullOrEmpty(inc.ConfiguracaoAnterior.ValidoAte))
                {
                    // Fallback para campo legado se não houver lista ou se for dado antigo
                    if (DateTime.TryParse(inc.ConfiguracaoAnterior.ValidoAte, out var d))
                    {
                        var currentMonth = new DateTime(now.Year, now.Month, 1);
                        var validUntilMonth = new DateTime(d.Year, d.Month, 1);
                        if (currentMonth <= validUntilMonth)
                        {
                            valorEfetivo = inc.ConfiguracaoAnterior.Valor;
                            freqEfetiva = inc.ConfiguracaoAnterior.Frequencia.ToLower();
                            diasEfetivos = inc.ConfiguracaoAnterior.DiasRecebimento ?? "";
                            diaSemanaEfetivo = inc.ConfiguracaoAnterior.DiaSemana;
                        }
                    }
                }

                var dates = diasEfetivos.Split(',', StringSplitOptions.RemoveEmptyEntries);
                var freq = freqEfetiva;

                if (freq == "semanal")
                {
                    // Projeta 4 recebimentos semanais
                    DateTime startDate = new DateTime(now.Year, now.Month, 1, 0, 0, 0);
                    
                    // Usar o dia da semana selecionado se existir
                    DayOfWeek? selectedDayOfWeek = null;
                    if (!string.IsNullOrEmpty(diaSemanaEfetivo))
                    {
                        selectedDayOfWeek = diaSemanaEfetivo.ToLower() switch
                        {
                            "segunda" => DayOfWeek.Monday,
                            "terca" => DayOfWeek.Tuesday,
                            "quarta" => DayOfWeek.Wednesday,
                            "quinta" => DayOfWeek.Thursday,
                            "sexta" => DayOfWeek.Friday,
                            "sabado" => DayOfWeek.Saturday,
                            "domingo" => DayOfWeek.Sunday,
                            _ => null
                        };
                    }

                    for (int i = 0; i < 4; i++)
                    {
                        DateTime baseDate = startDate.AddDays(i * 7);
                        DateTime paymentDate = baseDate;

                        // Ajustar para o dia da semana específico se selecionado
                        if (selectedDayOfWeek.HasValue)
                        {
                            int daysToAdd = ((int)selectedDayOfWeek.Value - (int)baseDate.DayOfWeek + 7) % 7;
                            paymentDate = baseDate.AddDays(daysToAdd);
                        }

                        newIncomes.Add(new Income
                        {
                            Id = Guid.NewGuid(),
                            UserId = userId,
                            Name = $"{inc.Tipo} (Semana {i + 1})",
                            Amount = valorEfetivo,
                            Type = inc.Tipo,
                            Date = paymentDate,
                            IsRecurring = true,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        });
                    }
                }
                else if (freq == "quinzenal")
                {
                    // Agora consideramos o valor digitado como VALOR POR RECEBIMENTO (2x ao mês)
                    if (dates.Length > 0)
                    {
                        int count = 1;
                        foreach (var dateStr in dates)
                        {
                            if (DateTime.TryParse(dateStr.Trim(), out var dt))
                            {
                                // Ajusta para o mês e ano atual, mantendo o dia
                                var paymentDate = new DateTime(now.Year, now.Month, dt.Day, 0, 0, 0);
                                
                                newIncomes.Add(new Income
                                {
                                    Id = Guid.NewGuid(),
                                    UserId = userId,
                                    Name = $"{inc.Tipo} (Quinzena {count})",
                                    Amount = valorEfetivo,
                                    Type = inc.Tipo,
                                    Date = paymentDate,
                                    IsRecurring = true,
                                    CreatedAt = DateTime.UtcNow,
                                    UpdatedAt = DateTime.UtcNow
                                });
                                count++;
                            }
                        }
                    }
                    else
                    {
                        // Fallback se não houver datas: usar o dia 1 e dia 15 do mês atual
                        for (int i = 0; i < 2; i++)
                        {
                            newIncomes.Add(new Income
                            {
                                Id = Guid.NewGuid(),
                                UserId = userId,
                                Name = $"{inc.Tipo} (Quinzena {i + 1})",
                                Amount = valorEfetivo,
                                Type = inc.Tipo,
                                Date = new DateTime(now.Year, now.Month, i == 0 ? 1 : 15, 0, 0, 0),
                                IsRecurring = true,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            });
                        }
                    }
                }
                else
                {
                    // Fixo Mensal ou Variável
                    DateTime? incomeDate = null;
                    if (dates.Length > 0 && DateTime.TryParse(dates[0].Trim(), out var dt))
                    {
                        // Ajusta para o mês e ano atual, mantendo o dia
                        incomeDate = new DateTime(now.Year, now.Month, dt.Day, 0, 0, 0);
                    }

                    newIncomes.Add(new Income
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Name = inc.Tipo,
                        Amount = valorEfetivo,
                        Type = inc.Tipo,
                        Date = incomeDate ?? NormalizeDate(DateTime.UtcNow),
                        IsRecurring = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }
            }

            if (newIncomes.Any())
            {
                await _incomeRepository.CreateBatchAsync(newIncomes);
            }
        }

        private async Task SyncVehiclesOptimizedAsync(Guid userId, OnboardingSubmissionDto dto, List<Bill> existingBills)
        {
            var now = _dateTimeProvider.GetCurrentAppDate();
            var currentMonthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0);

            var toDelete = existingBills.Where(b => 
                b.Category == "Veículo" && 
                b.Status == "Pendente" && 
                (b.DueDate ?? b.CreatedAt) >= currentMonthStart &&
                (
                    (b.Description != null && (b.Description.Contains("Perfil") || b.Description.Contains("Onboarding") || b.Description.Contains("Sincronizado")) && !b.Description.Contains("(Instância)")) ||
                    b.Name.Contains("IPVA") || b.Name.Contains("Seguro") || b.Name.Contains("Parcela") || b.Name.Contains("Financiamento") || b.Name.Contains("Multa")
                )
            ).Select(b => b.Id).ToList();
            
            if (toDelete.Any())
            {
                await _billRepository.DeleteBatchAsync(toDelete);
            }

            if (dto.Vehicles == null || dto.Vehicles.Count == 0) return;

            var newBills = new List<Bill>();
            foreach (var v in dto.Vehicles)
            {
                if (v.IpvaAnos != null)
                {
                    foreach (var ano in v.IpvaAnos)
                    {
                        int parcelaCount = 1;
                        foreach (var parcela in ano.Parcelas)
                        {
                            if (parcela.Valor <= 0) continue;

                            int? dueDay = null;
                            DateTime? dueDate = null;
                            if (DateTime.TryParse(parcela.Vencimento, out var dt))
                            {
                                dueDate = NormalizeDate(dt);
                                dueDay = dueDate.Value.Day;
                            }

                            newBills.Add(new Bill
                            {
                                Id = Guid.NewGuid(),
                                UserId = userId,
                                Name = $"IPVA {ano.Ano} - {v.Nome} ({parcelaCount}/{ano.Parcelas.Count})",
                                Amount = parcela.Valor,
                                Category = "Veículo",
                                BillType = "Variável",
                                DueDay = dueDay,
                                DueDate = dueDate,
                                Status = "Pendente",
                                IsRecurring = false,
                                Description = $"IPVA do veículo {v.Nome} (Ano {ano.Ano}) (Sincronizado Perfil)"
                            });
                            parcelaCount++;
                        }
                    }
                }

                if (v.Financiado && v.ValorParcela > 0)
                {
                    newBills.Add(new Bill
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Name = $"Financiamento - {v.Nome}",
                        Amount = v.ValorParcela.Value,
                        Category = "Veículo",
                        BillType = "Fixa",
                        DueDay = null,
                        Status = "Pendente",
                        IsRecurring = true,
                        Description = $"Financiamento do veículo {v.Nome} (Sincronizado Perfil)"
                    });
                }

                if (v.Seguro && v.ValorSeguro > 0)
                {
                    int? dueDay = null;
                    DateTime? dueDate = null;
                    if (!string.IsNullOrEmpty(v.VencimentoSeguro) && DateTime.TryParse(v.VencimentoSeguro, out var dt))
                    {
                        dueDate = NormalizeDate(dt);
                        dueDay = dueDate.Value.Day;
                    }

                    newBills.Add(new Bill
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Name = $"Seguro - {v.Nome}",
                        Amount = v.ValorSeguro.Value,
                        Category = "Veículo",
                        BillType = "Fixa",
                        DueDay = dueDay,
                        DueDate = dueDate,
                        Status = "Pendente",
                        IsRecurring = v.SeguroRecorrente ?? true,
                        Description = $"Seguro do veículo {v.Nome} (Sincronizado Perfil)"
                    });
                }

                if (v.Extras != null)
                {
                    foreach (var extra in v.Extras)
                    {
                        if (extra.Valor <= 0) continue;
                        newBills.Add(new Bill
                        {
                            Id = Guid.NewGuid(),
                            UserId = userId,
                            Name = $"{extra.Descricao} ({v.Nome})",
                            Amount = extra.Valor,
                            Category = "Veículo",
                            BillType = "Fixa",
                            DueDay = null,
                            Status = "Pendente",
                            IsRecurring = true,
                            Description = $"Gasto extra do veículo {v.Nome} (Sincronizado Perfil)"
                        });
                    }
                }

                if (v.Multas > 0)
                {
                    newBills.Add(new Bill
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Name = $"Multas - {v.Nome}",
                        Amount = v.Multas,
                        Category = "Veículo",
                        BillType = "Variável",
                        DueDay = null,
                        Status = "Pendente",
                        IsRecurring = false,
                        Description = $"Multas pendentes do veículo {v.Nome} (Sincronizado Perfil)"
                    });
                }
            }

            if (newBills.Any())
            {
                await _billRepository.CreateBatchAsync(newBills);
            }
        }

        private async Task SyncFixedExpensesOptimizedAsync(Guid userId, OnboardingSubmissionDto dto, List<Bill> existingBills)
        {
            if (dto.SelectedExpenses == null) return;

            var now = _dateTimeProvider.GetCurrentAppDate();
            var currentMonthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0);

            var toDelete = existingBills.Where(b => 
                b.Status == "Pendente" && 
                b.Description != null && 
                // Se não tiver DueDate, usamos a data de criação ou assumimos que é nova
                (b.DueDate ?? b.CreatedAt) >= currentMonthStart &&
                (b.Description.Contains("Onboarding") || 
                 b.Description.Contains("Perfil Financeiro") || 
                 b.Description.Contains("Empréstimo vinculado")) &&
                !b.Description.Contains("(Instância)")
            ).Select(b => b.Id).ToList();

            if (toDelete.Any())
            {
                await _billRepository.DeleteBatchAsync(toDelete);
            }

            var newBills = new List<Bill>();
            foreach (var expense in dto.SelectedExpenses)
            {
                if (expense.Value <= 0) continue;

                var label = GetExpenseLabel(expense.Key);
                newBills.Add(new Bill
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Name = label,
                    Amount = expense.Value,
                    Category = expense.Key == "educacao" ? "Educação" : 
                               expense.Key == "saude" ? "Saúde" : 
                               expense.Key == "alimentacao" ? "Alimentação" :
                               expense.Key == "transporte" ? "Transporte" : "Moradia",
                    BillType = "Fixa",
                    Status = "Pendente",
                    IsRecurring = true,
                    Description = $"Vindo do Perfil Financeiro ({label})"
                });

                if (dto.BillLoans != null && dto.BillLoans.TryGetValue(expense.Key, out var loan) && loan.HasLoan && loan.Valor > 0)
                {
                    newBills.Add(new Bill
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Name = $"{label} (Empréstimo)",
                        Amount = loan.Valor,
                        Category = "Dívidas",
                        BillType = "Fixa",
                        Status = "Pendente",
                        IsRecurring = true,
                        Description = $"Empréstimo vinculado à conta de {label}"
                    });
                }
            }

            if (dto.CustomExpenses != null)
            {
                foreach (var custom in dto.CustomExpenses)
                {
                    if (custom.Valor <= 0) continue;

                    newBills.Add(new Bill
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Name = custom.Titulo,
                        Amount = custom.Valor,
                        Category = "Outros",
                        BillType = "Fixa",
                        Status = "Pendente",
                        IsRecurring = true,
                        Description = "Vindo do Perfil Financeiro (Personalizado)"
                    });
                }
            }

            if (newBills.Any())
            {
                await _billRepository.CreateBatchAsync(newBills);
            }
        }

        private async Task SyncDebtsOptimizedAsync(Guid userId, OnboardingSubmissionDto dto, List<Bill> existingBills)
        {
            var now = _dateTimeProvider.GetCurrentAppDate();
            var currentMonthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0);

            var toDelete = existingBills.Where(b => 
                b.Category == "Dívidas" && 
                b.Status == "Pendente" && 
                b.Description != null && 
                (b.DueDate ?? b.CreatedAt) >= currentMonthStart &&
                (
                    (b.Description.Contains("Perfil") || b.Description.Contains("Onboarding") || b.Description.Contains("Sincronizado")) && !b.Description.Contains("(Instância)") ||
                    b.Description.Contains("Dívida")
                )
            ).Select(b => b.Id).ToList();

            if (toDelete.Any())
            {
                await _billRepository.DeleteBatchAsync(toDelete);
            }

            if (dto.Debts == null || dto.Debts.Count == 0) return;

            var newBills = new List<Bill>();
            foreach (var d in dto.Debts)
            {
                if (d.Valor <= 0) continue;

                DateTime? baseDueDate = null;
                if (!string.IsNullOrEmpty(d.Vencimento) && DateTime.TryParse(d.Vencimento, out var dt))
                {
                    baseDueDate = NormalizeDate(dt);
                }

                if (d.Parcelado && (d.ParcelasTotal ?? 0) > 0)
                {
                    int total = d.ParcelasTotal!.Value;
                    int pagas = d.ParcelasPagas ?? 0;
                    int restantes = total - pagas;
                    
                    if (restantes <= 0) continue;

                    decimal valorBase = Math.Floor((d.Valor / total) * 100) / 100;
                    decimal residual = d.Valor - (valorBase * total);

                    for (int i = 1; i <= restantes; i++)
                    {
                        int numeroParcela = pagas + i;
                        
                        DateTime? installmentDate = null;
                        int? dueDay = null;
                        
                        if (baseDueDate.HasValue)
                        {
                            installmentDate = baseDueDate.Value.AddMonths(i - 1);
                            dueDay = installmentDate.Value.Day;
                        }

                        // A última parcela (ou a única restante se for o caso) recebe o residual para fechar o valor total
                        decimal valorDaParcela = (numeroParcela == total) ? (valorBase + residual) : valorBase;

                        newBills.Add(new Bill
                        {
                            Id = Guid.NewGuid(),
                            UserId = userId,
                            Name = $"{d.Descricao} ({numeroParcela}/{total})",
                            Amount = valorDaParcela,
                            Category = "Dívidas",
                            BillType = "Fixa",
                            DueDay = dueDay,
                            DueDate = installmentDate,
                            Status = "Pendente",
                            IsRecurring = false,
                            Description = $"Dívida Parcelada ({numeroParcela}/{total}) (Sincronizado Perfil)"
                        });
                    }
                }
                else
                {
                    newBills.Add(new Bill
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Name = d.Descricao,
                        Amount = d.Valor,
                        Category = "Dívidas",
                        BillType = "Variável",
                        DueDay = baseDueDate?.Day,
                        DueDate = baseDueDate,
                        Status = "Pendente",
                        IsRecurring = false,
                        Description = "Dívida única (Sincronizado Perfil)"
                    });
                }

                if (d.Extras != null)
                {
                    foreach (var extra in d.Extras)
                    {
                        if (extra.Valor <= 0) continue;
                        newBills.Add(new Bill
                        {
                            Id = Guid.NewGuid(),
                            UserId = userId,
                            Name = $"{extra.Descricao} ({d.Descricao})",
                            Amount = extra.Valor,
                            Category = "Dívidas",
                            BillType = "Fixa",
                            DueDay = null,
                            Status = "Pendente",
                            IsRecurring = true,
                            Description = $"Gasto extra da dívida {d.Descricao} (Sincronizado Perfil)"
                        });
                    }
                }
            }

            if (newBills.Any())
            {
                await _billRepository.CreateBatchAsync(newBills);
            }
        }

        public async Task<OnboardingSubmissionDto?> GetProgressAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || string.IsNullOrEmpty(user.OnboardingData))
            {
                return null;
            }

            var options = new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
            };

            return JsonSerializer.Deserialize<OnboardingSubmissionDto>(user.OnboardingData, options);
        }

        public async Task<GettingStartedStatusDto> GetGettingStartedStatusAsync(Guid userId)
        {
            // 1. Verificar categorias customizadas
            var categories = await _categoryRepository.GetByUserIdAsync(userId);
            bool hasCustomCategories = categories.Any(c => !c.IsSystem);

            // 2. Verificar qualquer transação
            // Verificamos Expenses e Incomes (Expenses cobre Gastos Diários também)
            var expenses = await _expenseRepository.GetByUserIdAsync(userId);
            var incomes = await _incomeRepository.GetByUserIdAsync(userId);
            
            bool hasTransactions = expenses.Any() || incomes.Any();

            int completedSteps = 0;
            if (hasCustomCategories) completedSteps++;
            if (hasTransactions) completedSteps++;

            return new GettingStartedStatusDto
            {
                HasCategories = hasCustomCategories,
                HasTransactions = hasTransactions,
                CompletedStepsCount = completedSteps,
                TotalStepsCount = 2
            };
        }
    }
}