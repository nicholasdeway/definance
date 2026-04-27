using System.Globalization;
using System.Text.RegularExpressions;
using definance_backend.Features.DailyExpenses.Models;

namespace definance_backend.Features.DailyExpenses.Services
{
    public class QuickExpenseParser : IQuickExpenseParser
    {
        public ParsedExpenseResult Parse(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                throw new ArgumentException("A entrada não pode estar vazia.");

            // 1. Identificar data (hoje/ontem)
            DateTime date = DateTime.Now;
            var dateMatch = Regex.Match(input, @"\b(hoje|ontem)\b", RegexOptions.IgnoreCase);
            if (dateMatch.Success)
            {
                if (dateMatch.Value.ToLower() == "ontem")
                    date = DateTime.Now.AddDays(-1);
                
                input = input.Remove(dateMatch.Index, dateMatch.Length).Trim();
            }

            // 2. Identificar valor (suporte a ; , e .)
            var amountMatch = Regex.Match(input, @"(\d+(?:[.,;]\d{1,2})?)");
            if (!amountMatch.Success)
                throw new ArgumentException("Não foi possível identificar um valor numérico.");

            string valueStr = amountMatch.Value.Replace(";", ".");
            if (valueStr.Contains(",") && !valueStr.Contains("."))
                valueStr = valueStr.Replace(",", ".");

            if (!decimal.TryParse(valueStr, NumberStyles.Any, CultureInfo.InvariantCulture, out decimal amount))
                throw new ArgumentException("O formato do valor é inválido.");

            // 3. Descrição
            string description = input.Replace(amountMatch.Value, "").Trim();
            if (string.IsNullOrEmpty(description))
                description = "Gasto rápido";
            else
            {
                // Garantir Uppercase na primeira letra
                description = char.ToUpper(description[0]) + description.Substring(1);
            }

            return new ParsedExpenseResult
            {
                Description = description,
                Amount = amount,
                Date = date
            };
        }
    }
}