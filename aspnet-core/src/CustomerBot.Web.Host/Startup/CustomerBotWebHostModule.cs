using Abp.Modules;
using Abp.Reflection.Extensions;
using CustomerBot.Configuration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace CustomerBot.Web.Host.Startup
{
    [DependsOn(
       typeof(CustomerBotWebCoreModule))]
    public class CustomerBotWebHostModule : AbpModule
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfigurationRoot _appConfiguration;

        public CustomerBotWebHostModule(IWebHostEnvironment env)
        {
            _env = env;
            _appConfiguration = env.GetAppConfiguration();
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(CustomerBotWebHostModule).GetAssembly());
        }
    }
}
