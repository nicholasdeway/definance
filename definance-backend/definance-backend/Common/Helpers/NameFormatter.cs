using System;

namespace definance_backend.Common.Helpers
{
    public static class NameFormatter
    {
        public static string NormalizeName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return name;

            name = name.Trim().ToLowerInvariant();

            var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);

            for (int i = 0; i < parts.Length; i++)
            {
                var word = parts[i];

                if (word.Length == 1)
                {
                    parts[i] = char.ToUpperInvariant(word[0]).ToString();
                }
                else
                {
                    parts[i] = char.ToUpperInvariant(word[0]) + word.Substring(1);
                }
            }

            return string.Join(' ', parts);
        }
    }
}