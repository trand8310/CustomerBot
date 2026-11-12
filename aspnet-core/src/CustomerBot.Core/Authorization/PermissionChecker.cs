using Abp.Authorization;
using CustomerBot.Authorization.Roles;
using CustomerBot.Authorization.Users;

namespace CustomerBot.Authorization;

public class PermissionChecker : PermissionChecker<Role, User>
{
    public PermissionChecker(UserManager userManager)
        : base(userManager)
    {
    }
}
