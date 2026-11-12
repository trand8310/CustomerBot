/** ABP response envelope. */
export interface AbpEnvelope<T = unknown> {
    success?: boolean;
    result?: T;
    unAuthorizedRequest?: boolean;
    error?: {
        message?: string;
        details?: string;
        validationErrors?: { message: string }[] | null;
    } | null;
}

export interface RequestFailure {
    response?: { status?: number; data?: unknown };
    abp?: AbpEnvelope;
    message?: string;
}

function asEnvelope(value: unknown): AbpEnvelope | undefined {
    return value && typeof value === 'object' ? (value as AbpEnvelope) : undefined;
}

/** Picks the most useful message from an Axios or ABP failure. */
export function errorMessage(error: unknown, fallback: string): string {
    const failure = (error ?? {}) as RequestFailure;
    const envelope = asEnvelope(failure.response?.data) ?? failure.abp;
    const validation = envelope?.error?.validationErrors?.map((x) => x.message).join('\n');
    return validation || envelope?.error?.details || envelope?.error?.message || failure.message || fallback;
}

/** True when the server rejected the request because the user is not authenticated. */
export function isUnauthorized(error: unknown): boolean {
    const failure = (error ?? {}) as RequestFailure;
    const envelope = asEnvelope(failure.response?.data) ?? failure.abp;
    return failure.response?.status === 401 || !!envelope?.unAuthorizedRequest;
}
