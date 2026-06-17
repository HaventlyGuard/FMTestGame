using Microsoft.EntityFrameworkCore;
using CommunicationTrainer.Api.Data;
using CommunicationTrainer.Api.DTOs;
using CommunicationTrainer.Api.Models;
using System.Text.Json;

namespace CommunicationTrainer.Api.Services;

public class TrainingService
{
    private readonly AppDbContext _db;
    private readonly ScoringEngine _engine;

    public TrainingService(AppDbContext db, ScoringEngine engine)
    {
        _db = db;
        _engine = engine;
    }

    private const int SCENARIOS_PER_SESSION = 3;

    public async Task<StartResponse> StartTraining(int? scenarioId = null, Guid? userId = null)
    {
        List<int> queue;
        int total;

        if (scenarioId.HasValue)
        {
            queue = new List<int> { scenarioId.Value };
            total = 1;
        }
        else
        {
            var allIds = await _db.Scenarios
                .Where(s => s.IsActive)
                .Select(s => s.Id)
                .ToListAsync();

            if (allIds.Count == 0) throw new Exception("Нет доступных сценариев");

            var random = new Random();
            queue = allIds.OrderBy(_ => random.Next()).Take(SCENARIOS_PER_SESSION).ToList();
            total = queue.Count;
        }

        var firstId = queue[0];
        var scenario = await _db.Scenarios.Include(s => s.RecipientFormat).FirstAsync(s => s.Id == firstId);

        var session = new TrainingSession
        {
            Id = Guid.NewGuid(),
            CurrentScenarioId = firstId,
            UserId = userId,
            ScenarioQueue = JsonSerializer.Serialize(queue),
            TotalScenarios = total,
            CompletedScenarios = 0
        };
        _db.TrainingSessions.Add(session);
        await _db.SaveChangesAsync();

        var options = await GetOptions(firstId, "opening");

        return new StartResponse(session.Id, MapScenario(scenario),
            new PartDto("opening", "Вступление", 1, 3), options, 0, total);
    }

    public async Task<SelectResponse> SelectPhrase(Guid sessionId, int optionId)
{
    var option = await _db.PhraseOptions.Include(o => o.Part).Include(o => o.Format)
        .FirstAsync(o => o.Id == optionId);

    var session = await _db.TrainingSessions.FindAsync(sessionId)
        ?? throw new Exception("Сессия не найдена");

    var scenarioId = session.CurrentScenarioId!.Value;
    var scenario = await _db.Scenarios.Include(s => s.RecipientFormat).FirstAsync(s => s.Id == scenarioId);

    var existing = await _db.SelectedPhrases
        .FirstOrDefaultAsync(s => s.SessionId == sessionId && s.ScenarioId == scenarioId && s.PartId == option.PartId);
    if (existing != null) _db.SelectedPhrases.Remove(existing);

    _db.SelectedPhrases.Add(new SelectedPhrase
    {
        SessionId = sessionId, ScenarioId = scenarioId,
        PartId = option.PartId, SelectedOptionId = optionId
    });
    await _db.SaveChangesAsync();

    var selected = await GetSelectedPhrases(sessionId, scenarioId);
    var parts = new[] { "opening", "middle", "closing" };
    var currentIndex = Array.IndexOf(parts, option.Part!.Code);

    if (currentIndex >= parts.Length - 1)
    {
        // Оцениваем сценарий
        var evalResponse = await EvaluateScenario(sessionId, scenarioId);
        
        var queue = JsonSerializer.Deserialize<List<int>>(session.ScenarioQueue!)!;
        var currentPos = queue.IndexOf(scenarioId);
        session.CompletedScenarios = currentPos + 1;

        if (currentPos < queue.Count - 1)
        {
            var nextId = queue[currentPos + 1];
            session.CurrentScenarioId = nextId;
            await _db.SaveChangesAsync();

            var nextScenario = await _db.Scenarios.Include(s => s.RecipientFormat).FirstAsync(s => s.Id == nextId);
            var nextOpts = await GetOptions(nextId, "opening");

            return new SelectResponse("next_scenario",
                new PartDto("opening", "Вступление", 1, 3), nextOpts, selected,
                session.CompletedScenarios, session.TotalScenarios, MapScenario(nextScenario),
                evalResponse.Results); // ← результаты сценария
        }
        else
        {
            session.Status = "completed";
            session.CompletedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return new SelectResponse("finished", null, null, selected,
                session.CompletedScenarios, session.TotalScenarios, null,
                evalResponse.Results); // ← результаты сценария
        }
    }

    var nextPartCode = parts[currentIndex + 1];
    var nextPart = await _db.MessageParts.FirstAsync(p => p.Code == nextPartCode);
    var nextOpts2 = await GetOptions(scenarioId, nextPartCode);

    return new SelectResponse("next_part",
        new PartDto(nextPart.Code, nextPart.Name, currentIndex + 2, 3), nextOpts2, selected,
        session.CompletedScenarios, session.TotalScenarios, null, null);
}

