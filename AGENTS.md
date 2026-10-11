# AGENTS.md — `@codexporer.io/expo-app-state`

## Package Overview
Convenience hook for monitoring React Native `AppState` lifecycle transitions with active subscription gating.

## Key Exports
- `useAppState({ shouldListen })`: Returns `{ isActive, isInactive }`.

## Critical Guidelines for AI Agents
- Always provide the `shouldListen` argument: `useAppState({ shouldListen: true })` or pass a screen focus boolean `useAppState({ shouldListen: isFocused })`.
- Do not add duplicate `AppState.addEventListener` calls in application screens if `useAppState` is available.
- Use `isInactive` to pause ongoing video encoders, audio players, or hardware listeners when users switch away from the app.
