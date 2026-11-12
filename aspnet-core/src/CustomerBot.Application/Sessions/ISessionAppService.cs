using Abp.Application.Services;
using CustomerBot.Sessions.Dto;
using System.Threading.Tasks;

namespace CustomerBot.Sessions;

public interface ISessionAppService : IApplicationService
{
    Task<GetCurrentLoginInformationsOutput> GetCurrentLoginInformations();
}
