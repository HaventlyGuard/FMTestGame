using CommunicationTrainer.Api.Models;

namespace CommunicationTrainer.Api.Data;

public static class SeedData
{
    public static void Initialize(AppDbContext db)
    {
        if (db.Formats.Any()) return;

        var formats = new[]
        {
            new Format { Code="P",  Name="Презентатор",               Color="#FF5722", SortOrder=1,  IdealEmotional=10,   IdealSafety=3.5m, IdealStructural=3.5m,  ToleranceEmotional=2.0m, ToleranceSafety=1.0m, ToleranceStructural=1.0m,  WeightEmotional=0.60m, WeightSafety=0.20m, WeightStructural=0.20m },
            new Format { Code="A",  Name="Аналитик",                  Color="#2196F3", SortOrder=2,  IdealEmotional=3,    IdealSafety=10,   IdealStructural=2,     ToleranceEmotional=1.0m, ToleranceSafety=1.5m, ToleranceStructural=0.8m,  WeightEmotional=0.15m, WeightSafety=0.70m, WeightStructural=0.15m },
            new Format { Code="S",  Name="Системщик",                 Color="#4CAF50", SortOrder=3,  IdealEmotional=3,    IdealSafety=2,    IdealStructural=10,    ToleranceEmotional=1.0m, ToleranceSafety=0.8m, ToleranceStructural=1.5m,  WeightEmotional=0.15m, WeightSafety=0.15m, WeightStructural=0.70m },
            new Format { Code="M",  Name="Метафорщик",                Color="#607D8B", SortOrder=4,  IdealEmotional=2,    IdealSafety=7.5m, IdealStructural=6,     ToleranceEmotional=-4.0m,ToleranceSafety=1.2m, ToleranceStructural=1.0m,  WeightEmotional=0.10m, WeightSafety=0.50m, WeightStructural=0.40m },
            new Format { Code="MA", Name="Метафорный аналитик",       Color="#795548", SortOrder=5,  IdealEmotional=2,    IdealSafety=9.5m, IdealStructural=3.5m,  ToleranceEmotional=-5.0m,ToleranceSafety=1.5m, ToleranceStructural=0.8m,  WeightEmotional=0.05m, WeightSafety=0.70m, WeightStructural=0.25m },
            new Format { Code="MS", Name="Метафорный системщик",      Color="#3F51B5", SortOrder=6,  IdealEmotional=2,    IdealSafety=8,    IdealStructural=5.5m,  ToleranceEmotional=-5.0m,ToleranceSafety=1.2m, ToleranceStructural=1.2m,  WeightEmotional=0.05m, WeightSafety=0.50m, WeightStructural=0.45m },
            new Format { Code="AP", Name="Аналитический презентатор", Color="#9C27B0", SortOrder=7,  IdealEmotional=7,    IdealSafety=7.5m, IdealStructural=3.5m,  ToleranceEmotional=1.5m, ToleranceSafety=1.5m, ToleranceStructural=1.0m,  WeightEmotional=0.35m, WeightSafety=0.45m, WeightStructural=0.20m },
            new Format { Code="SP", Name="Системный презентатор",     Color="#00BCD4", SortOrder=8,  IdealEmotional=7,    IdealSafety=3.5m, IdealStructural=7.5m,  ToleranceEmotional=1.5m, ToleranceSafety=1.0m, ToleranceStructural=1.5m,  WeightEmotional=0.35m, WeightSafety=0.20m, WeightStructural=0.45m },
            new Format { Code="PS", Name="Презентационный системщик", Color="#E91E63", SortOrder=9,  IdealEmotional=7.5m, IdealSafety=3.5m, IdealStructural=7,     ToleranceEmotional=1.2m, ToleranceSafety=0.8m, ToleranceStructural=1.2m,  WeightEmotional=0.40m, WeightSafety=0.20m, WeightStructural=0.40m },
            new Format { Code="PA", Name="Презентационный аналитик",  Color="#FF9800", SortOrder=10, IdealEmotional=7.5m, IdealSafety=7,    IdealStructural=3.5m,  ToleranceEmotional=1.2m, ToleranceSafety=1.2m, ToleranceStructural=0.8m,  WeightEmotional=0.40m, WeightSafety=0.40m, WeightStructural=0.20m },
        };
        db.Formats.AddRange(formats);
        db.SaveChanges();
    }
}