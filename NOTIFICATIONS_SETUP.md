# Real-Time Push Notifications System

## Overview

AnonVibes now features a complete real-time push notification system that displays browser notifications to users whenever new posts, comments, or reactions happen in the community. Users will receive notifications even when they're not on the website.

## Architecture

### Components

1. **Service Worker** (`/public/sw.js`)
   - Handles background notification events
   - Manages click actions and app focus
   - Runs independently of the main app

2. **Push Notification Manager** (`/lib/push-notification-manager.ts`)
   - Requests browser notification permissions
   - Shows OS-level notifications
   - Manages notification preferences
   - Provides utility functions for the notification system

3. **Real-time Events Hook** (`/hooks/use-realtime-events.ts`)
   - Monitors Firestore for new posts, comments, and reactions
   - Sends notifications in real-time (instantly)
   - Debounces to prevent notification spam
   - Filters out user's own actions

4. **Notification Initializer** (`/components/notification-initializer.tsx`)
   - Sets up service worker registration
   - Initializes real-time event listeners
   - Loads on app startup

5. **Notifications Bell** (`/components/notifications-bell.tsx`)
   - UI component for user to control notifications
   - Shows unread notification indicator
   - Triggers notification settings popup

6. **Notifications Popup** (`/components/notifications-popup.tsx`)
   - Popup menu for notification settings
   - Toggle notifications on/off
   - Shows permission status
   - Explains notification types

## How It Works

### User Journey

1. **First Visit**
   - Service worker is automatically registered
   - Bell icon appears in the header

2. **Enable Notifications**
   - User clicks the bell icon
   - Clicks "Turn On Notifications"
   - Browser requests permission
   - User grants permission (or denies)
   - Preference is saved to localStorage

3. **Real-Time Event Monitoring**
   - Once enabled, the app listens to Firestore in real-time
   - Detects new posts, comments, reactions instantly
   - Sends OS-level notifications to user's device

4. **Notification Display**
   - Browser notification appears (even if app is closed)
   - Notification shows contextual message
   - User can click to open the app

### Real-Time Events Monitored

The system monitors these events and sends notifications:

- **New Posts** - "What's on your mind? Someone just shared their thoughts"
- **New Comments** - "Someone responded to a post!"
- **New Reactions** - "Your post resonated with someone! ❤️"

Messages are randomized to keep notifications fresh and engaging.

## Technical Details

### Firestore Collections Monitored

The real-time listener watches these Firestore collections:

```
- /posts         (new posts trigger notification)
- /comments      (new comments trigger notification)
- /reactions     (new reactions trigger notification)
```

### Storage

- **localStorage** - Stores user notification preference (`anonvibes_notifications_enabled`)
- **Service Worker Cache** - Caches service worker script

### Permissions

- **Notification Permission** - Browser asks user for permission to show notifications
- **Service Worker Registration** - Auto-registers on app load

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Desktop & Android |
| Firefox | ✅ Full | Desktop & Android |
| Safari | ⚠️ Limited | iOS doesn't support push notifications |
| Edge | ✅ Full | Desktop |

## Debugging

### Check if notifications are enabled

```javascript
// In browser console
localStorage.getItem('anonvibes_notifications_enabled')
// Returns: true or false
```

### Check notification permission

```javascript
// In browser console
Notification.permission
// Returns: 'granted', 'denied', or 'default'
```

### Check service worker registration

```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(r => console.log(r))
```

## User Settings

Users can control notifications through the bell icon popup:
- Turn notifications on/off
- See notification permission status
- Learn what notifications they'll receive

## Performance Considerations

- **Debouncing** - Notifications are debounced (max 1 per type every 3 seconds)
- **Real-time Listeners** - Only active when notifications are enabled
- **Service Worker** - Minimal footprint, only loads when needed

## Future Enhancements

Potential improvements:
- Notification categories (mute specific types)
- Sound and vibration options
- Notification history
- Do Not Disturb schedule
- Custom notification templates
- User preference profiles

## Troubleshooting

### Notifications not showing

1. Check if permission is granted: `Notification.permission`
2. Check if notifications are enabled: `localStorage.getItem('anonvibes_notifications_enabled')`
3. Check browser notification settings
4. Verify service worker is registered

### Notification spam

- System automatically debounces notifications
- Maximum 1 notification per type every 3 seconds

### Permission denied

- Reset browser notification settings
- Clear site data and reload
- Check browser's notification blocker
