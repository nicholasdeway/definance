using Dapper;
using definance_backend.Domain.Entities;
using Npgsql;

namespace definance_backend.Features.Categories.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly NpgsqlConnection _connection;

        public CategoryRepository(NpgsqlConnection connection)
        {
            _connection = connection;
        }

        public async Task<Category?> GetByIdAsync(Guid id)
        {
            const string sql = @"
                SELECT 
                    id, 
                    user_id AS ""UserId"", 
                    name AS ""Name"", 
                    type AS ""Type"", 
                    color AS ""Color"", 
                    icon AS ""Icon"", 
                    keywords AS ""Keywords"",
                    is_system AS ""IsSystem"", 
                    created_at AS ""CreatedAt"", 
                    updated_at AS ""UpdatedAt""
                FROM categories
                WHERE id = @Id;
            ";

            return await _connection.QueryFirstOrDefaultAsync<Category>(sql, new { Id = id });
        }

        public async Task<IEnumerable<Category>> GetByUserIdAsync(Guid userId)
        {
            const string sql = @"
                SELECT 
                    id, user_id AS ""UserId"", name AS ""Name"", type AS ""Type"", 
                    color AS ""Color"", icon AS ""Icon"", keywords AS ""Keywords"", is_system AS ""IsSystem""
                FROM categories
                WHERE user_id = @UserId OR is_system = true
                ORDER BY is_system DESC, name ASC;
            ";

            return await _connection.QueryAsync<Category>(sql, new { UserId = userId });
        }

        public async Task<IEnumerable<Category>> GetSystemCategoriesAsync()
        {
            const string sql = @"
                SELECT 
                    id, user_id AS ""UserId"", name AS ""Name"", type AS ""Type"", 
                    color AS ""Color"", icon AS ""Icon"", keywords AS ""Keywords"", is_system AS ""IsSystem""
                FROM categories
                WHERE is_system = true;
            ";

            return await _connection.QueryAsync<Category>(sql);
        }

        public async Task CreateAsync(Category category)
        {
            const string sql = @"
                INSERT INTO categories (id, user_id, name, type, color, icon, keywords, is_system, created_at, updated_at)
                VALUES (@Id, @UserId, @Name, @Type, @Color, @Icon, @Keywords, @IsSystem, NOW(), NOW());
            ";

            await _connection.ExecuteAsync(sql, category);
        }

        public async Task UpdateAsync(Category category)
        {
            const string sql = @"
                UPDATE categories SET
                    name = @Name,
                    type = @Type,
                    color = @Color,
                    icon = @Icon,
                    keywords = @Keywords,
                    updated_at = NOW()
                WHERE id = @Id AND is_system = false;
            ";

            await _connection.ExecuteAsync(sql, category);
        }

        public async Task DeleteAsync(Guid id)
        {
            const string sql = "DELETE FROM categories WHERE id = @Id AND is_system = false;";

            await _connection.ExecuteAsync(sql, new { Id = id });
        }

        public async Task<bool> IsInUseAsync(Guid categoryId)
        {
            const string sql = @"
                SELECT EXISTS (
                    SELECT 1 FROM expenses WHERE category_id = @CategoryId
                    UNION ALL
                    SELECT 1 FROM incomes WHERE category_id = @CategoryId
                    UNION ALL
                    SELECT 1 FROM bills WHERE category_id = @CategoryId
                );
            ";

            return await _connection.ExecuteScalarAsync<bool>(sql, new { CategoryId = categoryId });
        }

        public async Task<bool> ExistsByNameAsync(Guid userId, string name, string type)
        {
            const string sql = @"
                SELECT EXISTS (
                    SELECT 1 FROM categories 
                    WHERE (user_id = @UserId OR is_system = true)
                    AND LOWER(name) = LOWER(@Name)
                    AND (type = @Type OR type = 'Ambos' OR @Type = 'Ambos')
                );
            ";

            return await _connection.ExecuteScalarAsync<bool>(sql, new { UserId = userId, Name = name, Type = type });
        }
    }
}
