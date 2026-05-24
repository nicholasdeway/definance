using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using definance_backend.Common.Extensions;
using definance_backend.Domain.Entities;
using definance_backend.Features.Incomes.Repositories;
using definance_backend.Features.Expenses.Repositories;
using definance_backend.Features.Bills.Repositories;
using definance_backend.Features.Goals.Repositories;
using definance_backend.Features.Categories.Repositories;
using definance_backend.Features.Profiles.DTOs;

namespace definance_backend.Features.Profiles.Controllers
{
    [ApiController]
    [Route("api/profile/export")]
    [Authorize]
    public class DataExportController : ControllerBase
    {
        private readonly IIncomeRepository _incomeRepository;
        private readonly IExpenseRepository _expenseRepository;
        private readonly IBillRepository _billRepository;
        private readonly IGoalRepository _goalRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly ILogger<DataExportController> _logger;

        public DataExportController(
            IIncomeRepository incomeRepository,
            IExpenseRepository expenseRepository,
            IBillRepository billRepository,
            IGoalRepository goalRepository,
            ICategoryRepository categoryRepository,
            ILogger<DataExportController> logger)
        {
            _incomeRepository = incomeRepository;
            _expenseRepository = expenseRepository;
            _billRepository = billRepository;
            _goalRepository = goalRepository;
            _categoryRepository = categoryRepository;
            _logger = logger;
        }


