using Abp.AutoMapper;
using Abp.Modules;
using Abp.Reflection.Extensions;
using CustomerBot.Authorization;

namespace CustomerBot;

[DependsOn(
    typeof(CustomerBotCoreModule),
    typeof(AbpAutoMapperModule))]
public class CustomerBotApplicationModule : AbpModule
{
    public override void PreInitialize()
    {
        Configuration.Authorization.Providers.Add<CustomerBotAuthorizationProvider>();
    }

    public override void Initialize()
    {
        var thisAssembly = typeof(CustomerBotApplicationModule).GetAssembly();

        IocManager.RegisterAssemblyByConvention(thisAssembly);

        Configuration.Modules.AbpAutoMapper().Configurators.Add(
            // Scan the assembly for classes which inherit from AutoMapper.Profile
            cfg => cfg.AddMaps(thisAssembly)
        );
    }
}