    public async Task<FinalResultsResponse> GetFinalResults(Guid sessionId)
{
    var session = await _db.TrainingSessions
        .Include(s => s.MessageResults).ThenInclude(r => r.Format)
        .Include(s => s.MessageResults).ThenInclude(r => r.Scenario)
        .FirstAsync(s => s.Id == sessionId);

    // Берём результаты ТОЛЬКО для родных форматов сценариев
    var scenarioIds = await _db.MessageResults
        .Where(r => r.SessionId == sessionId)
        .Select(r => r.ScenarioId)
        .Distinct()
        .ToListAsync();

    var nativeFormatIds = await _db.Scenarios
        .Where(s => scenarioIds.Contains(s.Id))
        .Select(s => s.RecipientFormatId)
        .ToListAsync();

    // Средний % попадания в нужные форматы
    var targetResults = await _db.MessageResults
        .Where(r => r.SessionId == sessionId)
        .Include(r => r.Scenario)
        .Where(r => r.FormatId == r.Scenario!.RecipientFormatId) // ← только где формат был целевым
        .GroupBy(r => new { r.FormatId, r.Format!.Code, r.Format!.Name, r.Format!.Color })
        .Select(g => new EffectivenessResult(
            g.Key.Code, g.Key.Name, g.Key.Color ?? "#999",
            Math.Round(g.Average(r => (double)r.EffectivenessPercent), 1),
            true
        ))
        .ToListAsync();

    // Общий средний %
    var overallAverage = targetResults.Count > 0
        ? Math.Round(targetResults.Average(r => r.Percent), 1)
        : 0;

    // Результаты по каждому сценарию
    var scenarioResults = await _db.MessageResults
        .Where(r => r.SessionId == sessionId)
        .Include(r => r.Scenario)
        .Include(r => r.Format)
        .Where(r => nativeFormatIds.Contains(r.FormatId))
        .GroupBy(r => new { r.ScenarioId, r.Scenario!.Title })
        .Select(g => new ScenarioResultDto(
            g.Key.ScenarioId, g.Key.Title,
            g.Select(r => new EffectivenessResult(
                r.Format!.Code, r.Format.Name, r.Format.Color ?? "#999",
                (double)r.EffectivenessPercent,
                r.FormatId == g.First().Scenario!.RecipientFormatId
            )).ToList()
        ))
        .ToListAsync();

    return new FinalResultsResponse(
        targetResults.OrderByDescending(r => r.Percent).ToList(),
        scenarioResults,
        session.TotalScenarios,
        session.CompletedScenarios,
        overallAverage
    );
}

    public async Task<EvaluateResponse> Evaluate(Guid sessionId)
    {
        var session = await _db.TrainingSessions.FindAsync(sessionId)
            ?? throw new Exception("Сессия не найдена");
        return await EvaluateScenario(sessionId, session.CurrentScenarioId!.Value);
    }

    private async Task<EvaluateResponse> EvaluateScenario(Guid sessionId, int scenarioId)
    {
        var scenario = await _db.Scenarios.Include(s => s.RecipientFormat).FirstAsync(s => s.Id == scenarioId);
        var selectedOptions = await _db.SelectedPhrases
            .Include(s => s.SelectedOption).Include(s => s.Part)
            .Where(s => s.SessionId == sessionId && s.ScenarioId == scenarioId)
            .OrderBy(s => s.Part!.OrderNumber).ToListAsync();

        var phrases = selectedOptions
            .Where(s => s.SelectedOption != null)
            .Select(s => (
                (float)s.SelectedOption!.EmotionalScore,
                (float)s.SelectedOption!.SafetyScore,
                (float)s.SelectedOption!.StructuralScore
            )).ToList();

        if (phrases.Count < 3)
        {
            return new EvaluateResponse(scenarioId, new List<SelectedPhraseInfo>(),
                new List<EffectivenessResult>(), null);
        }

        var formats = await _db.Formats.OrderBy(f => f.SortOrder).ToListAsync();
        var results = new List<EffectivenessResult>();

        foreach (var fmt in formats)
        {
            var pct = _engine.Evaluate(phrases, fmt.Code);
            results.Add(new EffectivenessResult(fmt.Code, fmt.Name, fmt.Color ?? "#999",
                Math.Round((double)pct, 1), fmt.Id == scenario.RecipientFormatId));

            _db.MessageResults.Add(new MessageResult
            {
                SessionId = sessionId, ScenarioId = scenarioId,
                FormatId = fmt.Id, EffectivenessPercent = (decimal)Math.Round((double)pct, 2)
            });
        }

        await _db.SaveChangesAsync();

        var selectedDtos = selectedOptions.Select(s => new SelectedPhraseInfo(
            s.Part!.Code, s.Part.Name, s.SelectedOption!.Text,
            s.SelectedOption.Format?.Code ?? "", s.SelectedOption.Format?.Color ?? "#999"
        )).ToList();

        return new EvaluateResponse(scenarioId, selectedDtos, results, results.OrderByDescending(r => r.Percent).First());
    }

    private async Task<List<PhraseOptionDto>> GetOptions(int scenarioId, string partCode)
    {
        return await _db.PhraseOptions
            .Include(o => o.Format)
            .Where(o => o.ScenarioId == scenarioId && o.Part!.Code == partCode && !string.IsNullOrEmpty(o.Text)) // ← фильтр
            .Select(o => new PhraseOptionDto(o.Id, o.Text, o.Format!.Code, o.Format.Name, o.Format.Color ?? "#999"))
            .ToListAsync();
    }
    
    

    private async Task<List<SelectedPhraseInfo>> GetSelectedPhrases(Guid sessionId, int scenarioId)
    {
        return await _db.SelectedPhrases
            .Include(s => s.Part).Include(s => s.SelectedOption).ThenInclude(o => o!.Format)
            .Where(s => s.SessionId == sessionId && s.ScenarioId == scenarioId)
            .OrderBy(s => s.Part!.OrderNumber)
            .Select(s => new SelectedPhraseInfo(s.Part!.Code, s.Part.Name, s.SelectedOption!.Text,
                s.SelectedOption.Format!.Code, s.SelectedOption.Format.Color ?? "#999"))
            .ToListAsync();
    }

    private static ScenarioDto MapScenario(Scenario s) => new(
        s.Id, s.Title, s.SituationText, s.RecipientName,
        s.RecipientFormat?.Code ?? "", s.RecipientFormat?.Name ?? "", s.HintText ?? "");
}