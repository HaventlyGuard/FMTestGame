using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CommunicationTrainer.Api.Data;
using CommunicationTrainer.Api.DTOs;
using CommunicationTrainer.Api.Models;

namespace CommunicationTrainer.Api.Controllers;

[ApiController]
[Route("api/admin")]
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