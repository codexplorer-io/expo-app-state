# `@codexporer.io/expo-app-state`

Simplified foreground/background lifecycle hook for React Native and Expo applications with controlled event subscription gating.

## Installation & Peer Dependencies

```bash
yarn add @codexporer.io/expo-app-state
```

Peer dependencies:
- `react` (`*`)
- `react-native` (`*`)

## Quick Start

```tsx
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useAppState } from '@codexporer.io/expo-app-state';

export function MediaAutoPause() {
  const { isActive, isInactive } = useAppState({ shouldListen: true });

  useEffect(() => {
    if (isInactive) {
      console.log('App sent to background - pausing video playback & syncing state');
      pausePlayer();
    } else if (isActive) {
      console.log('App returned to foreground - resuming session');
      refreshSession();
    }
  }, [isActive, isInactive]);

  return (
    <View>
      <Text>Status: {isActive ? 'Foreground' : 'Background'}</Text>
    </View>
  );
}
```

## API Reference

### `useAppState(options: { shouldListen: boolean }): { isActive: boolean; isInactive: boolean }`

A React hook monitoring foreground/background state changes via React Native's `AppState`.

#### Options

| Option | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `shouldListen` | `boolean` | Yes | Controls whether the underlying `AppState.addEventListener` subscription is active. Set to `false` to avoid unnecessary listeners when screen is unmounted or blurred. |

#### Return Value

| Property | Type | Description |
| :--- | :--- | :--- |
| `isActive` | `boolean` | `true` when the application is in the active foreground state |
| `isInactive` | `boolean` | `true` when the application is backgrounded or in an inactive/transition state |

## Guidelines

1. **Conditional Subscription**: Pass `shouldListen: isScreenFocused` or similar condition so offscreen screens do not create redundant listeners.
2. **Memoized Result**: The hook internally memoizes `{ isActive, isInactive }` so it only triggers component re-renders when the state actually flips.

## License

MIT
