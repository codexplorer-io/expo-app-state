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
        let eventListener = null;
        if (shouldListen) {
            eventListener = nextAppState => {
                if (isInactive(appState) && isActive(nextAppState)) {
                    setAppState(nextAppState);
                }

                if (!isInactive(appState) && isInactive(nextAppState)) {
                    setAppState(nextAppState);
                }
            };

            AppState.addEventListener(
                'change',
                eventListener
            );

            if (!isInitialized) {
                eventListener('active');
                setIsInitialized(true);
            }
        }

        return () => {
            if (eventListener) {
                eventListener && AppState.removeEventListener(
                    'change',
                    eventListener
                );
                eventListener = null;
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
