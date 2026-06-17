using System.ComponentModel.DataAnnotations;

namespace CommunicationTrainer.Api.Models;

public class TrainingSession
{
    public Guid Id { get; set; }
    [MaxLength(20)]
    public string Status { get; set; } = "in_progress"; // in_progress, waiting_next, completed
    
    public int? CurrentScenarioId { get; set; }
    public Scenario? CurrentScenario { get; set; }
    
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    
    // Очередь сценариев (JSON-массив id'шников)
    public string? ScenarioQueue { get; set; }
    
    // Сколько всего сценариев в сессии
    public int TotalScenarios { get; set; }
    
    // Сколько пройдено
    public int CompletedScenarios { get; set; }
    
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    
    public ICollection<SelectedPhrase> SelectedPhrases { get; set; } = new List<SelectedPhrase>();
    public ICollection<MessageResult> MessageResults { get; set; } = new List<MessageResult>();
}