const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withAdMob(config, { androidAppId } = {}) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;

    if (!manifest.manifest.$["xmlns:tools"]) {
      manifest.manifest.$["xmlns:tools"] =
        "http://schemas.android.com/tools";
    }

    const application = manifest.manifest.application[0];
    if (!application["meta-data"]) {
      application["meta-data"] = [];
    }

    const setMetaData = (name, value) => {
      const idx = application["meta-data"].findIndex(
        (item) => item.$?.["android:name"] === name
      );
      const entry = {
        $: {
          "android:name": name,
          "android:value": value,
          "tools:replace": "android:value",
        },
      };
      if (idx >= 0) {
        application["meta-data"][idx] = entry;
      } else {
        application["meta-data"].push(entry);
      }
    };

    if (androidAppId) {
      setMetaData(
        "com.google.android.gms.ads.APPLICATION_ID",
        androidAppId
      );
    }

    setMetaData(
      "com.google.android.gms.ads.DELAY_APP_MEASUREMENT_INIT",
      "true"
    );

    return config;
  });
};
