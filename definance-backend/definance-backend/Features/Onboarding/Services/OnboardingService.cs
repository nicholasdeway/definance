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

            // 1. Processar Gastos Fixos Selecionados
            foreach (var expense in dto.SelectedExpenses)
            {
                if (expense.Value <= 0) continue;

                var label = GetExpenseLabel(expense.Key);
                await _billRepository.CreateAsync(new Bill
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Name = label,
                    Amount = expense.Value,
                    Category = "Moradia",
                    BillType = "Fixa",
                    DueDay = null,
                    Status = "Pendente",
                    IsRecurring = true,
                    Description = $"Importado do Onboarding ({label})"
                });

                // Se houver empréstimo vinculado a esta conta
                if (dto.BillLoans.TryGetValue(expense.Key, out var loan) && loan.HasLoan && loan.Valor > 0)
                {
                    await _billRepository.CreateAsync(new Bill
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Name = $"{label} (Empréstimo)",
                        Amount = loan.Valor,
                        Category = "Dívidas",
                        BillType = "Fixa",
                        DueDay = null,
                        Status = "Pendente",
                        IsRecurring = true,
                        Description = $"Empréstimo embutido na conta de {label}"
                    });
                }
            }

            // 2. Processar Gastos Personalizados
            foreach (var custom in dto.CustomExpenses)
            {
                if (custom.Valor <= 0) continue;

                await _billRepository.CreateAsync(new Bill
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Name = custom.Titulo,
                    Amount = custom.Valor,
                    Category = "Outros",
                    BillType = "Fixa",
                    DueDay = null,
                    Status = "Pendente",
                    IsRecurring = true,
                    Description = "Vindo do Onboarding (Personalizado)"
                });
            }

            // 3. Processar Veículos
            foreach (var v in dto.Vehicles)
            {
                if (v.IpvaAnos != null && v.IpvaAnos.Count > 0)
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

                            await _billRepository.CreateAsync(new Bill
                            {
                                Id = Guid.NewGuid(),
                                UserId = userId,
                                Name = $"IPVA {ano.Ano} - {v.Nome} ({parcelaCount}/{ano.Parcelas.Count})",
                                Amount = parcela.Valor,
                                Category = "Veículos",
                                BillType = "Variável",
                                DueDay = dueDay,
                                DueDate = dueDate,
                                Status = "Pendente",
                                IsRecurring = false,
                                Description = $"IPVA do veículo {v.Nome} (Ano {ano.Ano})"
                            });
                            parcelaCount++;
                        }
                    }
                }

                if (v.Financiado && v.ValorParcela > 0)
                {
                    await _billRepository.CreateAsync(new Bill
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Name = $"Parcela - {v.Nome}",
                        Amount = v.ValorParcela.Value,
                        Category = "Veículos",
                        BillType = "Fixa",
                        DueDay = null,
                        Status = "Pendente",
                        IsRecurring = true,
                        Description = $"Financiamento do veículo {v.Nome}"
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

                    await _billRepository.CreateAsync(new Bill
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Name = $"Seguro - {v.Nome}",
                        Amount = v.ValorSeguro.Value,
                        Category = "Veículos",
                        BillType = "Fixa",
                        DueDay = dueDay,
                        DueDate = dueDate,
                        Status = "Pendente",
                        IsRecurring = v.SeguroRecorrente ?? true,
                        Description = $"Seguro do veículo {v.Nome}"
                    });
                }
            }

            // 4. Processar Dívidas
            foreach (var d in dto.Debts)
            {
                if (d.Valor <= 0) continue;

                await _billRepository.CreateAsync(new Bill
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Name = d.Descricao,
                    Amount = d.Valor,
                    Category = "Dívidas",
                    BillType = d.Parcelado ? "Fixa" : "Variável",
                    DueDay = null,
                    Status = "Pendente",
                    IsRecurring = d.Parcelado,
                    Description = d.Parcelado ? "Dívida Parcelada" : "Dívida única/avulsa"
                });
            }

            // 5. Processar Rendas (Materialização)
            foreach (var inc in dto.Incomes)
            {
                if (inc.Valor <= 0) continue;

                var dates = inc.DiasRecebimento.Split(',', StringSplitOptions.RemoveEmptyEntries);
                
                // Se for quinzenal e tivermos duas datas, dividimos o valor
                if (inc.Frequencia.ToLower() == "quinzenal" && dates.Length > 0)
                {
                    decimal halfAmount = inc.Valor / (dates.Length > 1 ? 2 : 1);
                    foreach (var dateStr in dates)
                    {
                        if (DateTime.TryParse(dateStr.Trim(), out var dt))
                        {
                            await _incomeRepository.CreateAsync(new Income
                            {
                                Id = Guid.NewGuid(),
                                UserId = userId,
                                Name = inc.Tipo,
                                Amount = halfAmount,
                                Type = inc.Tipo,
                                Date = dt.ToUniversalTime(),
                                IsRecurring = true
                            });
                        }
                    }
                }
                else
                {
                    // Caso padrão (Mensal ou única data)
                    DateTime? incomeDate = null;
                    if (dates.Length > 0 && DateTime.TryParse(dates[0].Trim(), out var dt))
                    {
                        incomeDate = dt.ToUniversalTime();
                    }

                    await _incomeRepository.CreateAsync(new Income
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Name = inc.Tipo,
                        Amount = inc.Valor,
                        Type = inc.Tipo,
                        Date = incomeDate ?? DateTime.UtcNow,
                        IsRecurring = true
                    });
                }
            }

            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var jsonData = JsonSerializer.Serialize(dto, options);

            user.HasCompletedOnboarding = true;
            user.OnboardingData = jsonData;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);
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

        public async Task SyncVehiclesAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || string.IsNullOrEmpty(user.OnboardingData)) return;

            var options = new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
            };
            var dto = JsonSerializer.Deserialize<OnboardingSubmissionDto>(user.OnboardingData, options);
            if (dto == null || dto.Vehicles == null || dto.Vehicles.Count == 0) return;

            var existingBills = await _billRepository.GetByUserIdAsync(userId);
            var pendingVehicleBills = existingBills.Where(b => b.Category == "Veículos" && b.Status == "Pendente").ToList();

            foreach (var bill in pendingVehicleBills)
            {
                await _billRepository.DeleteAsync(bill.Id);
            }

            foreach (var v in dto.Vehicles)
            {
                if (v.IpvaAnos != null && v.IpvaAnos.Count > 0)
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

                            await _billRepository.CreateAsync(new Bill
                            {
                                Id = Guid.NewGuid(),
                                UserId = userId,
                                Name = $"IPVA {ano.Ano} - {v.Nome} ({parcelaCount}/{ano.Parcelas.Count})",
                                Amount = parcela.Valor,
                                Category = "Veículos",
                                BillType = "Variável",
                                DueDay = dueDay,
                                DueDate = dueDate,
                                Status = "Pendente",
                                IsRecurring = false,
                                Description = $"IPVA do veículo {v.Nome} (Ano {ano.Ano})"
                            });
                            parcelaCount++;
                        }
                    }
                }

                if (v.Financiado && v.ValorParcela > 0)
                {
                    await _billRepository.CreateAsync(new Bill
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Name = $"Parcela - {v.Nome}",
                        Amount = v.ValorParcela.Value,
                        Category = "Veículos",
                        BillType = "Fixa",
                        DueDay = null,
                        Status = "Pendente",
                        IsRecurring = true,
                        Description = $"Financiamento do veículo {v.Nome}"
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

                    await _billRepository.CreateAsync(new Bill
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Name = $"Seguro - {v.Nome}",
                        Amount = v.ValorSeguro.Value,
                        Category = "Veículos",
                        BillType = "Fixa",
                        DueDay = dueDay,
                        DueDate = dueDate,
                        Status = "Pendente",
                        IsRecurring = v.SeguroRecorrente ?? true,
                        Description = $"Seguro do veículo {v.Nome}"
                    });
                }
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