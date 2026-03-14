const { withGradleProperties } = require("@expo/config-plugins");

module.exports = function withCustomGradleProperties(config) {
  return withGradleProperties(config, (config) => {
    const props = config.modResults;

    const set = (key, value) => {
      const existing = props.find((p) => p.type === "property" && p.key === key);
      if (existing) {
        existing.value = value;
      } else {
        props.push({ type: "property", key, value });
      }
    };

    set("org.gradle.warning.mode", "none");
    set("org.gradle.jvmargs", "-Xmx4096m -XX:MaxMetaspaceSize=512m");
    set("android.useAndroidX", "true");
    set("android.enableJetifier", "true");
    set("org.gradle.daemon", "true");
    set("org.gradle.parallel", "true");
    set("org.gradle.caching", "true");
    set("android.cxx.buildRoot", "D:/cxx");

    return config;
  });
};
