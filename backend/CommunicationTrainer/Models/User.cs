using System.ComponentModel.DataAnnotations;

namespace CommunicationTrainer.Api.Models;

public class User
{
    public Guid Id { get; set; }
    
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    public string PasswordHash { get; set; } = string.Empty;
    
    [MaxLength(20)]
    public string Role { get; set; } = "user"; 
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<TrainingSession> TrainingSessions { get; set; } = new List<TrainingSession>();
}