namespace definance_backend.Common.Settings
{
    public class SubscriptionSettings
    {
        /// <summary>Dias de período de trial para novos usuários.</summary>
        public int TrialDays { get; set; } = 7;

        /// <summary>Dias extras de grace period adicionados ao final do período pago (buffer de processamento).</summary>
        public int GraceDays { get; set; } = 2;

        /// <summary>Janela em dias dentro da qual o usuário pode solicitar reembolso após a assinatura.</summary>
        public int RefundWindowDays { get; set; } = 7;

        /// <summary>Preço mensal em BRL (Mercado Pago — Stripe usa price IDs).</summary>
        public decimal MonthlyPriceBrl { get; set; } = 19.90m;

        /// <summary>Preço anual em BRL (Mercado Pago — Stripe usa price IDs).</summary>
        public decimal AnnualPriceBrl { get; set; } = 199.90m;

        /// <summary>Código da moeda (usado no Mercado Pago).</summary>
        public string Currency { get; set; } = "BRL";
    }
}
