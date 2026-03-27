# FretMaestro — App Store Publication Guide

## ✅ What's Done

### Build & Containers
- [x] Production web build (`dist/`)
- [x] iOS container synced (`ios/App/App/public/`)
- [x] Android container synced (`android/app/src/main/assets/public/`)
- [x] App icons generated (all iOS + Android sizes)
- [x] PWA manifest configured
- [x] Capacitor config with proper App ID: `com.fretmaestro.app`

### App Metadata
- [x] App Name: **FretMaestro**
- [x] Version: 1.0.0 (Build 1)
- [x] Bundle ID: `com.fretmaestro.app`
- [x] Localizations: English, Russian
- [x] Info.plist: audio background mode, mic permission, orientations

---

## 🔧 Steps to Complete (requires manual action)

### 1. Fix Xcode Developer Directory
```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

### 2. Install CocoaPods (if not installed)
```bash
brew install cocoapods
# OR
sudo gem install cocoapods
```

### 3. Sync & Build iOS
```bash
cd /Users/mike/Maestro
npm run build:ios
# Then open in Xcode:
npm run cap:ios
```
This opens the Xcode project. In Xcode:
- Select your **Team** in Signing & Capabilities
- Set **Bundle Identifier** to `com.fretmaestro.app`
- Select a real device or "Any iOS Device" for archive
- **Product → Archive** to create the IPA

### 4. Build Android APK/AAB
```bash
npm run build:android
npm run cap:android
```
In Android Studio:
- **Build → Generate Signed Bundle / APK**
- Choose **Android App Bundle (.aab)** for Play Store

---

## 📱 App Store Connect Setup

### Create App
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. **My Apps → + → New App**
3. Fill in:
   - **Name**: FretMaestro
   - **Bundle ID**: com.fretmaestro.app
   - **Primary Language**: English
   - **SKU**: fretmaestro-001

### App Information
- **Category**: Music
- **Secondary Category**: Education
- **Content Rights**: Does not contain third-party content
- **Age Rating**: 4+ (no objectionable content)

### Pricing & Availability
- **Price**: Free (with In-App Purchases)
- **Availability**: All territories

### In-App Purchases (Subscriptions)
Create Auto-Renewable Subscriptions:

| Product ID | Name | Price |
|---|---|---|
| `com.fretmaestro.pro.monthly` | Pro Monthly | $3.99/month |
| `com.fretmaestro.pro.yearly` | Pro Yearly | $29.99/year |
| `com.fretmaestro.premium.monthly` | Premium Monthly | $6.99/month |
| `com.fretmaestro.premium.yearly` | Premium Yearly | $49.99/year |

### Screenshots Needed
- iPhone 6.7" (1290 × 2796) — at least 3
- iPhone 6.5" (1242 × 2688) — at least 3
- iPad Pro 12.9" (2048 × 2732) — at least 3

### App Description (English)
```
FretMaestro — your all-in-one guitar learning companion.

Master the fretboard with interactive tools:
• Scales & Modes — Major, Minor, Pentatonic, Mixolydian, Phrygian, and more
• Chord Library — hundreds of voicings with CAGED shapes
• Arpeggio Trainer — play along with customizable patterns
• Circle of Fifths — visualize key relationships
• Chord Progressions — generate progressions by genre
• Metronome — built-in with adjustable tempo
• Multiple Instruments — acoustic guitar, electric clean/distortion, bass, ukulele, piano

Perfect for beginners and advanced players. Works offline.

Free to start. Pro and Premium subscriptions unlock all features.
```

### App Description (Russian)
```
FretMaestro — ваш универсальный помощник в изучении гитары.

Осваивайте гриф с интерактивными инструментами:
• Гаммы и лады — мажор, минор, пентатоника, миксолидийский, фригийский и другие
• Библиотека аккордов — сотни аппликатур с системой CAGED
• Тренажёр арпеджио — играйте вместе с настраиваемыми паттернами
• Квинтовый круг — визуализация тональностей
• Генератор прогрессий — создавайте последовательности аккордов по жанрам
• Метроном — встроенный с регулируемым темпом
• Разные инструменты — акустическая гитара, чистый/перегруз электро, бас, укулеле, пианино

Подходит для начинающих и продвинутых музыкантов. Работает офлайн.

Бесплатный старт. Подписки Pro и Premium открывают все функции.
```

### Keywords
`guitar,fretboard,chords,scales,CAGED,arpeggio,music theory,learn guitar,tabs,tuner`

---

## 🤖 Google Play Store Setup

### Create App
1. Go to [Google Play Console](https://play.google.com/console)
2. **Create App**
3. Fill in app name: **FretMaestro**

### Store Listing
- Same descriptions as above
- **Category**: Music & Audio → Education
- **Content Rating**: IARC — Everyone

### Pricing
- Free with in-app purchases (same subscription tiers)

---

## 📋 Pre-launch Checklist

- [ ] Run `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`
- [ ] Install CocoaPods
- [ ] Run `npm run build:ios` (builds & syncs)
- [ ] Open Xcode, set Team & signing
- [ ] Test on real iPhone device
- [ ] Archive & upload to App Store Connect via Xcode Organizer
- [ ] Take screenshots on iPhone & iPad
- [ ] Submit for App Review
- [ ] For Android: `npm run build:android`, open Android Studio, generate signed AAB
- [ ] Upload AAB to Google Play Console