        [HttpGet("json")]
        public async Task<IActionResult> ExportJson()
        {
            try
            {
                var userId = User.GetUserId();
                _logger.LogInformation("Exporting JSON data for user {UserId}", userId);

                var incomes = await _incomeRepository.GetByUserIdAsync(userId);
                var expenses = await _expenseRepository.GetByUserIdAsync(userId);
                var bills = await _billRepository.GetByUserIdAsync(userId);
                var goals = await _goalRepository.GetByUserIdAsync(userId);
                var categories = await _categoryRepository.GetByUserIdAsync(userId);

                var history = GetConsolidatedHistory(incomes, expenses);
                var dailyExpenses = expenses.Where(e => e.ExpenseType == "Variável");

                var result = new
                {
                    incomes,
                    expenses,
                    history,
                    dailyExpenses,
                    bills,
                    goals,
                    categories
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting JSON data for user");
                return StatusCode(500, new { message = "Erro ao exportar dados." });
            }
        }

        [HttpGet("csv")]
        public async Task<IActionResult> ExportCsv([FromQuery] string? types)
        {
            try
            {
                var userId = User.GetUserId();
                _logger.LogInformation("Exporting CSV data for user {UserId} with types: {Types}", userId, types);

                var incomes = await _incomeRepository.GetByUserIdAsync(userId);
                var expenses = await _expenseRepository.GetByUserIdAsync(userId);
                var bills = await _billRepository.GetByUserIdAsync(userId);
                var goals = await _goalRepository.GetByUserIdAsync(userId);
                var categories = await _categoryRepository.GetByUserIdAsync(userId);

                var history = GetConsolidatedHistory(incomes, expenses);
                var dailyExpenses = expenses.Where(e => e.ExpenseType == "Variável");

                var selectedTypes = string.IsNullOrWhiteSpace(types)
                    ? new[] { "incomes", "expenses", "history", "daily-expenses", "bills", "goals", "categories" }
                    : types.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

                if (selectedTypes.Length == 0)
                {
                    return BadRequest(new { message = "Selecione pelo menos um tipo de dado para exportar." });
                }

                if (selectedTypes.Length == 1)
                {
                    var singleType = selectedTypes[0].ToLowerInvariant();
                    var csvContent = GenerateCsv(singleType, incomes, expenses, history, dailyExpenses, bills, goals, categories);
                    if (csvContent == null)
                    {
                        return BadRequest(new { message = $"Tipo de dado inválido: '{singleType}'" });
                    }

                    var csvBytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(csvContent)).ToArray();
                    return File(csvBytes, "text/csv", $"{singleType}.csv");
                }

                // Multiple files -> Generate ZIP
                using (var memoryStream = new MemoryStream())
                {
                    using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
                    {
                        foreach (var type in selectedTypes)
                        {
                            var typeLower = type.ToLowerInvariant();
                            var csvContent = GenerateCsv(typeLower, incomes, expenses, history, dailyExpenses, bills, goals, categories);
                            if (csvContent == null) continue;

                            var entry = archive.CreateEntry($"{typeLower}.csv");
                            using (var entryStream = entry.Open())
                            using (var writer = new StreamWriter(entryStream, Encoding.UTF8))
                            {
                                // Write BOM first
                                writer.Write('\uFEFF');
                                writer.Write(csvContent);
                            }
                        }
                    }

                    memoryStream.Seek(0, SeekOrigin.Begin);
                    var zipBytes = memoryStream.ToArray();
                    return File(zipBytes, "application/zip", $"definance-export-{DateTime.UtcNow:yyyyMMddHHmmss}.zip");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting CSV data for user");
                return StatusCode(500, new { message = "Erro ao gerar arquivos de exportação." });
            }
        }

        private IEnumerable<HistoryExportItemDto> GetConsolidatedHistory(IEnumerable<Income> incomes, IEnumerable<Expense> expenses)
        {
            var historyItems = new List<HistoryExportItemDto>();

            foreach (var income in incomes)
            {
                historyItems.Add(new HistoryExportItemDto
                {
                    Date = income.Date,
                    Name = income.Name,
                    Amount = income.Amount,
                    Type = "Receita",
                    Category = income.Type
                });
            }

            foreach (var expense in expenses)
            {
                historyItems.Add(new HistoryExportItemDto
                {
                    Date = expense.Date,
                    Name = expense.Name,
                    Amount = expense.Amount,
                    Type = "Despesa",
                    Category = expense.Category
                });
            }

            return historyItems.OrderByDescending(h => h.Date);
        }

        private string? GenerateCsv(
            string type,
            IEnumerable<Income> incomes,
            IEnumerable<Expense> expenses,
            IEnumerable<HistoryExportItemDto> history,
            IEnumerable<Expense> dailyExpenses,
            IEnumerable<Bill> bills,
            IEnumerable<Goal> goals,
            IEnumerable<Category> categories)
        {
            var sb = new StringBuilder();
            sb.AppendLine("sep=,"); // Tell Excel the separator is a comma

            switch (type)
            {
                case "incomes":
                    sb.AppendLine("Data,Nome,Valor,Tipo,Recorrente");
                    foreach (var item in incomes)
                    {
                        sb.AppendLine($"{item.Date.ToString("dd/MM/yyyy")},{EscapeCsvField(item.Name)},{item.Amount.ToString("F2", CultureInfo.InvariantCulture)},{EscapeCsvField(item.Type)},{(item.IsRecurring ? "Sim" : "Não")}");
                    }
                    break;

                case "expenses":
                    sb.AppendLine("Data,Nome,Valor,Categoria,Tipo,Status,Vencimento");
                    foreach (var item in expenses)
                    {
                        sb.AppendLine($"{item.Date.ToString("dd/MM/yyyy")},{EscapeCsvField(item.Name)},{item.Amount.ToString("F2", CultureInfo.InvariantCulture)},{EscapeCsvField(item.Category)},{EscapeCsvField(item.ExpenseType)},{EscapeCsvField(item.Status)},{item.DueDate?.ToString("dd/MM/yyyy") ?? ""}");
                    }
                    break;

                case "history":
                    sb.AppendLine("Data,Nome,Valor,Tipo (Receita/Despesa),Categoria");
                    foreach (var item in history)
                    {
                        sb.AppendLine($"{item.Date.ToString("dd/MM/yyyy")},{EscapeCsvField(item.Name)},{item.Amount.ToString("F2", CultureInfo.InvariantCulture)},{EscapeCsvField(item.Type)},{EscapeCsvField(item.Category)}");
                    }
                    break;

                case "daily-expenses":
                    sb.AppendLine("Data,Nome,Valor,Categoria");
                    foreach (var item in dailyExpenses)
                    {
                        sb.AppendLine($"{item.Date.ToString("dd/MM/yyyy")},{EscapeCsvField(item.Name)},{item.Amount.ToString("F2", CultureInfo.InvariantCulture)},{EscapeCsvField(item.Category)}");
                    }
                    break;

                case "bills":
                    sb.AppendLine("Nome,ValorOriginal,ValorPago,Vencimento,Status,Parcela");
                    foreach (var item in bills)
                    {
                        var valorPago = item.Status == "Pago" ? item.Amount.ToString("F2", CultureInfo.InvariantCulture) : "0.00";
                        var vencimento = item.DueDate?.ToString("dd/MM/yyyy") ?? (item.DueDay.HasValue ? $"Dia {item.DueDay}" : "");
                        sb.AppendLine($"{EscapeCsvField(item.Name)},{item.Amount.ToString("F2", CultureInfo.InvariantCulture)},{valorPago},{EscapeCsvField(vencimento)},{EscapeCsvField(item.Status)},");
                    }
                    break;

                case "goals":
                    sb.AppendLine("Nome,ValorAlvo,ValorAtual,Prazo,Progresso");
                    foreach (var item in goals)
                    {
                        var progress = item.TargetAmount > 0 ? (item.CurrentAmount / item.TargetAmount) * 100 : 0;
                        sb.AppendLine($"{EscapeCsvField(item.Name)},{item.TargetAmount.ToString("F2", CultureInfo.InvariantCulture)},{item.CurrentAmount.ToString("F2", CultureInfo.InvariantCulture)},{item.EndDate?.ToString("dd/MM/yyyy") ?? ""},{progress.ToString("F2", CultureInfo.InvariantCulture)}%");
                    }
                    break;

                case "categories":
                    sb.AppendLine("Nome,Tipo (Entrada/Saída/Ambos)");
                    foreach (var item in categories)
                    {
                        sb.AppendLine($"{EscapeCsvField(item.Name)},{EscapeCsvField(item.Type)}");
                    }
                    break;

                default:
                    return null;
            }

            return sb.ToString();
        }

        private string EscapeCsvField(string field)
        {
            if (string.IsNullOrEmpty(field)) return "";
            if (field.Contains(",") || field.Contains("\"") || field.Contains("\n") || field.Contains("\r"))
            {
                return $"\"{field.Replace("\"", "\"\"")}\"";
            }
            return field;
        }
    }
}
