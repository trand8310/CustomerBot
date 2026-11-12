import axios from 'axios';
import { z } from 'zod';

const label = z.object({ title: z.string().min(1), titleKey: z.string().optional(), icon: z.string().optional() });
const pageSchema = label.extend({
    type: z.literal('page'),
    page: z.string().min(1),
    path: z.string().regex(/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/),
    menu: z.boolean().optional(),
    topbar: z.boolean().optional(),
});
const externalSchema = label.extend({
    type: z.literal('external'),
    url: z.url({ protocol: /^https?$/ }),
});

export type NavigationPage = z.infer<typeof pageSchema>;
type NavigationGroup = z.infer<typeof label> & { type: 'group'; id: string; children: NavigationItem[] };
export type NavigationItem = NavigationPage | z.infer<typeof externalSchema> | NavigationGroup;

const itemSchema: z.ZodType<NavigationItem> = z.lazy(() =>
    z.discriminatedUnion('type', [
        pageSchema,
        externalSchema,
        label.extend({ type: z.literal('group'), id: z.string().min(1), children: z.array(itemSchema) }),
    ])
);

export async function fetchNavigation() {
    const response = await axios.get<unknown>(import.meta.env.BASE_URL + 'mock/navigation.json');
    return z.array(itemSchema).parse(response.data);
}
