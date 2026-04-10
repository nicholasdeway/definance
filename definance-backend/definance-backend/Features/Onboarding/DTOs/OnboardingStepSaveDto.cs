using System.Collections.Generic;
using System.Text.Json;

namespace definance_backend.Features.Onboarding.DTOs
{
    public class OnboardingStepSaveDto
    {
        public int Step { get; set; }
        public JsonElement Data { get; set; }
    }
}