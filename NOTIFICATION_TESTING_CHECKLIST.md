# Quick Notification Testing Checklist

Use this checklist to verify notifications are working properly.

## Pre-Test Setup

- [ ] App is deployed and accessible
- [ ] Firestore database is configured with posts, comments, and reactions collections
- [ ] Service worker file exists at `/public/sw.js`
- [ ] Browser supports notifications (Chrome, Firefox, or Edge)

## Test 1: Enable Notifications

- [ ] Open app in browser
- [ ] Click bell icon in header
- [ ] See "Notifications" popup
- [ ] Click "Turn On Notifications"
- [ ] Browser requests permission (notification prompt appears)
- [ ] Click "Allow" on the permission prompt
- [ ] Button changes to "Turn Off Notifications" (red)
- [ ] Console shows: `[v0] Notification permission granted`
- [ ] Console shows: `[v0] Setting up real-time listeners for userId: [uid]`

## Test 2: Trigger Notifications (Same Tab)

**Note:** Notifications won't show for your own posts. You need another user.

- [ ] Open app in **Tab A** with notifications enabled
- [ ] Open app in **Tab B** (different browser or incognito)
- [ ] In Tab B, create a new post
- [ ] Check Tab A for notification popup (OS-level, not in-app)
- [ ] Notification should appear within 1-3 seconds
- [ ] Console shows: `[v0] New post detected:`
- [ ] Console shows: `[v0] Showing new post notification`

## Test 3: Comment Notifications

- [ ] In Tab A, post something with your account
- [ ] In Tab B, comment on Tab A's post
- [ ] Tab A should receive notification: "Someone commented on your post!"
- [ ] Console shows: `[v0] New comment detected:`

## Test 4: Reaction/Like Notifications

- [ ] In Tab A, post something
- [ ] In Tab B, like/react to Tab A's post
- [ ] Tab A should receive notification: "Your post resonated with someone!"
- [ ] Console shows: `[v0] New reaction detected:`

## Test 5: Offline Notifications

- [ ] Enable notifications in Tab A
- [ ] Close Tab A completely (or close browser)
- [ ] In Tab B, create a post
- [ ] OS notification should still appear on your device/screen
- [ ] Even though app is closed, notification appears
- [ ] Click notification → App opens in Tab A

## Test 6: Disable Notifications

- [ ] Click bell icon
- [ ] Click "Turn Off Notifications" (red button)
- [ ] Button changes back to "Turn On Notifications" (blue)
- [ ] In another tab, create a post
- [ ] **No notification appears** (this is correct)
- [ ] Console shows: `[v0] Notifications are disabled`

## Test 7: Toggle and Re-enable

- [ ] Disable notifications (Test 6)
- [ ] Enable notifications again
- [ ] Wait for service worker to register
- [ ] In another tab, create a post
- [ ] Notification **should appear** again
- [ ] Console should show listeners being set up again

## Test 8: Permission Denied

- [ ] Open app in a new incognito/private window
- [ ] Click bell icon
- [ ] Click "Turn On Notifications"
- [ ] When browser asks for permission, click "Block"
- [ ] Notification popup shows error message
- [ ] Console shows: `[v0] Notification permission denied`
- [ ] You can see instructions to enable in browser settings

## Test 9: Browser Console Logs

Open DevTools (F12) and check the Console tab:

**Should see logs like:**
```
[v0] useRealtimeEvents: userId not available yet
[v0] Setting up real-time listeners for userId: ABC123
[v0] Notifications enabled preference: true
[v0] New post detected: { postId: 'XYZ', userId: '...', currentUserId: 'ABC123' }
[v0] Showing new post notification
```

**Should NOT see errors like:**
```
Notification permission not granted
Error in posts listener:
Failed to initialize notifications
```

## Common Issues & Quick Fixes

### No notifications at all
- ✅ Reload the page
- ✅ Clear browser cache (Ctrl+Shift+Delete)
- ✅ Check browser notification settings
- ✅ Make sure you're on HTTPS (if production)
- ✅ Verify Firestore has data

### Notifications work but inconsistent
- ✅ Check debouncing isn't active (3 second cooldown per notification type)
- ✅ Verify other users are creating posts (not your own)
- ✅ Make sure Firestore rules allow reading collections

### Service worker not registering
- ✅ Check `/public/sw.js` exists
- ✅ Check browser console for errors
- ✅ Try different browser (Chrome/Firefox)
- ✅ Make sure app is served over HTTPS

### Permission keeps being "denied"
- ✅ Browser settings → Notifications → Find your domain → Change to "Allow"
- ✅ Some browsers require HTTPS
- ✅ Try incognito window to reset permissions
- ✅ Restart browser completely

## Success Criteria ✅

Your notifications are working correctly when:

1. ✅ You can enable notifications and get permission prompt
2. ✅ Other users' posts trigger notifications within 1-3 seconds
3. ✅ Comments on your posts notify you instantly
4. ✅ Likes/reactions notify you instantly
5. ✅ Notifications appear as OS popups (not in-app only)
6. ✅ Notifications work even when browser is closed
7. ✅ Console shows `[v0]` logs for all activities
8. ✅ No errors in console related to notifications

## Quick Debug Command

Paste this in your browser console to see notification state:

```javascript
// Check if notifications enabled
console.log('Notifications enabled:', localStorage.getItem('anonvibes_notifications_enabled'));

// Check browser permission
console.log('Browser permission:', Notification.permission);

// Check service worker
navigator.serviceWorker.getRegistrations().then(r => 
  console.log('Service workers registered:', r.length)
);
```

---

If all tests pass ✅, your notification system is working like Instagram! 🎉
