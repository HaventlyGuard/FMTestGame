using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CommunicationTrainer.Api.Models;

public class Format
{
    public int Id { get; set; }
    
    [MaxLength(3)]
    public string Code { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    [MaxLength(7)]
    public string? Color { get; set; }
    
    // Эталонные суммы (идеальный профиль за 3 части сообщения)
    [Column(TypeName = "decimal(5,3)")]
    public decimal IdealEmotional { get; set; }
    
    [Column(TypeName = "decimal(5,3)")]
    public decimal IdealSafety { get; set; }
    
    [Column(TypeName = "decimal(5,3)")]
    public decimal IdealStructural { get; set; }
    
    // Толерантности (чувствительность к отклонениям)
    // >0: нормальная, <0: инвертированная (для метафорных по эмоциям)
    [Column(TypeName = "decimal(5,2)")]
    public decimal ToleranceEmotional { get; set; }
    
    [Column(TypeName = "decimal(5,2)")]
    public decimal ToleranceSafety { get; set; }
    
    [Column(TypeName = "decimal(5,2)")]
    public decimal ToleranceStructural { get; set; }
    
    // Веса важности параметров (сумма = 1)
    [Column(TypeName = "decimal(4,3)")]
    public decimal WeightEmotional { get; set; }
    
    [Column(TypeName = "decimal(4,3)")]
    public decimal WeightSafety { get; set; }
    
    [Column(TypeName = "decimal(4,3)")]
    public decimal WeightStructural { get; set; }
    
    public int SortOrder { get; set; }
    
    // Навигационные свойства
    public ICollection<PhraseOption> PhraseOptions { get; set; } = new List<PhraseOption>();
    public ICollection<Scenario> Scenarios { get; set; } = new List<Scenario>();
    public ICollection<MessageResult> MessageResults { get; set; } = new List<MessageResult>();
}