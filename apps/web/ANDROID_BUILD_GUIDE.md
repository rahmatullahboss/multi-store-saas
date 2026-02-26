# Android APK Build Guide — Ozzyl Merchant App

> Last updated: 2026-02-25  
> App: `com.ozzyl.app` → Opens `https://app.ozzyl.com` (Merchant Admin Dashboard)

---

## ✅ What's Already Done (No need to redo)

- Capacitor v8.1.0 installed and configured
- App ID: `com.ozzyl.app`, App Name: `Ozzyl`
- All Android icon sizes generated from `ozzyl-logo.png`
- Splash screens generated (portrait + landscape)
- Plugins installed: `app`, `status-bar`, `splash-screen`, `network`, `push-notifications`, `camera`, `filesystem`
- Android project synced: `apps/web/android/`

---

## 🛠️ Prerequisites (Do Once)

1. **Install Android Studio**  
   Download: https://developer.android.com/studio

2. **Install Java JDK 17+**  
   Download: https://adoptium.net/

3. **Install Node.js 20+**  
   Download: https://nodejs.org/

---

## 🚀 Build Steps

### Step 1 — Pull the repo on your local machine

```bash
git pull origin main
cd apps/web
npm install
```

### Step 2 — Sync Capacitor

```bash
cd apps/web
npx cap sync android
```

### Step 3 — Open Android Studio

```bash
npx cap open android
```

### Step 4 — Wait for Gradle Sync

- Android Studio will open the project
- Wait for **Gradle sync** to finish (3-5 min first time)
- If it asks to update Gradle, click **Update**

### Step 5 — Generate Signed APK

1. Go to **Build → Generate Signed Bundle / APK**
2. Select **APK** (not Bundle) → Click **Next**
3. **Create a new keystore** (first time only):
   - Key store path: save `ozzyl-release.jks` somewhere safe (you need this FOREVER)
   - Set a password (write it down!)
   - Alias: `ozzyl`
   - Fill in your name/org details
4. Select **release** build variant
5. Click **Finish**

APK will be at:
```
apps/web/android/app/release/app-release.apk
```

---

## 📱 Test on Physical Device

```bash
# Enable USB Debugging on your Android phone:
# Settings → About Phone → Tap "Build Number" 7 times
# Settings → Developer Options → Enable USB Debugging

# Connect phone via USB, then:
cd apps/web
npx cap run android
```

Or in Android Studio click the ▶️ **Run** button with your phone selected.

---

## 🔄 After Making Code Changes

Whenever you update the web app and want to update the Android app:

```bash
cd apps/web
npm run build          # Build the web app
npx cap sync android   # Sync to Android
npx cap open android   # Open Android Studio to rebuild APK
```

---

## 🏪 Play Store Submission Checklist

- [ ] Generate signed APK (release build)
- [ ] Create Google Play Developer account ($25 one-time fee)
- [ ] Prepare store listing:
  - [ ] App description (short + full)
  - [ ] 2-8 screenshots (from your phone)
  - [ ] Feature graphic (1024×500px)
  - [ ] Privacy policy URL
- [ ] Upload APK to Play Console
- [ ] Submit for review (3-7 days)

---

## 🔧 Plugins Installed & Their Use

| Plugin | How to Use |
|--------|-----------|
| `@capacitor/push-notifications` | FCM push notifications (needs Firebase setup) |
| `@capacitor/camera` | Take photos (product images) |
| `@capacitor/filesystem` | Save files locally |
| `@capacitor/network` | Detect online/offline status |
| `@capacitor/status-bar` | Control status bar color |
| `@capacitor/splash-screen` | Control splash screen |
| `@capacitor/app` | Handle back button, app state |

Plugin initialization is automatic — see `app/lib/capacitor.client.ts`

---

## 🔔 Firebase Push Notifications Setup (Future)

1. Go to https://console.firebase.google.com
2. Create project → Add Android app → Package: `com.ozzyl.app`
3. Download `google-services.json` → place in `android/app/`
4. Follow: https://capacitorjs.com/docs/apis/push-notifications

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|---------|
| Gradle sync fails | File → Invalidate Caches → Restart |
| `npx cap open android` not found | Run `npm install` in `apps/web/` first |
| App shows blank screen | Check internet connection — app needs `https://app.ozzyl.com` to load |
| Icon not showing | Run `npx cap sync android` again |
