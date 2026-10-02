# Web Push Notifications Fix & Architecture Guide

> **Project:** MEEO Admin Dashboard (`admin-dash`) & Server (`server`)  
> **Date:** October 2026  
> **Status:** Verified & Working (100% Delivery across Web Chrome & Android)

---

## 1. Problem Statement (Kya Problem Tha?)

Admin dashboard me Web Push Notifications enable karne ke baad bhi:
1. Browser me koi notification popup ya alert sound nahi aa raha tha.
2. Server jab push message dispatch karta tha, toh Google Firebase Cloud Messaging (FCM) se error aata tha:
   ```text
   ❌ FAILED | Error: messaging/registration-token-not-registered (Device unregistered.)
   ```
3. Mobile (Android app) par notifications successfully ja rahe the, lekin Web browser ka token reject ho raha tha.
4. Browser refresh ya re-visit karne par purana dead token hi reuse ho raha tha aur database me dead tokens accumulate ho rahe the.

---

## 2. Root Cause Analysis (Problem Kyu Ho Rahi Thi?)

Humne investigate kiya aur paanch specific technical root causes mile:

### A. Service Worker Activation Race Condition
- **Problem:** `src/lib/push-notifications.ts` me `navigator.serviceWorker.register(...)` call hote hi turant `getToken(messaging, ...)` call ho jata tha.
- **Why it failed:** Chrome me jab service worker register hota hai, toh woh pehle `installing` state me hota hai, turant `active` nahi hota. Bina `await navigator.serviceWorker.ready` ke `getToken()` call karne par Chrome ek unlinked push subscription banata hai jise Google FCM server reject (`registration-token-not-registered`) kar deta hai.

### B. Old Service Worker Stuck in Memory (`skipWaiting` Missing)
- **Problem:** `public/firebase-messaging-sw.js` me `self.skipWaiting()` aur `clients.claim()` nahi tha.
- **Why it failed:** Chrome tab tak puraane worker ko background se nahi hatata jab tak saare tabs band na ho jayein. Naya updated worker `waiting` state me atka rehta tha aur browser purane broken worker se hi operate kar raha tha.

### C. Conflicting Push Event Listeners
- **Problem:** `firebase-messaging-sw.js` ke andar `messaging.onBackgroundMessage(...)` ke saath-saath ek manual `self.addEventListener("push", ...)` bhi registered tha.
- **Why it failed:** Firebase SDK internally apna push event listener manage karta hai. Do listeners ek sath hone se incoming FCM message hijack aur crash ho jata tha.

### D. Outdated Firebase SDK in Service Worker
- **Problem:** `admin-dash/package.json` me modern modular Firebase SDK (`^12.19.0`) installed tha, lekin `firebase-messaging-sw.js` purana compat script (`firebasejs/9.23.0`) import kar raha tha.
- **Why it failed:** Client window aur service worker ke beech ka internal message channel handshake break ho raha tha.

### E. Stale Token Stuck in `localStorage`
- **Problem:** `push-notifications.ts` token ko `localStorage["meeo_fcm_token"]` me save karta tha aur naye session par wahi return kar deta tha bina Firebase se verify kiye.
- **Why it failed:** Jab token FCM par invalid ho gaya, tab bhi frontend wahi dead token return karta raha aur fresh token mint nahi hua.

---

## 3. Applied Fixes (Kya Fix Kiya Gaya?)

### 1. `public/firebase-messaging-sw.js` Cleaned & Upgraded
- Upgraded scripts to modern compatible version `10.13.2`.
- Added immediate activation hooks:
  ```javascript
  self.addEventListener("install", () => {
    self.skipWaiting();
  });

  self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
  });
  ```
- Hardcoded guaranteed configuration for Firebase Project `meeo-1242a` (query parameters ki dependence khatam ki).
- Removed the conflicting manual `"push"` listener, leaving clean `messaging.onBackgroundMessage(...)`.

### 2. `src/lib/push-notifications.ts` Registration Lifecycle
- Added `await navigator.serviceWorker.ready` before `getToken()` call:
  ```typescript
  swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
    scope: "/",
  });
  await navigator.serviceWorker.ready;
  ```
- Guaranteed that Google FCM generates a valid, linked token only when the Service Worker is 100% active.

### 3. `src/hooks/use-push-notifications.ts` Auto Self-Healing
- On dashboard mount, if browser permission is already granted, it silently validates the token with Firebase.
- If the token was dead or changed, it automatically fetches a fresh token and syncs it with the backend database (`POST /api/v1/notifications/devices`).

### 4. Backend Dead Token Pruning (`server`)
- Updated `push.provider.ts`, `notificationPreference.service.ts`, and `seed-notify-all-devices.ts`:
  - Jab bhi Google FCM `registration-token-not-registered` return kare, token ko `isActive: false` karke chhodne ke bajaye **`prisma.deviceToken.deleteMany()`** se permanently delete kiya jata hai taaki database me garbage rows na badhein.

---

## 4. Verification Results (Kaise Verify Hua?)

Broadcast test script (`npm run notify:all`) execute karne par Web aur Mobile dono devices ko push notification deliver hua:

```text
=================================================
📢 SEED & TEST: PUSH NOTIFICATION BROADCAST
=================================================

✅ Firebase Admin initialized for project: "meeo-1242a"
🔍 Fetching active devices from database...
📊 Found 2 active device token(s) in DB (Total targets: 2).

🚀 Dispatching push notification to 2 device(s)...

=================================================
📊 BROADCAST RESULTS SUMMARY
=================================================
- Success Count: 2
- Failure Count: 0
-------------------------------------------------
[Device #1] ✅ SUCCESS | Token: f-v9rOhf6dx-jPL1yRyM... | MessageId: projects/meeo-1242a/messages/ce0ce235-8e9d-4242-8de6-541ce645c0d5
[Device #2] ✅ SUCCESS | Token: c_mZMHPrQpa2gBJNPc7M... | MessageId: projects/meeo-1242a/messages/0:1790952841880179%e7ba05aae7ba05aa

✅ Broadcast execution completed.
```

- **Browser Result:** Web Chrome notification banner popup display hua aur audio chime successfully play hua.
- **Mobile Result:** Android device par push notification alert deliver hua.
- **Failures:** 0.
