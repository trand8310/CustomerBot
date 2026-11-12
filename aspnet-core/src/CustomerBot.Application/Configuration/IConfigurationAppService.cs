using CustomerBot.Configuration.Dto;
using System.Threading.Tasks;

namespace CustomerBot.Configuration;

public interface IConfigurationAppService
{
    Task ChangeUiTheme(ChangeUiThemeInput input);
}
