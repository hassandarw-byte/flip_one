const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withAdMob(config, { androidAppId } = {}) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;
    const application = manifest.manifest.application[0];

    if (!application["meta-data"]) {
      application["meta-data"] = [];
    }

    const existing = application["meta-data"].find(
      (item) =>
        item.$?.["android:name"] === "com.google.android.gms.ads.APPLICATION_ID"
    );

    if (!existing && androidAppId) {
      application["meta-data"].push({
        $: {
          "android:name": "com.google.android.gms.ads.APPLICATION_ID",
          "android:value": androidAppId,
        },
      });
    }

    const delayMeasurement = application["meta-data"].find(
      (item) =>
        item.$?.["android:name"] ===
        "com.google.android.gms.ads.DELAY_APP_MEASUREMENT_INIT"
    );

    if (!delayMeasurement) {
      application["meta-data"].push({
        $: {
          "android:name":
            "com.google.android.gms.ads.DELAY_APP_MEASUREMENT_INIT",
          "android:value": "true",
        },
      });
    }

    return config;
  });
};
