using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CommunicationTrainer.Api.Data;
using CommunicationTrainer.Api.DTOs;
using CommunicationTrainer.Api.Models;
using Microsoft.AspNetCore.Authorization;

namespace CommunicationTrainer.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminController(AppDbContext db) => _db = db;

    // ==================== ФОРМАТЫ (чтение) ====================

    [HttpGet("formats")]
    public async Task<List<FormatDto>> GetFormats()
    {
        return await _db.Formats
            .OrderBy(f => f.SortOrder)
            .Select(f => new FormatDto(f.Id, f.Code, f.Name, f.Color ?? "#999"))
            .ToListAsync();
    }

    // ==================== СЦЕНАРИИ ====================

    [HttpGet("scenarios")]
    public async Task<List<ScenarioListDto>> GetScenarios()
    {
        return await _db.Scenarios
            .Include(s => s.RecipientFormat)
            .OrderByDescending(s => s.Id)
            .Select(s => new ScenarioListDto(
                s.Id, s.Title, s.RecipientName,
                s.RecipientFormat!.Name, s.IsActive,
                s.PhraseOptions.Count(o => !string.IsNullOrEmpty(o.Text)),
                s.PhraseOptions.Count
            ))
            .ToListAsync();
    }
    /// <summary>
    /// Получить всех пользователей (с поиском по email)
    /// </summary>
    [HttpGet("users")]
    public async Task<List<UserAdminDto>> GetUsers([FromQuery] string? search = null)
    {
        var query = _db.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(u => u.Email.Contains(search) || u.Name.Contains(search));

        return await query
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new UserAdminDto(
                u.Id,
                u.Email,
                u.Name,
                u.Role,
                u.CreatedAt,
                u.TrainingSessions.Count,
                u.TrainingSessions.Count(s => s.Status == "completed")
            ))
            .ToListAsync();
    }

    /// <summary>
    /// Изменить роль пользователя
    /// </summary>
    [HttpPut("users/{userId}/role")]
    public async Task<UserAdminDto> UpdateUserRole(Guid userId, [FromBody] UpdateRoleRequest req)
    {
        var user = await _db.Users.FindAsync(userId)
                   ?? throw new Exception("Пользователь не найден");

        user.Role = req.Role;
        await _db.SaveChangesAsync();

        var sessions = await _db.TrainingSessions.CountAsync(s => s.UserId == userId);
        var completed = await _db.TrainingSessions.CountAsync(s => s.UserId == userId && s.Status == "completed");

        return new UserAdminDto(user.Id, user.Email, user.Name, user.Role, user.CreatedAt, sessions, completed);
    }

    /// <summary>
    /// Удалить пользователя
    /// </summary>
    [HttpDelete("users/{userId}")]
    public async Task DeleteUser(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId)
                   ?? throw new Exception("Пользователь не найден");

        // Отвязываем сессии (ставим UserId = null, а не удаляем)
        var sessions = await _db.TrainingSessions.Where(s => s.UserId == userId).ToListAsync();
        foreach (var session in sessions)
            session.UserId = null;

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
    }


    [HttpGet("scenarios/{id}")]
    public async Task<ScenarioFullDto> GetScenario(int id)
    {
        var scenario = await _db.Scenarios
            .Include(s => s.RecipientFormat)
            .Include(s => s.PhraseOptions).ThenInclude(o => o.Format)
            .Include(s => s.PhraseOptions).ThenInclude(o => o.Part)
            .FirstAsync(s => s.Id == id);

        return new ScenarioFullDto(
            scenario.Id, scenario.Title, scenario.SituationText,
            scenario.RecipientName, scenario.RecipientFormatId,
            scenario.HintText ?? "", scenario.IsActive,
            scenario.PhraseOptions
                .OrderBy(o => o.Part!.OrderNumber)
                .ThenBy(o => o.Format!.SortOrder)
                .Select(o => new PhraseFullDto(
                    o.Id, o.Part!.Code, o.Part.Name,
                    o.Format!.Code, o.Format.Name, o.Format.Color ?? "#999",
                    o.Text,
                    o.EmotionalScore, o.SafetyScore, o.StructuralScore
                )).ToList()
        );
    }

    [HttpPost("scenarios")]
    public async Task<ScenarioFullDto> CreateScenario([FromBody] CreateScenarioRequest req)
    {
        var scenario = new Scenario
        {
            Title = req.Title,
            SituationText = req.SituationText,
            RecipientName = req.RecipientName,
            RecipientFormatId = req.RecipientFormatId,
            HintText = req.HintText,
            IsActive = true
        };
        _db.Scenarios.Add(scenario);
        await _db.SaveChangesAsync();

        // Создаём 30 пустых фраз (3 части × 10 форматов)
        var parts = await _db.MessageParts.ToListAsync();
        var formats = await _db.Formats.ToListAsync();

        foreach (var part in parts)
        foreach (var format in formats)
        {
            _db.PhraseOptions.Add(new PhraseOption
            {
                ScenarioId = scenario.Id,
                PartId = part.Id,
                FormatId = format.Id,
                Text = "",
                EmotionalScore = format.IdealEmotional / 3,
                SafetyScore = format.IdealSafety / 3,
                StructuralScore = format.IdealStructural / 3
            });
        }
        await _db.SaveChangesAsync();

        return await GetScenario(scenario.Id);
    }

    [HttpPut("scenarios/{id}")]
    public async Task<ScenarioFullDto> UpdateScenario(int id, [FromBody] UpdateScenarioRequest req)
    {
        var scenario = await _db.Scenarios.FindAsync(id)
            ?? throw new Exception("Сценарий не найден");

        scenario.Title = req.Title;
        scenario.SituationText = req.SituationText;
        scenario.RecipientName = req.RecipientName;
        scenario.RecipientFormatId = req.RecipientFormatId;
        scenario.HintText = req.HintText;
        scenario.IsActive = req.IsActive;

        await _db.SaveChangesAsync();
        return await GetScenario(id);
    }

    [HttpDelete("scenarios/{id}")]
    public async Task DeleteScenario(int id)
    {
        var scenario = await _db.Scenarios.FindAsync(id)
            ?? throw new Exception("Сценарий не найден");
        _db.Scenarios.Remove(scenario);
        await _db.SaveChangesAsync();
    }

    // ==================== ФРАЗЫ ====================

    [HttpPut("phrases/{id}")]
    public async Task<PhraseFullDto> UpdatePhrase(int id, [FromBody] UpdatePhraseRequest req)
    {
        var phrase = await _db.PhraseOptions
            .Include(o => o.Format)
            .Include(o => o.Part)
            .FirstAsync(o => o.Id == id);

        phrase.Text = req.Text;
        phrase.EmotionalScore = req.EmotionalScore;
        phrase.SafetyScore = req.SafetyScore;
        phrase.StructuralScore = req.StructuralScore;

        await _db.SaveChangesAsync();

        return new PhraseFullDto(
            phrase.Id, phrase.Part!.Code, phrase.Part.Name,
            phrase.Format!.Code, phrase.Format.Name, phrase.Format.Color ?? "#999",
            phrase.Text,
            phrase.EmotionalScore, phrase.SafetyScore, phrase.StructuralScore
        );
    }

    // ==================== СТАТИСТИКА ====================

    [HttpGet("stats")]
    public async Task<AdminStatsDto> GetStats()
    {
        return new AdminStatsDto(
            await _db.Scenarios.CountAsync(s => s.IsActive),
            await _db.TrainingSessions.CountAsync(),
            await _db.TrainingSessions.CountAsync(s => s.Status == "completed"),
            await _db.PhraseOptions.CountAsync(o => !string.IsNullOrEmpty(o.Text)),
            await _db.PhraseOptions.CountAsync()
        );
    }
    
    /// <summary>
    /// Создать одну фразу вручную
    /// </summary>
    [HttpPost("scenarios/{scenarioId}/phrases")]
    public async Task<PhraseFullDto> CreatePhrase(int scenarioId, [FromBody] CreatePhraseRequest req)
    {
        var part = await _db.MessageParts.FirstAsync(p => p.Code == req.PartCode);
        var format = await _db.Formats.FirstAsync(f => f.Code == req.FormatCode);

        var phrase = new PhraseOption
        {
            ScenarioId = scenarioId,
            PartId = part.Id,
            FormatId = format.Id,
            Text = req.Text,
            EmotionalScore = req.EmotionalScore,
            SafetyScore = req.SafetyScore,
            StructuralScore = req.StructuralScore
        };
        _db.PhraseOptions.Add(phrase);
        await _db.SaveChangesAsync();

        return new PhraseFullDto(
            phrase.Id, part.Code, part.Name,
            format.Code, format.Name, format.Color ?? "#999",
            phrase.Text,
            phrase.EmotionalScore, phrase.SafetyScore, phrase.StructuralScore
        );
    }
    
    /// <summary>
