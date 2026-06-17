using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CommunicationTrainer.Migrations
{
    /// <inheritdoc />
    public partial class AddScenarioQueue : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CompletedScenarios",
                table: "TrainingSessions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ScenarioQueue",
                table: "TrainingSessions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TotalScenarios",
                table: "TrainingSessions",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletedScenarios",
                table: "TrainingSessions");

            migrationBuilder.DropColumn(
                name: "ScenarioQueue",
                table: "TrainingSessions");

            migrationBuilder.DropColumn(
                name: "TotalScenarios",
                table: "TrainingSessions");
        }
    }
}
