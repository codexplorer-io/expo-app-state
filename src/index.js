import { useState, useEffect, useMemo } from 'react';
import { AppState } from 'react-native';
import { di } from 'react-magnetic-di';

const isActive = appState => appState === 'active';
const isInactive = appState => !!appState.match(/inactive|background/);

export const useAppState = ({ shouldListen }) => {
    di(useEffect, useMemo, useState);

    const [appState, setAppState] = useState('inactive');
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        let handler = null;
        if (shouldListen) {
            const listener = nextAppState => {
                if (isInactive(appState) && isActive(nextAppState)) {
                    setAppState(nextAppState);
                }

                if (!isInactive(appState) && isInactive(nextAppState)) {
                    setAppState(nextAppState);
                }
            };

            handler = AppState.addEventListener(
                'change',
                listener
            );

            if (!isInitialized) {
                listener('active');
                setIsInitialized(true);
            }
        }

        return () => {
            if (handler) {
                handler && handler.remove();
                handler = null;
            }
        };
    }, [
        shouldListen,
        isInitialized,
        setIsInitialized,
        appState,
        setAppState
    ]);

    const isAppActive = isActive(appState);
    const isAppInactive = isInactive(appState);
    return useMemo(() => ({
        isActive: isAppActive,
        isInactive: isAppInactive
    }), [
        isAppActive,
        isAppInactive
    ]);
};