/// Получить все форматы с полными данными
/// </summary>
[HttpGet("formats/full")]
public async Task<List<FormatFullDto>> GetFormatsFull()
{
    return await _db.Formats
        .OrderBy(f => f.SortOrder)
        .Select(f => new FormatFullDto(
            f.Id,
            f.Code,
            f.Name,
            f.Description ?? "",
            f.Color ?? "#999",
            f.IdealEmotional,
            f.IdealSafety,
            f.IdealStructural,
            f.ToleranceEmotional,
            f.ToleranceSafety,
            f.ToleranceStructural,
            f.WeightEmotional,
            f.WeightSafety,
            f.WeightStructural,
            f.SortOrder
        ))
        .ToListAsync();
}

/// <summary>
/// Обновить формат
/// </summary>
[HttpPut("formats/{id}")]
public async Task<FormatFullDto> UpdateFormat(int id, [FromBody] UpdateFormatRequest req)
{
    var format = await _db.Formats.FindAsync(id)
        ?? throw new Exception("Формат не найден");

    format.Name = req.Name;
    format.Description = req.Description;
    format.Color = req.Color;
    format.IdealEmotional = req.IdealEmotional;
    format.IdealSafety = req.IdealSafety;
    format.IdealStructural = req.IdealStructural;
    format.ToleranceEmotional = req.ToleranceEmotional;
    format.ToleranceSafety = req.ToleranceSafety;
    format.ToleranceStructural = req.ToleranceStructural;
    format.WeightEmotional = req.WeightEmotional;
    format.WeightSafety = req.WeightSafety;
    format.WeightStructural = req.WeightStructural;
    format.SortOrder = req.SortOrder;

    await _db.SaveChangesAsync();

    return new FormatFullDto(
        format.Id, format.Code, format.Name, format.Description ?? "",
        format.Color ?? "#999",
        format.IdealEmotional, format.IdealSafety, format.IdealStructural,
        format.ToleranceEmotional, format.ToleranceSafety, format.ToleranceStructural,
        format.WeightEmotional, format.WeightSafety, format.WeightStructural,
        format.SortOrder
    );
}

