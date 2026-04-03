# Web Push Notifications - Quick Start Guide

## What Problem Does This Solve?

**Before:** Notifications only appeared when you had the website open.
**After:** Notifications appear EVEN when the website is completely closed (like Instagram, WhatsApp, etc.)

## What Changed?

We added **Web Push API** infrastructure. This allows the backend to send notifications directly to the browser, which displays them as OS-level popups.

## For Users: What To Do

### To Enable Push Notifications:

1. Open AnonVibes
2. Click the **bell icon (🔔)** in the top right
3. Click **"Turn On Notifications"**
4. Click **"Allow"** when your browser asks for permission
5. Done! ✅

Now you'll get notifications even when you close the website!

### Testing:

1. Enable notifications (as above)
2. **Close the website completely** (close the tab/window)
3. Open another browser tab
4. Go to AnonVibes and create a post
5. **Check your OS notification area** - you should see a notification appear!

## For Developers: Implementation Details

### Files Added:

```
app/api/notifications/subscribe/route.ts     ← Backend API to store subscriptions
lib/push-subscription-manager.ts             ← Frontend push manager
WEB_PUSH_SETUP.md                            ← Detailed setup guide
WEB_PUSH_IMPLEMENTATION.md                   ← Architecture & implementation
```

### Files Modified:

```
components/notifications-popup.tsx           ← Added push subscription on enable
public/sw.js                                 ← Enhanced push event handler
```

### Architecture:

```
User enables notifications
    ↓ (Browser requests permission)
Service Worker subscribes to PushManager
    ↓ (Gets push subscription)
Frontend calls /api/notifications/subscribe
    ↓ (Sends subscription to backend)
Backend stores in Firestore at users/{userId}/pushSubscriptions/web
    ↓ (Ready for push events)
Cloud Function detects post/comment/like
    ↓ (Triggered by Firestore change)
Backend sends HTTP POST to subscription endpoint
    ↓ (Via Push Service)
Browser receives push event in Service Worker
    ↓
OS-level notification appears
    ↓ (Even if website is closed!)
```

## How To Complete Setup (Production)

### Step 1: Generate VAPID Keys

```bash
npm install -g web-push
web-push generate-vapid-keys
```

You'll get:
```
Public Key:  ...
Private Key: ...
```

### Step 2: Add Keys to Environment

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<your-public-key>
VAPID_PRIVATE_KEY=<your-private-key>
```

### Step 3: Uncomment VAPID in Code

In `lib/push-subscription-manager.ts` line ~60:

```typescript
// Uncomment and add your public key
applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
```

### Step 4: Create Cloud Functions

Deploy to Firebase Cloud Functions (use example in `WEB_PUSH_SETUP.md`):

```typescript
// Triggers when new post created
exports.notifyNewPost = functions.firestore
  .document('posts/{postId}')
  .onCreate(async (snap, context) => {
    // Get all subscriptions
    // Send push to each user
  });

// Same for comments and reactions
```

### Step 5: Test

1. Enable notifications
2. Close website
3. Create a post
4. See notification appear!

## What Gets Stored in Firestore?

Location: `users/{userId}/pushSubscriptions/web`

```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "auth": "...",
      "p256dh": "..."
    }
  },
  "enabled": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## Debugging

### Check if subscription was stored:
1. Firebase Console → Firestore
2. Navigate to: `users` → (your userId) → `pushSubscriptions` → `web`
3. You should see a document with your subscription data

### Check Service Worker:
1. DevTools → Application → Service Workers
2. Verify service worker is "activated"
3. Under "Incoming Push Event" you can test sending a push

### Test Push Event (Chrome):
1. DevTools → Application → Service Workers
2. Scroll to "Incoming Push Event"
3. Paste test payload:
```json
{
  "title": "Test Notification",
  "body": "If you see this, push is working!",
  "tag": "test"
}
```
4. Click "Send"
5. OS notification should appear

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Firefox | ✅ Full |
| Edge | ✅ Full |
| Safari | ⚠️ Partial |
| Mobile Safari (iOS) | ⚠️ Limited |

Web Push requires HTTPS (or localhost for testing).

## Common Issues

### "Unsupported browser" error
- Make sure you're on HTTPS (not HTTP)
- Try Chrome/Firefox first
- Safari support is limited

### Subscription not stored
- Check browser notification permission: lock icon → Notifications → Allow
- Check Service Worker is registered and active
- Check browser console for errors

### Notifications not appearing
- Make sure notifications are enabled in browser settings
- Check Service Worker is active
- Try sending a test push via DevTools

### VAPID errors
- Generate new keys: `web-push generate-vapid-keys`
- Make sure environment variables are set
- Don't forget to uncomment the applicationServerKey line

## How It Works (Simple Explanation)

1. **Subscription**: When user enables notifications, the browser creates a unique "subscription" - think of it like a phone number for that device.

2. **Storage**: That subscription is stored on the backend so we know where to send notifications.

3. **Trigger**: When someone posts/likes/comments, our backend (Cloud Function) wakes up.

4. **Delivery**: Cloud Function sends a message to the subscription endpoint (like sending an SMS).

5. **Display**: The browser receives the message and tells the OS to show a notification.

6. **Click**: When user clicks the notification, it opens the app.

## Key Differences from Before

| Feature | Old System | New System |
|---------|-----------|-----------|
| Works when closed | ❌ No | ✅ Yes |
| Works when tab open | ✅ Yes | ✅ Yes |
| Real-time in Firestore | ✅ Yes | ✅ Yes |
| Requires backend | ❌ No | ✅ Yes (Cloud Functions) |
| Backend storage | ❌ No | ✅ Yes (Subscriptions) |
| OS notifications | ✅ Some | ✅ Always |

## Resources

- Full setup: Read `WEB_PUSH_SETUP.md`
- Architecture: Read `WEB_PUSH_IMPLEMENTATION.md`
- Web Push Spec: https://www.w3.org/TR/push-api/
- Firebase Functions: https://firebase.google.com/docs/functions
- web-push library: https://github.com/web-push-libs/web-push

## Next Steps

1. ✅ Frontend is ready (done!)
2. ⏳ Generate VAPID keys (you do)
3. ⏳ Set environment variables (you do)
4. ⏳ Deploy Cloud Functions (you do)
5. ⏳ Test end-to-end (you do)
6. ✅ Celebrate! 🎉 Push notifications are live!

The infrastructure is complete. Now you just need to deploy the Cloud Functions to Firebase!
