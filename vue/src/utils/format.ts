/** Replaces ABP-style `{0}`, `{1}` placeholders with the given arguments. */
export function formatMessage(template: string, args: readonly unknown[]): string {
    return template.replace(/\{(\d+)\}/g, (match, index: string) => {
        const value = args[Number(index)];
        return value === undefined || value === null ? match : String(value);
    });
}
