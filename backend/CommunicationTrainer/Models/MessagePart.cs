using System.ComponentModel.DataAnnotations;

namespace CommunicationTrainer.Api.Models;

public class MessagePart
{
    public int Id { get; set; }
    
    [MaxLength(20)]
    public string Code { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    public int OrderNumber { get; set; }
    
    // Навигация
    public ICollection<PhraseOption> PhraseOptions { get; set; } = new List<PhraseOption>();
    public ICollection<SelectedPhrase> SelectedPhrases { get; set; } = new List<SelectedPhrase>();
}