namespace CommunicationTrainer.Api.Models;

public class SelectedPhrase
{
    public int Id { get; set; }
    
    public Guid SessionId { get; set; }
    public TrainingSession? Session { get; set; }
    
    public int ScenarioId { get; set; }
    public Scenario? Scenario { get; set; }
    
    public int PartId { get; set; }
    public MessagePart? Part { get; set; }
    
    public int SelectedOptionId { get; set; }
    public PhraseOption? SelectedOption { get; set; }
    
    public DateTime SelectedAt { get; set; } = DateTime.UtcNow;
}