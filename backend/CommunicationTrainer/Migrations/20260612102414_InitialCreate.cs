using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CommunicationTrainer.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Formats",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Color = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: true),
                    IdealEmotional = table.Column<decimal>(type: "numeric(5,3)", nullable: false),
                    IdealSafety = table.Column<decimal>(type: "numeric(5,3)", nullable: false),
                    IdealStructural = table.Column<decimal>(type: "numeric(5,3)", nullable: false),
                    ToleranceEmotional = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    ToleranceSafety = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    ToleranceStructural = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    WeightEmotional = table.Column<decimal>(type: "numeric(4,3)", nullable: false),
                    WeightSafety = table.Column<decimal>(type: "numeric(4,3)", nullable: false),
                    WeightStructural = table.Column<decimal>(type: "numeric(4,3)", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Formats", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MessageParts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    OrderNumber = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MessageParts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Scenarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    SituationText = table.Column<string>(type: "text", nullable: false),
                    RecipientName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    RecipientFormatId = table.Column<int>(type: "integer", nullable: false),
                    HintText = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Scenarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Scenarios_Formats_RecipientFormatId",
                        column: x => x.RecipientFormatId,
                        principalTable: "Formats",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PhraseOptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ScenarioId = table.Column<int>(type: "integer", nullable: false),
                    PartId = table.Column<int>(type: "integer", nullable: false),
                    FormatId = table.Column<int>(type: "integer", nullable: false),
                    Text = table.Column<string>(type: "text", nullable: false),
                    EmotionalScore = table.Column<decimal>(type: "numeric(5,3)", nullable: false),
                    SafetyScore = table.Column<decimal>(type: "numeric(5,3)", nullable: false),
                    StructuralScore = table.Column<decimal>(type: "numeric(5,3)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhraseOptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PhraseOptions_Formats_FormatId",
                        column: x => x.FormatId,
                        principalTable: "Formats",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PhraseOptions_MessageParts_PartId",
                        column: x => x.PartId,
                        principalTable: "MessageParts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PhraseOptions_Scenarios_ScenarioId",
                        column: x => x.ScenarioId,
                        principalTable: "Scenarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TrainingSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CurrentScenarioId = table.Column<int>(type: "integer", nullable: true),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainingSessions_Scenarios_CurrentScenarioId",
                        column: x => x.CurrentScenarioId,
                        principalTable: "Scenarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "MessageResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScenarioId = table.Column<int>(type: "integer", nullable: false),
                    FormatId = table.Column<int>(type: "integer", nullable: false),
                    EffectivenessPercent = table.Column<decimal>(type: "numeric(5,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MessageResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MessageResults_Formats_FormatId",
                        column: x => x.FormatId,
                        principalTable: "Formats",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MessageResults_Scenarios_ScenarioId",
                        column: x => x.ScenarioId,
                        principalTable: "Scenarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MessageResults_TrainingSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "TrainingSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SelectedPhrases",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScenarioId = table.Column<int>(type: "integer", nullable: false),
                    PartId = table.Column<int>(type: "integer", nullable: false),
                    SelectedOptionId = table.Column<int>(type: "integer", nullable: false),
                    SelectedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SelectedPhrases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SelectedPhrases_MessageParts_PartId",
                        column: x => x.PartId,
                        principalTable: "MessageParts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SelectedPhrases_PhraseOptions_SelectedOptionId",
                        column: x => x.SelectedOptionId,
                        principalTable: "PhraseOptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SelectedPhrases_Scenarios_ScenarioId",
                        column: x => x.ScenarioId,
                        principalTable: "Scenarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SelectedPhrases_TrainingSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "TrainingSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "MessageParts",
                columns: new[] { "Id", "Code", "Name", "OrderNumber" },
                values: new object[,]
                {
                    { 1, "opening", "Вступление", 1 },
                    { 2, "middle", "Основная часть", 2 },
                    { 3, "closing", "Завершение", 3 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Formats_Code",
                table: "Formats",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MessageParts_Code",
                table: "MessageParts",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MessageResults_FormatId",
                table: "MessageResults",
                column: "FormatId");

            migrationBuilder.CreateIndex(
                name: "IX_MessageResults_ScenarioId",
                table: "MessageResults",
                column: "ScenarioId");

            migrationBuilder.CreateIndex(
                name: "IX_MessageResults_SessionId_ScenarioId_FormatId",
                table: "MessageResults",
                columns: new[] { "SessionId", "ScenarioId", "FormatId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PhraseOptions_FormatId",
                table: "PhraseOptions",
                column: "FormatId");

            migrationBuilder.CreateIndex(
                name: "IX_PhraseOptions_PartId",
                table: "PhraseOptions",
                column: "PartId");

            migrationBuilder.CreateIndex(
                name: "IX_PhraseOptions_ScenarioId_PartId_FormatId",
                table: "PhraseOptions",
                columns: new[] { "ScenarioId", "PartId", "FormatId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Scenarios_RecipientFormatId",
                table: "Scenarios",
                column: "RecipientFormatId");

            migrationBuilder.CreateIndex(
                name: "IX_SelectedPhrases_PartId",
                table: "SelectedPhrases",
                column: "PartId");

            migrationBuilder.CreateIndex(
                name: "IX_SelectedPhrases_ScenarioId",
                table: "SelectedPhrases",
                column: "ScenarioId");

            migrationBuilder.CreateIndex(
                name: "IX_SelectedPhrases_SelectedOptionId",
                table: "SelectedPhrases",
                column: "SelectedOptionId");

            migrationBuilder.CreateIndex(
                name: "IX_SelectedPhrases_SessionId_ScenarioId_PartId",
                table: "SelectedPhrases",
                columns: new[] { "SessionId", "ScenarioId", "PartId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TrainingSessions_CurrentScenarioId",
                table: "TrainingSessions",
                column: "CurrentScenarioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MessageResults");

            migrationBuilder.DropTable(
                name: "SelectedPhrases");

            migrationBuilder.DropTable(
                name: "PhraseOptions");

            migrationBuilder.DropTable(
                name: "TrainingSessions");

            migrationBuilder.DropTable(
                name: "MessageParts");

            migrationBuilder.DropTable(
                name: "Scenarios");

            migrationBuilder.DropTable(
                name: "Formats");
        }
    }
}
