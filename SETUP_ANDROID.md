# دليل إعداد الإعلانات والمشتريات للأندرويد

## المتطلبات الأساسية
- حساب Google Play Developer (لديك بالفعل)
- حساب Google AdMob

---

## الخطوة 1: إعداد Google AdMob

### 1.1 إنشاء حساب AdMob
1. اذهب إلى [admob.google.com](https://admob.google.com)
2. سجل الدخول بحساب Google الخاص بك
3. أنشئ حساب AdMob جديد

### 1.2 إنشاء تطبيق في AdMob
1. اضغط على "Apps" > "Add App"
2. اختر "Android"
3. أدخل اسم التطبيق: "Flip One"
4. احفظ **App ID** (مثال: `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`)

### 1.3 إنشاء وحدات الإعلانات
أنشئ 3 وحدات إعلانية:

1. **Rewarded Ad** (إعلان المكافآت):
   - اضغط على "Ad units" > "Add ad unit"
   - اختر "Rewarded"
   - أدخل الاسم: "Flip One Rewarded"
   - احفظ **Ad Unit ID**

2. **Interstitial Ad** (إعلان بيني):
   - اختر "Interstitial"
   - أدخل الاسم: "Flip One Interstitial"
   - احفظ **Ad Unit ID**

3. **Banner Ad** (إعلان شريطي):
   - اختر "Banner"
   - أدخل الاسم: "Flip One Banner"
   - احفظ **Ad Unit ID**

### 1.4 تحديث ملف app.json
استبدل القيم في `app.json`:

```json
"android": {
  "config": {
    "googleMobileAdsAppId": "ca-app-pub-YOUR_ADMOB_APP_ID"
  }
}
```

وفي plugins:
```json
[
  "react-native-google-mobile-ads",
  {
    "androidAppId": "ca-app-pub-YOUR_ADMOB_APP_ID"
  }
]
```

### 1.5 تحديث ملف ads.ts
افتح `client/lib/ads.ts` واستبدل معرفات الإعلانات:

```typescript
const AD_UNIT_IDS = {
  REWARDED: "ca-app-pub-YOUR_REWARDED_AD_UNIT_ID",
  INTERSTITIAL: "ca-app-pub-YOUR_INTERSTITIAL_AD_UNIT_ID",
  BANNER: "ca-app-pub-YOUR_BANNER_AD_UNIT_ID",
};
```

---

## الخطوة 2: إعداد المشتريات داخل التطبيق

### 2.1 إنشاء التطبيق في Google Play Console
1. اذهب إلى [play.google.com/console](https://play.google.com/console)
2. اضغط على "Create app"
3. أدخل تفاصيل التطبيق

### 2.2 إنشاء المنتجات
1. اذهب إلى "Monetize" > "Products" > "In-app products"
2. أنشئ المنتجات التالية:

| Product ID | النوع | السعر |
|------------|-------|-------|
| `com.flipone.remove_ads` | One-time | $2.99 |
| `com.flipone.skin.dark_knight` | One-time | $0.99 |
| `com.flipone.skin.web_hero` | One-time | $0.99 |
| `com.flipone.skin.green_giant` | One-time | $0.99 |
| `com.flipone.skin.iron_armor` | One-time | $0.99 |
| `com.flipone.skin.ice_queen` | One-time | $0.99 |
| `com.flipone.skin.kawaii_cat` | One-time | $0.99 |
| `com.flipone.skin.captain_star` | One-time | $0.99 |
| `com.flipone.points.100` | Consumable | $0.99 |
| `com.flipone.points.500` | Consumable | $3.99 |
| `com.flipone.points.1000` | Consumable | $6.99 |

### 2.3 تفعيل المنتجات
- تأكد من تفعيل كل منتج بعد إنشائه

---

## الخطوة 3: إنشاء Development Build

### 3.1 تثبيت EAS CLI
```bash
npm install -g eas-cli
```

### 3.2 تسجيل الدخول
```bash
eas login
```

### 3.3 إنشاء ملف eas.json
أنشئ ملف `eas.json` في جذر المشروع:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### 3.4 إنشاء البناء
```bash
eas build --profile development --platform android
```

### 3.5 تفعيل الإعلانات والمشتريات الحقيقية
بعد إنشاء البناء، افتح الملفات التالية وغيّر `IS_DEVELOPMENT_BUILD` إلى `true`:

- `client/lib/ads.ts`:
```typescript
const IS_DEVELOPMENT_BUILD = true;
```

- `client/lib/purchases.ts`:
```typescript
const IS_DEVELOPMENT_BUILD = true;
```

- `client/components/AdModal.tsx`:
```typescript
const IS_DEVELOPMENT_BUILD = true;
```

---

## الخطوة 4: اختبار التطبيق

### 4.1 اختبار الإعلانات
1. ثبت APK على جهازك
2. استخدم معرفات الاختبار أثناء التطوير (موجودة في `ads.ts`)
3. بعد التأكد من العمل، استبدل بمعرفات الإنتاج

### 4.2 اختبار المشتريات
1. أضف حسابات الاختبار في Google Play Console
2. اذهب إلى "Setup" > "License testing"
3. أضف بريدك الإلكتروني
4. الآن يمكنك الشراء بدون دفع حقيقي

---

## الخطوة 5: النشر على Google Play

### 5.1 إنشاء بناء الإنتاج
```bash
eas build --profile production --platform android
```

### 5.2 رفع البناء
1. نزّل ملف `.aab` من EAS
2. ارفعه إلى Google Play Console
3. أكمل جميع متطلبات النشر

---

## ملاحظات مهمة

1. **معرفات الاختبار**: استخدم المعرفات التجريبية أثناء التطوير لتجنب حظر حسابك

2. **وقت الموافقة**: قد تستغرق موافقة Google على التطبيق 1-3 أيام

3. **سياسة الإعلانات**: تأكد من اتباع سياسات AdMob لتجنب الحظر

4. **المشتريات الوهمية**: لا تحاول الشراء بنفسك في الإنتاج - استخدم حسابات الاختبار فقط

---

## الدعم

إذا واجهت أي مشاكل:
- [AdMob Help Center](https://support.google.com/admob)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Expo Documentation](https://docs.expo.dev)
