using Microsoft.EntityFrameworkCore;
using CommunicationTrainer.Api.Data;
using CommunicationTrainer.Api.DTOs;
using CommunicationTrainer.Api.Models;

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

    public async Task<StartResponse> StartTraining(int? scenarioId = null)
    {
        var scenario = scenarioId.HasValue
            ? await _db.Scenarios.Include(s => s.RecipientFormat).FirstOrDefaultAsync(s => s.Id == scenarioId && s.IsActive)
            : await _db.Scenarios.Include(s => s.RecipientFormat).Where(s => s.IsActive).OrderBy(s => Guid.NewGuid()).FirstOrDefaultAsync();

        if (scenario == null) throw new Exception("Нет доступных сценариев");

        var session = new TrainingSession { Id = Guid.NewGuid(), CurrentScenarioId = scenario.Id };
        _db.TrainingSessions.Add(session);
        await _db.SaveChangesAsync();

        var options = await GetOptions(scenario.Id, "opening");

        return new StartResponse(
            session.Id,
            new ScenarioDto(scenario.Id, scenario.Title, scenario.SituationText,
                scenario.RecipientName, scenario.RecipientFormat?.Code ?? "", scenario.RecipientFormat?.Name ?? "",
                scenario.HintText ?? ""),
            new PartDto("opening", "Вступление", 1, 3),
            options
        );
    }

    public async Task<SelectResponse> SelectPhrase(Guid sessionId, int optionId)
    {
        var option = await _db.PhraseOptions
            .Include(o => o.Part).Include(o => o.Format)
            .FirstOrDefaultAsync(o => o.Id == optionId)
            ?? throw new Exception("Вариант не найден");

        var session = await _db.TrainingSessions.FindAsync(sessionId)
            ?? throw new Exception("Сессия не найдена");

        var scenarioId = session.CurrentScenarioId!.Value;

        // Удаляем предыдущий выбор для этой же части
        var existing = await _db.SelectedPhrases
            .FirstOrDefaultAsync(s => s.SessionId == sessionId && s.ScenarioId == scenarioId && s.PartId == option.PartId);
        if (existing != null) _db.SelectedPhrases.Remove(existing);

        // Сохраняем новый
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
            return new SelectResponse("evaluate", null, null, selected);
        }

        var nextPartCode = parts[currentIndex + 1];
        var nextPart = await _db.MessageParts.FirstAsync(p => p.Code == nextPartCode);
        var nextOptions = await GetOptions(scenarioId, nextPartCode);

        return new SelectResponse("next_part",
            new PartDto(nextPart.Code, nextPart.Name, currentIndex + 2, 3),
            nextOptions, selected);
    }

    public async Task<EvaluateResponse> Evaluate(Guid sessionId)
    {
        var session = await _db.TrainingSessions.FindAsync(sessionId)
            ?? throw new Exception("Сессия не найдена");

        var scenarioId = session.CurrentScenarioId!.Value;
        var scenario = await _db.Scenarios.Include(s => s.RecipientFormat).FirstAsync(s => s.Id == scenarioId);

        var selectedOptions = await _db.SelectedPhrases
            .Include(s => s.SelectedOption).Include(s => s.Part)
            .Where(s => s.SessionId == sessionId && s.ScenarioId == scenarioId)
            .OrderBy(s => s.Part!.OrderNumber)
            .ToListAsync();

        var phrases = selectedOptions.Select(s => (
            (float)s.SelectedOption!.EmotionalScore,
            (float)s.SelectedOption!.SafetyScore,
            (float)s.SelectedOption!.StructuralScore
        )).ToList();

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

        session.Status = "completed";
        session.CompletedAt = DateTime.UtcNow;
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
            .Where(o => o.ScenarioId == scenarioId && o.Part!.Code == partCode)
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
}