# Web Push Notifications Setup Guide

## Overview

This guide explains how to implement **true Web Push notifications** that work even when the website is closed (like Instagram).

## The Problem We're Solving

Previously, notifications only worked when the website was open because they listened to Firestore changes via JavaScript. Now, we've implemented Web Push API which allows the backend to send notifications even when the browser/tab is closed.

## How It Works

```
User enables notifications
    ↓
Browser requests permission
    ↓
Service Worker gets a push subscription
    ↓
Subscription endpoint is stored in Firestore
    ↓
Backend detects changes (new post, comment, like)
    ↓
Backend sends HTTP request to subscription endpoint
    ↓
Browser receives push event
    ↓
Service Worker displays OS-level notification
    ↓
Notification appears even if website is closed!
```

## Architecture

### 1. Frontend (Browser)
- **`lib/push-subscription-manager.ts`** - Manages Web Push subscriptions
- **`public/sw.js`** - Service Worker handles push events
- **`components/notifications-popup.tsx`** - UI for enabling/disabling notifications

### 2. Backend (Server)
- **`app/api/notifications/subscribe/route.ts`** - Stores subscriptions in Firestore
- **`app/api/notifications/send/route.ts`** - Placeholder for Cloud Function triggers

### 3. Database (Firestore)
Subscriptions stored in:
```
users/{userId}/pushSubscriptions/web
```

## Implementation Steps

### Step 1: User Enables Notifications

When user clicks "Turn On Notifications":

1. Browser requests `Notification` permission
2. User grants permission
3. Service Worker gets push subscription from PushManager
4. Subscription is sent to `/api/notifications/subscribe`
5. Backend stores it in Firestore

### Step 2: User Performs Action

When user creates a post or other action, Firestore triggers a Cloud Function.

### Step 3: Backend Sends Notification

Cloud Function:
1. Gets all user push subscriptions from Firestore
2. Sends HTTP POST request to each subscription endpoint
3. Browser receives push event in Service Worker
4. Service Worker displays OS-level notification

## VAPID Keys (Important!)

Web Push API requires VAPID keys for authentication. These are public/private key pairs.

### Generate VAPID Keys

```bash
npm install -g web-push
web-push generate-vapid-keys
```

This generates:
```
Public Key:  BLX...
Private Key: hX...
```

### Use VAPID Keys

1. **Frontend**: Pass public key to `PushManager.subscribe()`
2. **Backend**: Use private key when sending notifications via web-push library

Currently, the code has a comment where the public key should be used:

```typescript
// In lib/push-subscription-manager.ts
subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  // applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
});
```

## Cloud Functions Setup (Production)

For production, implement Cloud Functions to send notifications:

```typescript
// Firebase Cloud Function (deploy to Firebase)
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as webpush from 'web-push';

admin.initializeApp();

// Trigger when new post is created
exports.notifyNewPost = functions.firestore
  .document('posts/{postId}')
  .onCreate(async (snap, context) => {
    const post = snap.data();
    
    // Get all user subscriptions
    const subscriptions = await admin.firestore()
      .collectionGroup('pushSubscriptions')
      .where('enabled', '==', true)
      .get();
    
    // Send push to each subscription
    for (const doc of subscriptions.docs) {
      const subscription = doc.data().subscription;
      
      try {
        await webpush.sendNotification(subscription, JSON.stringify({
          title: 'New Post',
          body: 'Someone shared a new post',
          tag: 'post-type',
        }));
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    }
  });
```

## Testing Web Push Locally

### Test 1: Enable Notifications
1. Open the website
2. Click notification bell icon
3. Click "Turn On Notifications"
4. Grant browser permission
5. Check that subscription is stored in Firestore: `users/{userId}/pushSubscriptions/web`

### Test 2: Check Service Worker
1. Open DevTools → Application → Service Workers
2. Verify service worker is registered and active

### Test 3: Simulate Push Event (Chrome DevTools)
1. Open DevTools → Application → Service Workers
2. Scroll down to "Incoming Push Event"
3. Add test payload:
```json
{
  "title": "Test Notification",
  "body": "This is a test notification",
  "tag": "test"
}
```
4. Click "Send"
5. OS-level notification should appear

### Test 4: Close Website and Test
1. Enable notifications as above
2. Close the website tab completely
3. Go back to DevTools for another tab
4. Send a test push (see Test 3)
5. Notification appears even though website is closed!

## Firestore Schema

```
users/
  {userId}/
    pushSubscriptions/
      web/
        - subscription: PushSubscription object
          - endpoint: "https://..."
          - keys: { auth, p256dh }
        - enabled: boolean
        - createdAt: timestamp
        - updatedAt: timestamp
        - userAgent: string
```

## Environment Variables Needed

For production deployment:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<your-public-key>
VAPID_PRIVATE_KEY=<your-private-key>
```

## Troubleshooting

### Notifications not appearing
1. Check browser permission: lock icon → Notifications → Allow
2. Check Service Worker is registered: DevTools → Application → Service Workers
3. Check subscription exists in Firestore: `users/{userId}/pushSubscriptions/web`
4. Check browser console for errors: DevTools → Console

### "Unsupported browser" error
- Web Push API requires HTTPS (or localhost for testing)
- Check browser support at [caniuse.com](https://caniuse.com/push-api)

### Subscription errors
1. Check Firebase rules allow read/write to `pushSubscriptions` collection
2. Verify user is authenticated before subscribing
3. Check network tab for API errors

## Key Files

- **`lib/push-subscription-manager.ts`** - Subscription management
- **`app/api/notifications/subscribe/route.ts`** - Backend storage
- **`public/sw.js`** - Service Worker push handler
- **`components/notifications-popup.tsx`** - User interface
- **`lib/push-notification-manager.ts`** - In-app notifications (still works)

## Next Steps

1. Generate VAPID keys using web-push CLI
2. Set up Firebase Cloud Functions for server-side triggers
3. Deploy Cloud Functions to production
4. Test end-to-end: post → notification → appears in closed browser

## References

- [Web Push API MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [web-push npm library](https://github.com/web-push-libs/web-push)
- [VAPID Keys Guide](https://github.com/web-push-libs/web-push#using-vapid-key-for-applicationserverkey)
