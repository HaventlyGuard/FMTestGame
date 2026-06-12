namespace CommunicationTrainer.Api.DTOs;

public record ScenarioDto(
    int Id, string Title, string SituationText,
    string RecipientName, string RecipientFormatCode, string RecipientFormatName,
    string HintText
);

public record PartDto(string Code, string Name, int StepNumber, int TotalSteps);

public record PhraseOptionDto(int Id, string Text, string FormatCode, string FormatName, string FormatColor);

public record StartResponse(Guid SessionId, ScenarioDto Scenario, PartDto CurrentPart, List<PhraseOptionDto> Options);

public record SelectRequest(Guid SessionId, int OptionId);

public record SelectedPhraseInfo(string PartCode, string PartName, string Text, string FormatCode, string FormatColor);

public record SelectResponse(
    string NextAction, PartDto? NextPart, List<PhraseOptionDto>? Options,
    List<SelectedPhraseInfo> SelectedPhrases
);

public record EvaluateRequest(Guid SessionId);

public record EffectivenessResult(string FormatCode, string FormatName, string Color, double Percent, bool IsNative);

public record EvaluateResponse(
    int ScenarioId, List<SelectedPhraseInfo> SelectedPhrases,
    List<EffectivenessResult> Results, EffectivenessResult? BestMatch
);

// ==================== СЕССИИ ====================

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
