using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CommunicationTrainer.Migrations
{
    /// <inheritdoc />
    public partial class FixScenarioDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MessageResults_Scenarios_ScenarioId",
                table: "MessageResults");

            migrationBuilder.DropForeignKey(
                name: "FK_SelectedPhrases_Scenarios_ScenarioId",
                table: "SelectedPhrases");

            migrationBuilder.AddForeignKey(
                name: "FK_MessageResults_Scenarios_ScenarioId",
                table: "MessageResults",
                column: "ScenarioId",
                principalTable: "Scenarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SelectedPhrases_Scenarios_ScenarioId",
                table: "SelectedPhrases",
                column: "ScenarioId",
                principalTable: "Scenarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MessageResults_Scenarios_ScenarioId",
                table: "MessageResults");

            migrationBuilder.DropForeignKey(
                name: "FK_SelectedPhrases_Scenarios_ScenarioId",
                table: "SelectedPhrases");

            migrationBuilder.AddForeignKey(
                name: "FK_MessageResults_Scenarios_ScenarioId",
                table: "MessageResults",
                column: "ScenarioId",
                principalTable: "Scenarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SelectedPhrases_Scenarios_ScenarioId",
                table: "SelectedPhrases",
                column: "ScenarioId",
                principalTable: "Scenarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
