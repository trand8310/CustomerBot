using Microsoft.EntityFrameworkCore;
using System.Data.Common;

namespace CustomerBot.EntityFrameworkCore;

public static class CustomerBotDbContextConfigurer
{
    public static void Configure(DbContextOptionsBuilder<CustomerBotDbContext> builder, string connectionString)
    {
        builder.UseSqlServer(connectionString);
    }

    public static void Configure(DbContextOptionsBuilder<CustomerBotDbContext> builder, DbConnection connection)
    {
        builder.UseSqlServer(connection);
    }
}
