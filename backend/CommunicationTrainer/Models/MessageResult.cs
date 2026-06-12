using System.ComponentModel.DataAnnotations.Schema;

namespace CommunicationTrainer.Api.Models;

public class MessageResult
{
    public int Id { get; set; }
    
    public Guid SessionId { get; set; }
    public TrainingSession? Session { get; set; }
    
    public int ScenarioId { get; set; }
    public Scenario? Scenario { get; set; }
    
    public int FormatId { get; set; }
    public Format? Format { get; set; }
    
    [Column(TypeName = "decimal(5,2)")]
    public decimal EffectivenessPercent { get; set; }
}