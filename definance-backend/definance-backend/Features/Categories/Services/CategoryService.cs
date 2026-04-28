using definance_backend.Domain.Entities;
using definance_backend.Features.Categories.DTOs;
using definance_backend.Features.Categories.Repositories;
using Microsoft.Extensions.Logging;

namespace definance_backend.Features.Categories.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly ILogger<CategoryService> _logger;

        public CategoryService(ICategoryRepository categoryRepository, ILogger<CategoryService> logger)
        {
            _categoryRepository = categoryRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<CategoryDto>> GetUserCategoriesAsync(Guid userId)
        {
            var categories = await _categoryRepository.GetByUserIdAsync(userId);
            return categories.Select(MapToDto);
        }

        public async Task<CategoryDto> CreateCategoryAsync(Guid userId, CreateCategoryDto dto)
        {
            var exists = await _categoryRepository.ExistsByNameAsync(userId, dto.Name, dto.Type);
            if (exists)
                throw new InvalidOperationException("Já existe uma categoria com este nome para o tipo selecionado.");

            var category = new Category
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Name = dto.Name,
                Type = dto.Type,
                Color = dto.Color,
                Icon = dto.Icon,
                Keywords = dto.Keywords,
                MonthlyLimit = dto.MonthlyLimit,
                IsSystem = false
            };

            await _categoryRepository.CreateAsync(category);
            return MapToDto(category);
        }

        public async Task<CategoryDto> UpdateCategoryAsync(Guid userId, Guid categoryId, UpdateCategoryDto dto)
        {
            var category = await _categoryRepository.GetByIdAsync(categoryId);

            if (category == null)
                throw new KeyNotFoundException("Categoria não encontrada.");

            if (category.UserId != userId || category.IsSystem)
                throw new UnauthorizedAccessException("Você não tem permissão para editar esta categoria.");

            if (category.Name != dto.Name || category.Type != dto.Type)
            {
                var exists = await _categoryRepository.ExistsByNameAsync(userId, dto.Name, dto.Type);
                if (exists)
                    throw new InvalidOperationException("Já existe uma categoria com este nome para o tipo selecionado.");
            }

            category.Name = dto.Name;
            category.Type = dto.Type;
            category.Color = dto.Color;
            category.Icon = dto.Icon;
            category.Keywords = dto.Keywords;
            category.MonthlyLimit = dto.MonthlyLimit;

            await _categoryRepository.UpdateAsync(category);
            return MapToDto(category);
        }

        public async Task DeleteCategoryAsync(Guid userId, Guid categoryId)
        {
            _logger.LogInformation("Usuário {UserId} solicitou exclusão da categoria {CategoryId}", userId, categoryId);

            var category = await _categoryRepository.GetByIdAsync(categoryId);

            if (category == null)
                throw new KeyNotFoundException("Categoria não encontrada.");

            if (category.UserId != userId || category.IsSystem)
                throw new UnauthorizedAccessException("Você não tem permissão para excluir esta categoria.");

            var isInUse = await _categoryRepository.IsInUseAsync(categoryId);
            if (isInUse)
                throw new InvalidOperationException("Não é possível excluir esta categoria pois ela está sendo usada em lançamentos.");

            await _categoryRepository.DeleteAsync(categoryId);
            _logger.LogInformation("Categoria {CategoryId} excluída com sucesso", categoryId);
        }

        public async Task UpdateCategoryLimitAsync(Guid userId, Guid categoryId, decimal? monthlyLimit)
        {
            var category = await _categoryRepository.GetByIdAsync(categoryId);

            if (category == null)
                throw new KeyNotFoundException("Categoria não encontrada.");

            if (!category.IsSystem && category.UserId != userId)
                throw new UnauthorizedAccessException("Você não tem permissão para configurar o limite desta categoria.");

            await _categoryRepository.UpdateLimitAsync(categoryId, monthlyLimit);
        }

        private static CategoryDto MapToDto(Category category) => new()
        {
            Id = category.Id,
            Name = category.Name,
            Type = category.Type,
            Color = category.Color,
            Icon = category.Icon,
            Keywords = category.Keywords,
            IsSystem = category.IsSystem,
            MonthlyLimit = category.MonthlyLimit
        };
    }
}