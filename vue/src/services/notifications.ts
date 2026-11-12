import { HubConnectionBuilder, LogLevel, type HubConnection } from '@microsoft/signalr';
import { ElNotification } from 'element-plus';
import { cookie } from '../api';
let connection: HubConnection | undefined;

interface HostNotification {
    notification?: {
        data?: {
            message?: string;
            properties?: { Message?: string };
        };
    };
}

export async function startNotifications() {
    if (connection) return;
    const base = (import.meta.env.VITE_API_BASE_URL || 'https://localhost:44311').replace(/\/$/, '');
    const encrypted = cookie('enc_auth_token');
    connection = new HubConnectionBuilder()
        .withUrl(`${base}/signalr?enc_auth_token=${encrypted}`)
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Warning)
        .build();
    connection.on('getNotification', (notification: HostNotification) => {
        const data = notification?.notification?.data;
        const message = data?.properties?.Message || data?.message;
        if (!message) return;
        ElNotification({ title: 'CustomerBot', message });
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted')
            new Notification('CustomerBot', { body: message });
    });
    connection.onreconnected(() => connection?.invoke('register').catch(() => {}));
    try {
        await connection.start();
        await connection.invoke('register');
    } catch (error) {
        console.warn('SignalR connection unavailable:', error.message);
        connection = undefined;
    }
}
