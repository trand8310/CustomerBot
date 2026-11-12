import type { HubConnection } from '@microsoft/signalr';
import { ElNotification } from 'element-plus';
import { apiBaseUrl } from '../config';
import { cookie, encryptedTokenCookie } from '../api';

let connection: HubConnection | undefined;

interface HostNotification {
    notification?: {
        data?: {
            message?: string;
            properties?: { Message?: string };
        };
    };
}

export async function startNotifications(): Promise<void> {
    if (connection) return;
    // Loaded on demand so the SignalR client is not part of the initial bundle.
    const { HubConnectionBuilder, LogLevel } = await import('@microsoft/signalr');
    if (connection) return;
    const encrypted = encodeURIComponent(cookie(encryptedTokenCookie));
    const current = new HubConnectionBuilder()
        .withUrl(`${apiBaseUrl}/signalr?enc_auth_token=${encrypted}`)
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Warning)
        .build();
    connection = current;
    current.on('getNotification', (notification: HostNotification) => {
        const data = notification?.notification?.data;
        const message = data?.properties?.Message || data?.message;
        if (!message) return;
        ElNotification({ title: 'CustomerBot', message });
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted')
            new Notification('CustomerBot', { body: message });
    });
    current.onreconnected(() => current.invoke('register').catch(() => {}));
    try {
        await current.start();
        await current.invoke('register');
    } catch (error) {
        console.warn('SignalR connection unavailable:', error instanceof Error ? error.message : error);
        connection = undefined;
    }
}
