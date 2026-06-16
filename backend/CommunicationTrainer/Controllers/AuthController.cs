using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CommunicationTrainer.Api.DTOs;
using CommunicationTrainer.Api.Services;

namespace CommunicationTrainer.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService) => _authService = authService;

    [HttpPost("register")]
    public async Task<AuthResponse> Register([FromBody] RegisterRequest request) =>
        await _authService.Register(request);

    [HttpPost("login")]
    public async Task<AuthResponse> Login([FromBody] LoginRequest request) =>
        await _authService.Login(request);

    [Authorize]
    [HttpGet("me")]
    public async Task<UserInfoDto> GetMe()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return await _authService.GetUserInfo(userId);
    }
}