using System.ComponentModel.DataAnnotations;

namespace CommunicationTrainer.Api.Models;

public class Scenario
{
    public int Id { get; set; }
    
    [MaxLength(300)]
    public string Title { get; set; } = string.Empty;
    
    public string SituationText { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string RecipientName { get; set; } = string.Empty;
    
    public int RecipientFormatId { get; set; }
    public Format? RecipientFormat { get; set; }
    
    public string? HintText { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    // Навигация
    public ICollection<PhraseOption> PhraseOptions { get; set; } = new List<PhraseOption>();
    public ICollection<TrainingSession> TrainingSessions { get; set; } = new List<TrainingSession>();
    public ICollection<SelectedPhrase> SelectedPhrases { get; set; } = new List<SelectedPhrase>();
    public ICollection<MessageResult> MessageResults { get; set; } = new List<MessageResult>();
}