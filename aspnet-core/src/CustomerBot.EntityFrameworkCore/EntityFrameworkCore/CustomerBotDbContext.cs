using Abp.Zero.EntityFrameworkCore;
using CustomerBot.Authorization.Roles;
using CustomerBot.Authorization.Users;
using CustomerBot.MultiTenancy;
using Microsoft.EntityFrameworkCore;

namespace CustomerBot.EntityFrameworkCore;

public class CustomerBotDbContext : AbpZeroDbContext<Tenant, Role, User, CustomerBotDbContext>
{
    /* Define a DbSet for each entity of the application */

    public CustomerBotDbContext(DbContextOptions<CustomerBotDbContext> options)
        : base(options)
    {
    }
}
