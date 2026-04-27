using definance_backend.Features.DailyExpenses.DTOs;
using definance_backend.Features.DailyExpenses.Models;
using definance_backend.Domain.Entities;
using definance_backend.Features.Expenses.Repositories;
using definance_backend.Features.Categories.Repositories;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Text;

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

        public DailyExpenseService(
            IExpenseRepository expenseRepository, 
            ICategoryRepository categoryRepository,
            IQuickExpenseParser fallbackParser,
            ILogger<DailyExpenseService> logger,
            HttpClient httpClient,
            IConfiguration configuration)
        {
            _expenseRepository = expenseRepository;
            _categoryRepository = categoryRepository;
            _fallbackParser = fallbackParser;
            _logger = logger;
            _httpClient = httpClient;
            _aiServiceUrl = configuration["AiService:Url"] ?? "http://localhost:8000/parse-expense";
        }

        public async Task<QuickExpenseResponseDto> CreateQuickExpenseAsync(Guid userId, QuickExpenseRequestDto dto)
        {
            _logger.LogInformation("Iniciando processamento de gasto rápido para usuário {UserId}: {Input}", userId, dto.Input);

            var userCategories = await _categoryRepository.GetByUserIdAsync(userId);
            var categoryNames = userCategories.Select(c => c.Name).ToList();

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
                Name = parsedResult.Description,
                Amount = parsedResult.Amount,
                Category = string.IsNullOrEmpty(parsedResult.Category) ? "Outros" : parsedResult.Category,
                Date = parsedResult.Date,
                ExpenseType = "Variável",
                Status = "Pago",
                TransactionType = "Saída",
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
                TransactionType = "Saída",
                Status = expense.Status
            };
        }

        private async Task<ParsedExpenseResult?> TryParseWithAIAsync(string input, List<string> categories)
        {
            var payload = new { text = input, categories = categories };
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(_aiServiceUrl, content);

            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var aiData = JsonSerializer.Deserialize<AiParsedResponse>(json, options);

                if (aiData != null)
                {
                    return new ParsedExpenseResult
                    {
                        Description = aiData.Name,
                        Amount = (decimal)aiData.Amount,
                        Category = aiData.Category,
                        TransactionType = "Saída", // Ignora detecção de entrada da IA
                        Date = aiData.Date?.ToLower() == "ontem" ? DateTime.Now.AddDays(-1) : DateTime.Now
                    };
                }
            }
            return null;
        }

        private class AiParsedResponse
        {
            public string Name { get; set; } = string.Empty;
            public double Amount { get; set; }
            public string Category { get; set; } = string.Empty;
            public string? Date { get; set; }
        }
    }
}