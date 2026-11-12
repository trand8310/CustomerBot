import type { Component } from 'vue';
import {
    Avatar,
    Bell,
    Box,
    ChatDotRound,
    Connection,
    Document,
    Files,
    Grid,
    HomeFilled,
    House,
    Key,
    Link,
    List,
    Lock,
    Management,
    Menu,
    Message,
    Monitor,
    OfficeBuilding,
    Setting,
    Tickets,
    Tools,
    User,
    UserFilled,
} from '@element-plus/icons-vue';

/**
 * Element Plus icons that navigation.json (or the backend menu) may reference by name.
 * Only icons listed here are bundled; to use another one, import it from @element-plus/icons-vue
 * and add it below. Names match the component names at https://element-plus.org/en-US/component/icon.
 */
const menuIcons: Record<string, Component> = {
    Avatar,
    Bell,
    Box,
    ChatDotRound,
    Connection,
    Document,
    Files,
    Grid,
    HomeFilled,
    House,
    Key,
    Link,
    List,
    Lock,
    Management,
    Menu,
    Message,
    Monitor,
    OfficeBuilding,
    Setting,
    Tickets,
    Tools,
    User,
    UserFilled,
};

/** Resolves a menu icon name; unknown names render no icon. */
export function menuIcon(name: string | undefined): Component | undefined {
    return name && Object.hasOwn(menuIcons, name) ? menuIcons[name] : undefined;
}
