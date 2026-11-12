using System.ComponentModel.DataAnnotations;

namespace CustomerBot.Users.Dto;

public class ChangeUserLanguageDto
{
    [Required]
    public string LanguageName { get; set; }
}