/** Types for the ASP.NET Boilerplate endpoints this client calls. Only the fields the UI uses are listed. */

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
}

export interface ListResult<T> {
    items: T[];
}

export interface EntityDto {
    id: number;
}

export interface UserDto extends EntityDto {
    userName: string;
    name: string;
    surname: string;
    emailAddress: string;
    fullName?: string;
    isActive: boolean;
    roleNames: string[];
}

export interface CreateUserInput extends Omit<UserDto, 'id' | 'fullName'> {
    password: string;
}

/** Form model for the user editor: create and edit share one shape. */
export interface UserForm extends Partial<CreateUserInput> {
    id?: number;
    confirm?: string;
    roleNames: string[];
    isActive: boolean;
}

export interface RoleDto extends EntityDto {
    name: string;
    displayName: string;
    normalizedName?: string;
    description?: string;
    isStatic?: boolean;
    grantedPermissions?: string[];
}

export interface RoleForm extends Partial<RoleDto> {
    grantedPermissions: string[];
}

export interface PermissionDto {
    name: string;
    displayName: string;
    description?: string;
}

export interface RoleForEditOutput {
    role: RoleDto;
    permissions: PermissionDto[];
    grantedPermissionNames: string[];
}

export interface TenantDto extends EntityDto {
    tenancyName: string;
    name: string;
    isActive: boolean;
}

export interface TenantForm extends Partial<TenantDto> {
    isActive: boolean;
    connectionString?: string;
    adminEmailAddress?: string;
}

export interface AuthenticateResult {
    accessToken: string;
    encryptedAccessToken: string;
    expireInSeconds: number;
    userId?: number;
}

export interface RegisterOutput {
    canLogin: boolean;
}

export const TenantAvailabilityState = { Available: 1, InActive: 2, NotFound: 3 } as const;
export type TenantAvailabilityState = (typeof TenantAvailabilityState)[keyof typeof TenantAvailabilityState];

export interface IsTenantAvailableOutput {
    state: TenantAvailabilityState;
    tenantId?: number;
}

export interface LanguageInfo {
    name: string;
    displayName: string;
    icon?: string;
    isDefault?: boolean;
    isDisabled?: boolean;
}

/** Subset of /AbpUserConfiguration/GetAll. */
export interface UserConfiguration {
    auth?: { grantedPermissions?: Record<string, boolean> };
    multiTenancy?: { isEnabled?: boolean };
    localization?: {
        currentLanguage?: LanguageInfo;
        languages?: LanguageInfo[];
        sources?: Record<string, Record<string, string>>;
    };
}

export interface SessionUser {
    id: number;
    userName: string;
    name?: string;
    surname?: string;
    emailAddress?: string;
}

export interface SessionTenant {
    id: number;
    tenancyName: string;
    name?: string;
}

export interface SessionApplication {
    version?: string;
    releaseDate?: string;
}

export interface SessionInfo {
    user?: SessionUser | null;
    tenant?: SessionTenant | null;
    application?: SessionApplication;
}

/** Query parameters for the standard GetAll endpoints. */
export interface PagedQuery {
    Keyword?: string;
    IsActive?: boolean | '';
    Sorting?: string;
    SkipCount?: number;
    MaxResultCount?: number;
}
