using System;
using System.Text.Json;
using System.Threading.Tasks;
using definance_backend.Features.Auth.Repositories;
using definance_backend.Features.Onboarding.DTOs;
using definance_backend.Features.Bills.Repositories;
using definance_backend.Domain.Entities;
using System.Collections.Generic;
using definance_backend.Features.Incomes.Repositories;
using System.Linq;

namespace definance_backend.Features.Onboarding.Services
{
    public class OnboardingService : IOnboardingService
    {
        private readonly IUserRepository _userRepository;
        private readonly IBillRepository _billRepository;
        private readonly IIncomeRepository _incomeRepository;

        public OnboardingService(IUserRepository userRepository, IBillRepository billRepository, IIncomeRepository incomeRepository)
        {
            _userRepository = userRepository;
            _billRepository = billRepository;
            _incomeRepository = incomeRepository;
        }

        public async Task CompleteOnboardingAsync(Guid userId, OnboardingSubmissionDto dto)
        {
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

            // Sincronização única e otimizada
            await SyncAllEntitiesAsync(userId);
        }

        private async Task SyncAllEntitiesAsync(Guid userId)
        {
            try 
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null || string.IsNullOrEmpty(user.OnboardingData)) return;

                var options = new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
                };
                var dto = JsonSerializer.Deserialize<OnboardingSubmissionDto>(user.OnboardingData, options);
                if (dto == null) return;

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

        private string GetExpenseLabel(string key)
        {
            return key switch
            {
                "aluguel" => "Aluguel",
                "luz" => "Energia",
                "agua" => "Água",
                "internet" => "Internet",
                "celular" => "Celular",
                "streaming" => "Streaming",
                "academia" => "Academia",
                "transporte" => "Transporte",
                "alimentacao" => "Alimentação",
                "saude" => "Saúde",
                "educacao" => "Educação",
                _ => key
            };
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
                        currentData.SelectedExpenses = step4Data.SelectedExpenses;
                        currentData.CustomExpenses = step4Data.CustomExpenses;
                        currentData.BillLoans = step4Data.BillLoans;
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

        private async Task SyncIncomesOptimizedAsync(Guid userId, OnboardingSubmissionDto dto, List<Income> existingIncomes)
        {
            if (dto.Incomes == null) return;
            
            var baseTypes = new[] { "clt", "pj", "autonomo", "freelancer", "mesada" };
            
            var toDelete = existingIncomes.Where(i => baseTypes.Contains(i.Type.ToLower())).Select(i => i.Id).ToList();
            if (toDelete.Any())
            {
                await _incomeRepository.DeleteBatchAsync(toDelete);
            }

            var newIncomes = new List<Income>();
            foreach (var inc in dto.Incomes)
            {
                if (inc.Valor <= 0) continue;

                var dates = (inc.DiasRecebimento ?? "").Split(',', StringSplitOptions.RemoveEmptyEntries);
                var freq = inc.Frequencia.ToLower();

                if (freq == "semanal")
                {
                    // Projeta 4 recebimentos semanais
                    DateTime now = DateTime.UtcNow;
                    DateTime startDate = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                    
                    // Usar o dia da semana selecionado se existir
                    DayOfWeek? selectedDayOfWeek = null;
                    if (!string.IsNullOrEmpty(inc.DiaSemana))
                    {
                        selectedDayOfWeek = inc.DiaSemana.ToLower() switch
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
                            Amount = inc.Valor,
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
                                newIncomes.Add(new Income
                                {
                                    Id = Guid.NewGuid(),
                                    UserId = userId,
                                    Name = $"{inc.Tipo} (Quinzena {count})",
                                    Amount = inc.Valor,
                                    Type = inc.Tipo,
                                    Date = dt.ToUniversalTime(),
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
                        DateTime now = DateTime.UtcNow;
                        for (int i = 0; i < 2; i++)
                        {
                            newIncomes.Add(new Income
                            {
                                Id = Guid.NewGuid(),
                                UserId = userId,
                                Name = $"{inc.Tipo} (Quinzena {i + 1})",
                                Amount = inc.Valor,
                                Type = inc.Tipo,
                                Date = new DateTime(now.Year, now.Month, i == 0 ? 1 : 15, 0, 0, 0, DateTimeKind.Utc),
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
                        incomeDate = dt.ToUniversalTime();
                    }

                    newIncomes.Add(new Income
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Name = inc.Tipo,
                        Amount = inc.Valor,
                        Type = inc.Tipo,
                        Date = incomeDate ?? DateTime.UtcNow,
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
            var toDelete = existingBills.Where(b => 
                b.Category == "Veículo" && 
                b.Status == "Pendente" && 
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
                                dueDate = dt.ToUniversalTime();
                                dueDay = dt.Day;
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
                        dueDate = dt.ToUniversalTime();
                        dueDay = dt.Day;
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

            var toDelete = existingBills.Where(b => 
                b.Status == "Pendente" && 
                b.Description != null && 
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
            var toDelete = existingBills.Where(b => 
                b.Category == "Dívidas" && 
                b.Status == "Pendente" && 
                b.Description != null && 
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
                    baseDueDate = dt.ToUniversalTime();
                }

                if (d.Parcelado && d.ParcelasTotal > 0)
                {
                    int total = d.ParcelasTotal.Value;
                    int pagas = d.ParcelasPagas ?? 0;
                    int restantes = total - pagas;
                    decimal valorParcela = d.Valor / total;

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

                        newBills.Add(new Bill
                        {
                            Id = Guid.NewGuid(),
                            UserId = userId,
                            Name = $"{d.Descricao} ({numeroParcela}/{total})",
                            Amount = valorParcela,
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
    }
}