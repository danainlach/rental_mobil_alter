let notificationSocket;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

function initializeNotifications(userId) {
    if (!userId) {
        console.error('User ID is required for notifications');
        return;
    }

    console.log('Initializing notifications for user:', userId);
    connectWebSocket(userId);
    loadNotifications();
    updateNotificationBadge();

    // Add periodic cleanup (run once per day)
    setInterval(cleanupOldNotifications, 24 * 60 * 60 * 1000);
    // Run initial cleanup
    cleanupOldNotifications();
}

function connectWebSocket(userId) {
    if (notificationSocket && notificationSocket.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected');
        return;
    }

    notificationSocket = new WebSocket(`ws://${window.location.hostname}:3001`);
    
    notificationSocket.onopen = () => {
        console.log('WebSocket connected, registering client');
        reconnectAttempts = 0;
        notificationSocket.send(JSON.stringify({
            type: 'register',
            userId: userId.toString()
        }));
    };
    
    notificationSocket.onmessage = (event) => {
        console.log('Received message:', event.data);
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
            showNotification(data.data);
            loadNotifications();
            updateNotificationBadge();
        }
    };

    notificationSocket.onclose = () => {
        console.log('WebSocket disconnected');
        if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})`);
            setTimeout(() => connectWebSocket(userId), 5000);
        }
    };

    notificationSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

// Show notification
function showNotification(notification) {
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">Notification</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
            ${notification.message}
        </div>
    `;

    document.getElementById('notificationToasts').appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

// Update notification badge
function updateNotificationBadge() {
    fetch('/api/notifications/unread-count')
        .then(res => res.json())
        .then(data => {
            const badge = document.getElementById('notificationBadge');
            badge.textContent = data.count;
            badge.style.display = data.count > 0 ? 'block' : 'none';
        });
}

// Mark notification as read
window.markAsRead = function(notificationId) {
    fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
    }).then(() => {
        updateNotificationBadge();
    });
};

// Initial badge update
updateNotificationBadge();

function loadNotifications() {
    fetch('/api/notifications')
        .then(res => res.json())
        .then(notifications => {
            const notificationList = document.getElementById('notificationList');
            const existingItems = notificationList.querySelectorAll('.notification-item');
            existingItems.forEach(item => item.remove());

            if (notifications.length === 0) {
                const li = document.createElement('li');
                li.className = 'notification-item';
                li.innerHTML = `
                    <span class="dropdown-item text-muted">No notifications</span>
                `;
                notificationList.appendChild(li);
            } else {
                notifications.forEach(notification => {
                    const li = document.createElement('li');
                    li.className = 'notification-item';
                    li.setAttribute('data-notification-id', notification.id);
                    li.innerHTML = `
                        <a class="dropdown-item ${notification.isRead ? '' : 'fw-bold'}" href="#" 
                           onclick="event.preventDefault(); markNotificationAsRead('${notification.id}')">
                            <div class="d-flex align-items-center">
                                <i class="bi ${getNotificationIcon(notification.type)} me-2"></i>
                                <div>
                                    <div>${notification.message}</div>
                                    <small class="text-muted">${new Date(notification.createdAt).toLocaleString()}</small>
                                </div>
                                ${!notification.isRead ? '<span class="ms-2 badge bg-primary">New</span>' : ''}
                            </div>
                        </a>
                    `;
                    notificationList.appendChild(li);
                });
            }
            updateNotificationBadge();
        });
}

function getNotificationIcon(type) {
    switch(type) {
        case 'chat': return 'bi-chat-dots';
        case 'rental': return 'bi-car-front';
        case 'approval': return 'bi-check-circle';
        default: return 'bi-bell';
    }
}

function markNotificationAsRead(id) {
    fetch(`/api/notifications/${id}/read`, { 
        method: 'POST'
    })
    .then(() => {
        // Instead of removing, just update the notification style
        const notificationElement = document.querySelector(`[data-notification-id="${id}"]`);
        if (notificationElement) {
            const link = notificationElement.querySelector('.dropdown-item');
            const badge = notificationElement.querySelector('.badge.bg-primary');
            
            // Remove bold style
            link.classList.remove('fw-bold');
            // Remove 'New' badge
            if (badge) {
                badge.remove();
            }
        }
        // Update badge count
        updateNotificationBadge();
    });
}

// Clear all read notifications
function clearAllNotifications() {
    if (confirm('Are you sure you want to clear all read notifications?')) {
        fetch('/api/notifications/clear-all', {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(() => {
            // Only remove read notifications from the list
            const readNotifications = document.querySelectorAll('.notification-item .dropdown-item:not(.fw-bold)');
            readNotifications.forEach(item => {
                const li = item.closest('.notification-item');
                if (li) li.remove();
            });
            updateNotificationBadge();
        })
        .catch(error => console.error('Error clearing notifications:', error));
    }
}

// Add automatic cleanup of old notifications
function cleanupOldNotifications() {
    fetch('/api/notifications/cleanup', {
        method: 'DELETE'
    })
    .then(response => response.json())
    .catch(error => console.error('Error cleaning up notifications:', error));
}

// Load notifications every 30 seconds
setInterval(loadNotifications, 30000);
// Initial load
document.addEventListener('DOMContentLoaded', loadNotifications);
