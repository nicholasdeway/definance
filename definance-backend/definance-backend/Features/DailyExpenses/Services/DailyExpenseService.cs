using definance_backend.Features.DailyExpenses.DTOs;
using definance_backend.Features.DailyExpenses.Models;
using definance_backend.Domain.Entities;
using definance_backend.Features.Expenses.Repositories;
using definance_backend.Features.Categories.Repositories;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Text;
using definance_backend.Features.Shared.Services;

namespace definance_backend.Features.DailyExpenses.Services
{
    public class DailyExpenseService : IDailyExpenseService
    {
        private readonly IExpenseRepository _expenseRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IQuickExpenseParser _fallbackParser;
        private readonly ILogger<DailyExpenseService> _logger;
        private readonly HttpClient _httpClient;
        private readonly string _aiServiceUrl;
        private readonly IDateTimeProvider _dateTimeProvider;

        public DailyExpenseService(
            IExpenseRepository expenseRepository, 
            ICategoryRepository categoryRepository,
            IQuickExpenseParser fallbackParser,
            ILogger<DailyExpenseService> logger,
            HttpClient httpClient,
            IConfiguration configuration,
            IDateTimeProvider dateTimeProvider)
        {
            _expenseRepository = expenseRepository;
            _categoryRepository = categoryRepository;
            _fallbackParser = fallbackParser;
            _logger = logger;
            _httpClient = httpClient;
            _aiServiceUrl = configuration["AiService:Url"] ?? "http://localhost:8000/parse-expense";
            _dateTimeProvider = dateTimeProvider;
        }

        public async Task<QuickExpenseResponseDto> CreateQuickExpenseAsync(Guid userId, QuickExpenseRequestDto dto)
        {
            _logger.LogInformation("Iniciando processamento de gasto rápido para usuário {UserId}: {Input}", userId, dto.Input);

            var userCategories = await _categoryRepository.GetByUserIdAsync(userId);
            var categoryNames = userCategories
                .Select(c => string.IsNullOrEmpty(c.Keywords) ? $"{c.Name} [{c.Type}]" : $"{c.Name} [{c.Type}] ({c.Keywords})")
                .ToList();

            ParsedExpenseResult parsedResult;

            try
            {
                var aiResult = await TryParseWithAIAsync(dto.Input, categoryNames);
                if (aiResult != null && aiResult.Amount > 0)
                {
                    parsedResult = aiResult;
                }
                else
                {
                    _logger.LogWarning("IA retornou resultado inválido. Usando parser de fallback (Regex).");
                    parsedResult = _fallbackParser.Parse(dto.Input);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao chamar serviço de IA. Usando parser de fallback (Regex).");
                parsedResult = _fallbackParser.Parse(dto.Input);
            }

            // Sempre salva como Gasto (Saída)
            var expense = new Expense
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Name = string.IsNullOrEmpty(parsedResult.Description) ? "Gasto rápido" : char.ToUpper(parsedResult.Description[0]) + parsedResult.Description.Substring(1),
                Amount = parsedResult.Amount,
                Category = string.IsNullOrEmpty(parsedResult.Category) ? "Outros" : parsedResult.Category,
                Date = parsedResult.Date,
                ExpenseType = "Variável",
                Status = "Pago",
                TransactionType = parsedResult.TransactionType,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _expenseRepository.CreateAsync(expense);

            return new QuickExpenseResponseDto
            {
                Id = expense.Id,
                Name = expense.Name,
                Amount = expense.Amount,
                Category = expense.Category,
                Date = expense.Date,
                TransactionType = expense.TransactionType,
                Status = expense.Status
            };
        }

        private async Task<ParsedExpenseResult?> TryParseWithAIAsync(string input, List<string> categories)
        {
            var payload = new { text = input, categories = categories };
            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var content = new StringContent(JsonSerializer.Serialize(payload, options), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(_aiServiceUrl, content);

            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                var deserializeOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var aiData = JsonSerializer.Deserialize<AiParsedResponseDto>(json, deserializeOptions);

                if (aiData != null)
                {
                    DateTime baseDate = _dateTimeProvider.GetExactAppDateTime();
                    if (aiData.Date?.ToLower() == "ontem")
                    {
                        baseDate = baseDate.AddDays(-1);
                    }

                    // Preserva o horário exato da transação (não normaliza para meia-noite)
                    var normalizedDate = baseDate;

                    return new ParsedExpenseResult
                    {
                        Description = aiData.Name,
                        Amount = (decimal)aiData.Amount,
                        Category = aiData.Category,
                        TransactionType = aiData.Type ?? "Saída",
                        Date = normalizedDate
                    };
                }
            }
            return null;
        }

    }
}