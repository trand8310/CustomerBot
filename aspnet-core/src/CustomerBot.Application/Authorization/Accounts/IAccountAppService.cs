using Abp.Application.Services;
using CustomerBot.Authorization.Accounts.Dto;
using System.Threading.Tasks;

namespace CustomerBot.Authorization.Accounts;

public interface IAccountAppService : IApplicationService
{
    Task<IsTenantAvailableOutput> IsTenantAvailable(IsTenantAvailableInput input);

    Task<RegisterOutput> Register(RegisterInput input);
}
