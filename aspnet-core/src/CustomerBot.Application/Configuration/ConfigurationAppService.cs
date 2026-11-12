using Abp.Authorization;
using Abp.Runtime.Session;
using CustomerBot.Configuration.Dto;
using System.Threading.Tasks;

namespace CustomerBot.Configuration;

[AbpAuthorize]
public class ConfigurationAppService : CustomerBotAppServiceBase, IConfigurationAppService
{
    public async Task ChangeUiTheme(ChangeUiThemeInput input)
    {
        await SettingManager.ChangeSettingForUserAsync(AbpSession.ToUserIdentifier(), AppSettingNames.UiTheme, input.Theme);
    }
}
