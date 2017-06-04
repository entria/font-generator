# Font-generator

Generate a TTF font to be used on React or React Native projects

It also generates a JavaScript file with named codepoints

## Install

```bash
npm i -g @entria/font-generator
```

## Usage
```bash
font-generator --fontName MyFont --dest outpath --iconsGlob ./icons/**/*.svg
```

## Use like this

```jsx
import React, { PureComponent } from 'react';
import { Text, StyleSheet } from 'react-native';

import MyFontIcons from './MyFont';

class MyFontIcon extends PureComponent {
  setNativeProps(nativeProps) {
    this._root.setNativeProps(nativeProps);
  }

  render() {
    const { style, color, children } = this.props;

    return (
      <Text
        style={[styles.icon, { color }, style]}
        ref={component => this._root = component}
      >
        {children}
      </Text>
    );
  }
}

const styles = StyleSheet.create({
  icon: {
    fontFamily: 'MyFont',
    backgroundColor: 'transparent',
    fontSize: 19,
  },
});

export { MyFontIcons };
export default MyFontIcon;
```


The icons should follow this folder convention:

```
- icons
  - android
     icon1.svg
  - ios
    icon1.svg
```

## Output example

MyFont.android.js
```
const Icons = {
  check: '\uf101',
};

export default Icons;
```

# FontAwesome

Use like this: https://github.com/entria/react-native-fontawesome, but with a custom font
