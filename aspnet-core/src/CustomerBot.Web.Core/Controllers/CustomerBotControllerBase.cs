using Abp.AspNetCore.Mvc.Controllers;
using Abp.IdentityFramework;
using Microsoft.AspNetCore.Identity;

namespace CustomerBot.Controllers
{
    public abstract class CustomerBotControllerBase : AbpController
    {
        protected CustomerBotControllerBase()
        {
            LocalizationSourceName = CustomerBotConsts.LocalizationSourceName;
        }

        protected void CheckErrors(IdentityResult identityResult)
        {
            identityResult.CheckErrors(LocalizationManager);
        }
    }
}
