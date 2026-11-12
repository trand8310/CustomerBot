using Abp.Application.Services;
using CustomerBot.MultiTenancy.Dto;

namespace CustomerBot.MultiTenancy;

public interface ITenantAppService : IAsyncCrudAppService<TenantDto, int, PagedTenantResultRequestDto, CreateTenantDto, TenantDto>
{
}

