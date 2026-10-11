---
name: expo-app-state
description: Instructions and guidelines for using @codexporer.io/expo-app-state (Expo App State) in React Native and Expo applications.
---

# `@codexporer.io/expo-app-state` Skill

## Overview
`@codexporer.io/expo-app-state` provides an `AppState` listener hook with declarative subscription control to pause/resume background tasks cleanly.

---

## When to Use
- Pausing audio or video playback when users leave the app.
- Pausing camera preview or hardware sensors on backgrounding.
- Re-fetching remote resources or refreshing active subscriptions on foreground return.

---

## Usage Example

```tsx
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useAppState } from '@codexporer.io/expo-app-state';
import { useIsFocused } from '@codexporer.io/expo-navigation-bridge';

export function PlayerScreen() {
  const isFocused = useIsFocused();
  const { isActive, isInactive } = useAppState({ shouldListen: isFocused });

  useEffect(() => {
    if (isInactive) {
      pausePlayback();
    } else if (isActive) {
      resumePlayback();
    }
  }, [isActive, isInactive]);

  return <View><Text>App State: {isActive ? 'Foreground' : 'Background'}</Text></View>;
}
```

---

## API Reference

### `useAppState({ shouldListen: boolean })`

| Option | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `shouldListen` | `boolean` | Yes | Controls whether the change listener is subscribed |

#### Returns
| Field | Type | Description |
| :--- | :--- | :--- |
| `isActive` | `boolean` | `true` when app is active in foreground |
| `isInactive` | `boolean` | `true` when app is in background or inactive |

---

## Critical Rules & Guidelines
1. **Pass `shouldListen`**: Always provide a boolean expression for `shouldListen`.
2. **Combine with Navigation**: Couple `shouldListen` with `isFocused` so inactive tabs do not run background/foreground listeners unnecessarily.
