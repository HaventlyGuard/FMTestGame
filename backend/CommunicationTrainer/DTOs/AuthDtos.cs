namespace CommunicationTrainer.Api.DTOs;

public record RegisterRequest(string Email, string Password, string Name);

public record LoginRequest(string Email, string Password);

public record AuthResponse(Guid UserId, string Email, string Name, string Role, string Token);

public record UserInfoDto(Guid Id, string Email, string Name, string Role);