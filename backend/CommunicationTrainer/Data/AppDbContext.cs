using Microsoft.EntityFrameworkCore;
using CommunicationTrainer.Api.Models;

namespace CommunicationTrainer.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Format> Formats => Set<Format>();
    public DbSet<User> Users => Set<User>();
    public DbSet<MessagePart> MessageParts => Set<MessagePart>();
    public DbSet<Scenario> Scenarios => Set<Scenario>();
    public DbSet<PhraseOption> PhraseOptions => Set<PhraseOption>();
    public DbSet<TrainingSession> TrainingSessions => Set<TrainingSession>();
    public DbSet<SelectedPhrase> SelectedPhrases => Set<SelectedPhrase>();
    public DbSet<MessageResult> MessageResults => Set<MessageResult>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Format
        builder.Entity<Format>(e =>
        {
            e.HasIndex(f => f.Code).IsUnique();
            e.Property(f => f.Code).IsRequired();
            e.Property(f => f.Name).IsRequired();
        });

        // MessagePart
        builder.Entity<MessagePart>(e =>
        {
            e.HasIndex(m => m.Code).IsUnique();
            e.Property(m => m.Code).IsRequired();
        });

        // Scenario
        builder.Entity<Scenario>(e =>
        {
            e.HasOne(s => s.RecipientFormat)
             .WithMany(f => f.Scenarios)
             .HasForeignKey(s => s.RecipientFormatId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // PhraseOption
        builder.Entity<PhraseOption>(e =>
        {
            e.HasIndex(p => new { p.ScenarioId, p.PartId, p.FormatId }).IsUnique();

            e.HasOne(p => p.Scenario)
             .WithMany(s => s.PhraseOptions)
             .HasForeignKey(p => p.ScenarioId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(p => p.Part)
             .WithMany(m => m.PhraseOptions)
             .HasForeignKey(p => p.PartId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(p => p.Format)
             .WithMany(f => f.PhraseOptions)
             .HasForeignKey(p => p.FormatId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        
        // TrainingSession
        builder.Entity<TrainingSession>(e =>
        {
            e.HasOne(s => s.CurrentScenario)
             .WithMany(sc => sc.TrainingSessions)
             .HasForeignKey(s => s.CurrentScenarioId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // SelectedPhrase
        builder.Entity<SelectedPhrase>(e =>
        {
            e.HasIndex(s => new { s.SessionId, s.ScenarioId, s.PartId }).IsUnique();

            e.HasOne(s => s.Session)
             .WithMany(ts => ts.SelectedPhrases)
             .HasForeignKey(s => s.SessionId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(s => s.Scenario)
             .WithMany(sc => sc.SelectedPhrases)
             .HasForeignKey(s => s.ScenarioId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(s => s.Part)
             .WithMany(m => m.SelectedPhrases)
             .HasForeignKey(s => s.PartId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(s => s.SelectedOption)
             .WithMany(p => p.SelectedPhrases)
             .HasForeignKey(s => s.SelectedOptionId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // MessageResult
        builder.Entity<MessageResult>(e =>
        {
            e.HasIndex(m => new { m.SessionId, m.ScenarioId, m.FormatId }).IsUnique();

            e.HasOne(m => m.Session)
             .WithMany(ts => ts.MessageResults)
             .HasForeignKey(m => m.SessionId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(m => m.Scenario)
             .WithMany(sc => sc.MessageResults)
             .HasForeignKey(m => m.ScenarioId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(m => m.Format)
             .WithMany(f => f.MessageResults)
             .HasForeignKey(m => m.FormatId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Заполняем MessageParts
        builder.Entity<MessagePart>().HasData(
            new MessagePart { Id = 1, Code = "opening", Name = "Вступление", OrderNumber = 1 },
            new MessagePart { Id = 2, Code = "middle", Name = "Основная часть", OrderNumber = 2 },
            new MessagePart { Id = 3, Code = "closing", Name = "Завершение", OrderNumber = 3 }
        );
        
        // Юзер
        builder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
        });

        builder.Entity<TrainingSession>(e =>
        {
            e.HasOne(s => s.User)
                .WithMany(u => u.TrainingSessions)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}