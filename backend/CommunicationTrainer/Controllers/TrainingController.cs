using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CommunicationTrainer.Api.Data;
using CommunicationTrainer.Api.DTOs;
using CommunicationTrainer.Api.Services;

namespace CommunicationTrainer.Api.Controllers;

[ApiController]
[Route("api/training")]
public class TrainingController : ControllerBase
{
    private readonly TrainingService _service;
    private readonly AppDbContext _db;

    public TrainingController(TrainingService service, AppDbContext db)
    {
        _service = service;
        _db = db;
    }

    // ==================== ТРЕНИРОВКА ====================

    /// <summary>
    /// Начать новую тренировку
    /// </summary>
    [HttpPost("start")]
    public async Task<StartResponse> Start([FromBody] int? scenarioId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var uid = userId != null ? Guid.Parse(userId) : (Guid?)null;
        return await _service.StartTraining(scenarioId, uid);
    }

    /// <summary>
    /// Выбрать вариант фразы
    /// </summary>
    [HttpPost("select")]
    public async Task<SelectResponse> Select([FromBody] SelectRequest request) =>
        await _service.SelectPhrase(request.SessionId, request.OptionId);

    /// <summary>
    /// Оценить собранное сообщение
    /// </summary>
    [HttpPost("evaluate")]
    public async Task<EvaluateResponse> Evaluate([FromBody] EvaluateRequest request) =>
        await _service.Evaluate(request.SessionId);

    // ==================== СЕССИИ ====================

    /// <summary>
    /// Получить все сессии (история)
    /// </summary>
    [HttpGet("sessions")]
    public async Task<List<SessionInfoDto>> GetSessions()
    {
        return await _db.TrainingSessions
            .Include(s => s.CurrentScenario)
            .Include(s => s.SelectedPhrases)
            .Include(s => s.MessageResults)
            .OrderByDescending(s => s.StartedAt)
            .Select(s => new SessionInfoDto(
                s.Id,
                s.Status,
                s.CurrentScenario != null ? s.CurrentScenario.Title : null,
                s.SelectedPhrases.Count,
                s.StartedAt,
                s.CompletedAt,
                s.Status == "completed" && s.MessageResults.Any()
                    ? s.MessageResults.OrderByDescending(r => r.EffectivenessPercent).First().EffectivenessPercent
                    : null
            ))
            .ToListAsync();
    }

    /// <summary>
    /// Получить конкретную сессию
    /// </summary>
    [HttpGet("sessions/{sessionId}")]
    public async Task<SessionDetailDto> GetSession(Guid sessionId)
    {
        var session = await _db.TrainingSessions
            .Include(s => s.CurrentScenario)
            .Include(s => s.SelectedPhrases)
                .ThenInclude(sp => sp.Part)
            .Include(s => s.SelectedPhrases)
                .ThenInclude(sp => sp.SelectedOption)
                    .ThenInclude(o => o!.Format)
            .Include(s => s.MessageResults)
                .ThenInclude(r => r.Format)
            .FirstAsync(s => s.Id == sessionId);

        var scenario = await _db.Scenarios
            .Include(s => s.RecipientFormat)
            .FirstOrDefaultAsync(s => s.Id == session.CurrentScenarioId);

        return new SessionDetailDto(
            session.Id,
            session.Status,
            scenario != null ? new ScenarioDto(
                scenario.Id, scenario.Title, scenario.SituationText,
                scenario.RecipientName,
                scenario.RecipientFormat?.Code ?? "",
                scenario.RecipientFormat?.Name ?? "",
                scenario.HintText ?? ""
            ) : null,
            session.SelectedPhrases
                .OrderBy(sp => sp.Part!.OrderNumber)
                .Select(sp => new SelectedPhraseInfo(
                    sp.Part!.Code, sp.Part.Name,
                    sp.SelectedOption!.Text,
                    sp.SelectedOption.Format!.Code,
                    sp.SelectedOption.Format.Color ?? "#999"
                )).ToList(),
            session.MessageResults
                .OrderByDescending(r => r.EffectivenessPercent)
                .Select(r => new EffectivenessResult(
                    r.Format!.Code, r.Format.Name, r.Format.Color ?? "#999",
                    (double)r.EffectivenessPercent,
                    r.FormatId == scenario?.RecipientFormatId
                )).ToList(),
            session.StartedAt,
            session.CompletedAt
        );
    }

