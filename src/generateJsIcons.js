/**
 * @flow
 */

/**
 * Remove icons for only one platform
 * @param icons
 * @returns {*}
 */
const filterOnlyOnePlatformIcons = (icons) => {
  return Object.keys(icons).filter((common) => {
    const item = icons[common];
    if (!item.name || !item.android || !item.ios) return false;
    return true;
  }).reduce((all, common) => ({
    ...all,
    [common]: icons[common],
  }), {});
};

/**
 * Find same icons for different platforms (ios and android)
 * @param codepoints
 * @returns {*}
 */
const unifiedPlatformIcons = (codepoints) => {
  return Object.keys(codepoints).reduce((all, name) => {
    const common = name.replace('android', '').replace('ios', '').toLowerCase();
    const isAndroid = name.indexOf('android') > -1;
    const isIos = name.indexOf('ios') > -1;

    if (!isAndroid && !isIos) return all;

    if (!(common in all)) {
      all[common] = {
        name: common,
      };
    }

    if (isAndroid) {
      all[common].android = name;
    }

    if (isIos) {
      all[common].ios = name;
    }

    return all;
  }, {});
};

/**
 * Get template data for js icons templates
 * @param codepoints
 * @returns {{props: {items: Array, nonPlatformItems: *}}}
 */
const getJsTemplateData = (codepoints) => {
  // get name and codepoints
  const items = Object.keys(codepoints).map((name) => ({
    name,
    value: codepoints[name].toString(16),
  }));

  // based on Platform
  const unifiedIcons = unifiedPlatformIcons(codepoints);
  const nonPlatformItems = filterOnlyOnePlatformIcons(unifiedIcons);

  return {
    props: {
      items,
      nonPlatformItems,
    },
  };
};

export default getJsTemplateData;