/// <summary>
/// Сбросить веса фраз к значениям формата (для конкретного сценария)
/// </summary>
[HttpPost("scenarios/{scenarioId}/reset-phrases-scores")]
public async Task ResetPhraseScores(int scenarioId)
{
    var phrases = await _db.PhraseOptions
        .Include(p => p.Format)
        .Where(p => p.ScenarioId == scenarioId)
        .ToListAsync();

    foreach (var phrase in phrases)
    {
        phrase.EmotionalScore = phrase.Format!.IdealEmotional / 3;
        phrase.SafetyScore = phrase.Format.IdealSafety / 3;
        phrase.StructuralScore = phrase.Format.IdealStructural / 3;
    }

    await _db.SaveChangesAsync();
}

/// <summary>
/// Создать новый формат
/// </summary>
[HttpPost("formats")]
public async Task<FormatFullDto> CreateFormat([FromBody] CreateFormatRequest req)
{
    // Проверяем уникальность кода
    if (await _db.Formats.AnyAsync(f => f.Code == req.Code))
        throw new Exception($"Формат с кодом '{req.Code}' уже существует");

    var maxOrder = await _db.Formats.MaxAsync(f => (int?)f.SortOrder) ?? 0;

    var format = new Format
    {
        Code = req.Code,
        Name = req.Name,
        Description = req.Description,
        Color = req.Color,
        IdealEmotional = req.IdealEmotional,
        IdealSafety = req.IdealSafety,
        IdealStructural = req.IdealStructural,
        ToleranceEmotional = req.ToleranceEmotional,
        ToleranceSafety = req.ToleranceSafety,
        ToleranceStructural = req.ToleranceStructural,
        WeightEmotional = req.WeightEmotional,
        WeightSafety = req.WeightSafety,
        WeightStructural = req.WeightStructural,
        SortOrder = maxOrder + 1
    };

    _db.Formats.Add(format);
    await _db.SaveChangesAsync();

    return new FormatFullDto(
        format.Id, format.Code, format.Name, format.Description ?? "",
        format.Color ?? "#999",
        format.IdealEmotional, format.IdealSafety, format.IdealStructural,
        format.ToleranceEmotional, format.ToleranceSafety, format.ToleranceStructural,
        format.WeightEmotional, format.WeightSafety, format.WeightStructural,
        format.SortOrder
    );
}



