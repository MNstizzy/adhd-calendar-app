import { Notification } from '../types';

export const showNotification = (notification: Notification) => {
    const { title, message } = notification;
    // Create a notification element
    const notificationElement = document.createElement('div');
    notificationElement.className = 'notification';
    notificationElement.innerHTML = `
        <strong>${title}</strong>
        <p>${message}</p>
    `;

    // Append to the body
    document.body.appendChild(notificationElement);

    // Remove notification after a timeout
    setTimeout(() => {
        notificationElement.remove();
    }, 3000);
};

export const scheduleNotification = (notification: Notification, time: Date) => {
    const timeout = time.getTime() - Date.now();
    if (timeout > 0) {
        setTimeout(() => showNotification(notification), timeout);
    }
};