   [HttpPost("sessions/{sessionId}/continue")]
public async Task<ContinueResponse> ContinueSession(Guid sessionId)
{
    var session = await _db.TrainingSessions
        .Include(s => s.CurrentScenario)
        .Include(s => s.SelectedPhrases)
            .ThenInclude(sp => sp.Part)
        .Include(s => s.SelectedPhrases)
            .ThenInclude(sp => sp.SelectedOption)
                .ThenInclude(o => o!.Format)
        .FirstAsync(s => s.Id == sessionId);

    if (session.Status == "completed")
        throw new Exception("Сессия завершена. Начните новую.");

    var scenarioId = session.CurrentScenarioId!.Value;
    var parts = new[] { "opening", "middle", "closing" };

    // Определяем, какая часть следующая
    var completedParts = session.SelectedPhrases
        .Where(sp => sp.ScenarioId == scenarioId)
        .Select(sp => sp.Part!.Code)
        .ToList();

    var nextPartCode = parts.FirstOrDefault(p => !completedParts.Contains(p));

    // Формируем выбранные фразы
    var selected = session.SelectedPhrases
        .Where(sp => sp.ScenarioId == scenarioId)
        .OrderBy(sp => sp.Part!.OrderNumber)
        .Select(sp => new SelectedPhraseInfo(
            sp.Part!.Code, 
            sp.Part.Name, 
            sp.SelectedOption!.Text,
            sp.SelectedOption.Format!.Code, 
            sp.SelectedOption.Format.Color ?? "#999"
        )).ToList();

    if (nextPartCode == null)
    {
        // Все части выбраны — нужно оценить
        return new ContinueResponse("evaluate", null, null, selected);
    }

    var partIndex = Array.IndexOf(parts, nextPartCode);
    var part = await _db.MessageParts.FirstAsync(p => p.Code == nextPartCode);
    var options = await _db.PhraseOptions
        .Include(o => o.Format)
        .Where(o => o.ScenarioId == scenarioId && o.Part!.Code == nextPartCode)
        .Select(o => new PhraseOptionDto(
            o.Id, o.Text, o.Format!.Code, o.Format.Name, o.Format.Color ?? "#999"
        ))
        .ToListAsync();

    return new ContinueResponse(
        "next_part",
        new PartDto(part.Code, part.Name, partIndex + 1, 3),
        options,
        selected  // ← вот здесь был список PhraseOptionDto, теперь SelectedPhraseInfo
    );
}

    /// <summary>
    /// Удалить сессию
    /// </summary>
    [HttpDelete("sessions/{sessionId}")]
    public async Task DeleteSession(Guid sessionId)
    {
        var session = await _db.TrainingSessions.FindAsync(sessionId)
            ?? throw new Exception("Сессия не найдена");
        _db.TrainingSessions.Remove(session);
        await _db.SaveChangesAsync();
    }
}

// ==================== НОВЫЕ DTO ====================

public record SessionInfoDto(
    Guid Id, string Status, string? ScenarioTitle,
    int PhrasesSelected, DateTime StartedAt, DateTime? CompletedAt,
    decimal? BestResultPercent
);

public record SessionDetailDto(
    Guid Id, string Status, ScenarioDto? Scenario,
    List<SelectedPhraseInfo> SelectedPhrases,
    List<EffectivenessResult> Results,
    DateTime StartedAt, DateTime? CompletedAt
);

public record ContinueResponse(
    string NextAction, PartDto? NextPart,
    List<PhraseOptionDto>? Options, List<SelectedPhraseInfo> SelectedPhrases
);