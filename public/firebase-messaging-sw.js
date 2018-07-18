importScripts('https://www.gstatic.com/firebasejs/5.1.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.1.0/firebase-messaging.js');
importScripts('assets/js/auth.js');

const messaging = firebase.messaging();

self.addEventListener('push', event => {
    console.log('Received a push message', event);
    var notification = event.data.json().notification
    var title = notification.title || 'Yay a message.';
    var body = notification.body || 'We have received a push message.';
    var icon = 'assets/images/icons/icon-192x192.png';
    // var tag = 'simple-push-demo-notification-tag';
    event.waitUntil(
        self.registration.showNotification(title, {
            body: body,
            icon: icon
        })
    );
});