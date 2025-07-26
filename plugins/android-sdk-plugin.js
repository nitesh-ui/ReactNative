const { withGradleProperties } = require('@expo/config-plugins');

const withAndroidSDKVersion = (config) => {
  return withGradleProperties(config, (config) => {
    config.modResults.push({
      type: 'property',
      key: 'android.compileSdkVersion',
      value: '35',
    });
    config.modResults.push({
      type: 'property',
      key: 'android.targetSdkVersion',
      value: '35',
    });
    config.modResults.push({
      type: 'property',
      key: 'android.buildToolsVersion',
      value: '35.0.0',
    });
    return config;
  });
};

module.exports = withAndroidSDKVersion;