/// <summary>
/// Удалить формат
/// </summary>
[HttpDelete("formats/{id}")]
public async Task DeleteFormat(int id)
{
    var format = await _db.Formats
        .Include(f => f.PhraseOptions)
        .Include(f => f.Scenarios)
        .FirstOrDefaultAsync(f => f.Id == id)
        ?? throw new Exception("Формат не найден");

    if (format.Scenarios.Any())
        throw new Exception("Нельзя удалить формат, который используется в сценариях как формат адресата");

    // Удаляем связанные фразы
    _db.PhraseOptions.RemoveRange(format.PhraseOptions);
    _db.Formats.Remove(format);
    await _db.SaveChangesAsync();
}
}

// ==================== DTO ДЛЯ АДМИНКИ ====================

public record FormatDto(int Id, string Code, string Name, string Color);

public record ScenarioListDto(
    int Id, string Title, string RecipientName,
    string RecipientFormatName, bool IsActive,
    int FilledPhrases, int TotalPhrases
);

public record ScenarioFullDto(
    int Id, string Title, string SituationText,
    string RecipientName, int RecipientFormatId, string HintText, bool IsActive,
    List<PhraseFullDto> Phrases
);

public record PhraseFullDto(
    int Id, string PartCode, string PartName,
    string FormatCode, string FormatName, string FormatColor,
    string Text,
    decimal EmotionalScore, decimal SafetyScore, decimal StructuralScore
);

public record CreateScenarioRequest(
    string Title, string SituationText, string RecipientName,
    int RecipientFormatId, string HintText
);

public record UpdateScenarioRequest(
    string Title, string SituationText, string RecipientName,
    int RecipientFormatId, string HintText, bool IsActive
);

public record UpdatePhraseRequest(
    string Text, decimal EmotionalScore, decimal SafetyScore, decimal StructuralScore
);

public record AdminStatsDto(
    int ActiveScenarios, int TotalSessions, int CompletedSessions,
    int FilledPhrases, int TotalPhrases
);

public record CreatePhraseRequest(
    string PartCode,      // "opening", "middle", "closing"
    string FormatCode,    // "P", "A", "S", ...
    string Text,
    decimal EmotionalScore,
    decimal SafetyScore,
    decimal StructuralScore
);

public record UserAdminDto(
    Guid Id, string Email, string Name, string Role,
    DateTime CreatedAt, int TotalSessions, int CompletedSessions
);

public record UpdateRoleRequest(string Role);

public record FormatFullDto(
    int Id, string Code, string Name, string Description, string Color,
    decimal IdealEmotional, decimal IdealSafety, decimal IdealStructural,
    decimal ToleranceEmotional, decimal ToleranceSafety, decimal ToleranceStructural,
    decimal WeightEmotional, decimal WeightSafety, decimal WeightStructural,
    int SortOrder
);

public record UpdateFormatRequest(
    string Name, string Description, string Color,
    decimal IdealEmotional, decimal IdealSafety, decimal IdealStructural,
    decimal ToleranceEmotional, decimal ToleranceSafety, decimal ToleranceStructural,
    decimal WeightEmotional, decimal WeightSafety, decimal WeightStructural,
    int SortOrder
);

public record CreateFormatRequest(
    string Code, string Name, string Description, string Color,
    decimal IdealEmotional, decimal IdealSafety, decimal IdealStructural,
    decimal ToleranceEmotional, decimal ToleranceSafety, decimal ToleranceStructural,
    decimal WeightEmotional, decimal WeightSafety, decimal WeightStructural
);