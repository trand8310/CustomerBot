/**
 * Resolves the tenancy name for the current page.
 * A `{TENANCY_NAME}` subdomain template wins over the `abp_tenancy_name` query parameter.
 */
export function resolveTenancyName(href: string, template: string): string | null {
    let tenantName = new URL(href).searchParams.get('abp_tenancy_name');
    if (template.includes('{TENANCY_NAME}')) {
        const [prefix, suffix] = template.split('{TENANCY_NAME}');
        if (href.startsWith(prefix)) {
            const rest = href.slice(prefix.length);
            const end = suffix ? rest.indexOf(suffix) : -1;
            if (end > 0) tenantName = rest.slice(0, end);
        }
    }
    return tenantName || null;
}
