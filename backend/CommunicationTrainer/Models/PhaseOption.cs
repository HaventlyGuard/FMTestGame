using System.ComponentModel.DataAnnotations.Schema;

namespace CommunicationTrainer.Api.Models;

public class PhraseOption
{
    public int Id { get; set; }
    
    public int ScenarioId { get; set; }
    public Scenario? Scenario { get; set; }
    
    public int PartId { get; set; }
    public MessagePart? Part { get; set; }
    
    public int FormatId { get; set; }
    public Format? Format { get; set; }
    
    public string Text { get; set; } = string.Empty;
    
    // Баллы одной фразы по трём параметрам
    [Column(TypeName = "decimal(5,3)")]
    public decimal EmotionalScore { get; set; }
    
    [Column(TypeName = "decimal(5,3)")]
    public decimal SafetyScore { get; set; }
    
    [Column(TypeName = "decimal(5,3)")]
    public decimal StructuralScore { get; set; }
    
    // Навигация
    public ICollection<SelectedPhrase> SelectedPhrases { get; set; } = new List<SelectedPhrase>();
}