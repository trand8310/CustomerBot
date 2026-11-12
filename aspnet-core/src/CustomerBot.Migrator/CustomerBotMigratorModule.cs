using Abp.Events.Bus;
using Abp.Modules;
using Abp.Reflection.Extensions;
using CustomerBot.Configuration;
using CustomerBot.EntityFrameworkCore;
using CustomerBot.Migrator.DependencyInjection;
using Castle.MicroKernel.Registration;
using Microsoft.Extensions.Configuration;

namespace CustomerBot.Migrator;

[DependsOn(typeof(CustomerBotEntityFrameworkModule))]
public class CustomerBotMigratorModule : AbpModule
{
    private readonly IConfigurationRoot _appConfiguration;

    public CustomerBotMigratorModule(CustomerBotEntityFrameworkModule abpProjectNameEntityFrameworkModule)
    {
        abpProjectNameEntityFrameworkModule.SkipDbSeed = true;

        _appConfiguration = AppConfigurations.Get(
            typeof(CustomerBotMigratorModule).GetAssembly().GetDirectoryPathOrNull()
        );
    }

    public override void PreInitialize()
    {
        Configuration.DefaultNameOrConnectionString = _appConfiguration.GetConnectionString(
            CustomerBotConsts.ConnectionStringName
        );

        Configuration.BackgroundJobs.IsJobExecutionEnabled = false;
        Configuration.ReplaceService(
            typeof(IEventBus),
            () => IocManager.IocContainer.Register(
                Component.For<IEventBus>().Instance(NullEventBus.Instance)
            )
        );
    }

    public override void Initialize()
    {
        IocManager.RegisterAssemblyByConvention(typeof(CustomerBotMigratorModule).GetAssembly());
        ServiceCollectionRegistrar.Register(IocManager);
    }
}
