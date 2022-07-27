import React, { useState, useEffect, useMemo } from 'react';
import { AppState } from 'react-native';
import { injectable } from 'react-magnetic-di';
import assign from 'lodash/assign';
import { mountWithDi } from '@codexporer.io/react-test-utils';
import { useAppState } from './index';

jest.mock('react-native/Libraries/AppState/AppState', () => ({
    addEventListener: jest.fn()
}));

const removeEventListener = jest.fn();
AppState.addEventListener.mockReturnValue({ remove: removeEventListener });

describe('useAppState', () => {
    const createHookRenderer = ({ result, shouldListen }) => () => {
        const appState = useAppState({ shouldListen });
        assign(result, appState);
        return null;
    };

    const setAppState = jest.fn();
    const setIsInitialized = jest.fn();
    const createMockUseState = ({
        appState = 'inactive',
        isInitialized = false
    }) => {
        let callCount = 0;
        return jest.fn().mockImplementation(() => {
            callCount += 1;
            return callCount === 1 ?
                [
                    appState,
                    setAppState
                ] :
                [
                    isInitialized,
                    setIsInitialized
                ];
        });
    };

    const defaultDeps = [
        injectable(useEffect, fn => fn()),
        injectable(useMemo, fn => fn())
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('when shouldListen is false', () => {
        it('should return expected state', () => {
            const result = {};
            const Renderer = createHookRenderer({
                result,
                shouldListen: false
            });

            mountWithDi(<Renderer />, {
                deps: [
                    ...defaultDeps,
                    injectable(useState, createMockUseState({}))
                ]
            });

            expect(result.isActive).toBe(false);
            expect(result.isInactive).toBe(true);
        });

        it('should not listen for app state changes', () => {
            const result = {};
            const Renderer = createHookRenderer({
                result,
                shouldListen: false
            });
            let useEffectResult = null;
            const mockUseEffect = fn => {
                useEffectResult = fn();
            };

            mountWithDi(<Renderer />, {
                deps: [
                    ...defaultDeps,
                    injectable(useEffect, mockUseEffect),
                    injectable(useState, createMockUseState({}))
                ]
            });

            expect(AppState.addEventListener).not.toHaveBeenCalled();
            expect(setAppState).not.toHaveBeenCalled();
            expect(setIsInitialized).not.toHaveBeenCalled();

            useEffectResult();

            expect(removeEventListener).not.toHaveBeenCalled();
        });
    });

    describe('when shouldListen is true', () => {
        it('should return inactive state when initial', () => {
            const result = {};
            const Renderer = createHookRenderer({
                result,
                shouldListen: true
            });

            mountWithDi(<Renderer />, {
                deps: [
                    ...defaultDeps,
                    injectable(useState, createMockUseState({}))
                ]
            });

            expect(result.isActive).toBe(false);
            expect(result.isInactive).toBe(true);
        });

        it('should return active state when active', () => {
            const result = {};
            const Renderer = createHookRenderer({
                result,
                shouldListen: true
            });

            mountWithDi(<Renderer />, {
                deps: [
                    ...defaultDeps,
                    injectable(useState, createMockUseState({ isInitialized: true, appState: 'active' }))
                ]
            });

            expect(result.isActive).toBe(true);
            expect(result.isInactive).toBe(false);
        });

        it('should listen for app state changes', () => {
            const Renderer = createHookRenderer({
                result: {},
                shouldListen: true
            });
            let useEffectResult = null;
            const mockUseEffect = fn => {
                useEffectResult = fn();
            };

            mountWithDi(<Renderer />, {
                deps: [
                    ...defaultDeps,
                    injectable(useEffect, mockUseEffect),
                    injectable(useState, createMockUseState({}))
                ]
            });

            expect(AppState.addEventListener).toHaveBeenCalledTimes(1);
            expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
            expect(removeEventListener).not.toHaveBeenCalled();
            expect(setAppState).toHaveBeenCalledTimes(1);
            expect(setAppState).toHaveBeenCalledWith('active');
            expect(setIsInitialized).toHaveBeenCalledTimes(1);
            expect(setIsInitialized).toHaveBeenCalledWith(true);

            useEffectResult();

            // should call listener removal
            expect(removeEventListener).toHaveBeenCalledTimes(1);

            useEffectResult();

            // once removed, should not recall listener removal
            expect(removeEventListener).toHaveBeenCalledTimes(1);
        });

        describe('AppStateListener', () => {
            let useEffectResult = null;

            const getListener = ({ appState }) => {
                const Renderer = createHookRenderer({
                    result: {},
                    shouldListen: true
                });
                const mockUseEffect = fn => {
                    useEffectResult = fn();
                };

                mountWithDi(<Renderer />, {
                    deps: [
                        ...defaultDeps,
                        injectable(useEffect, mockUseEffect),
                        injectable(useState, createMockUseState({ appState }))
                    ]
                });

                const listener = AppState.addEventListener.mock.calls[0][1];

                jest.clearAllMocks();

                return listener;
            };

            it('should be removed', () => {
                getListener({});

                useEffectResult();

                expect(removeEventListener).toHaveBeenCalledTimes(1);
            });

            it('should not be removed', () => {
                getListener({});

                expect(removeEventListener).not.toHaveBeenCalled();
            });

            it('should set active state if current state is inactive', () => {
                const listener = getListener({ appState: 'inactive' });

                listener('active');

                expect(setAppState).toHaveBeenCalledTimes(1);
                expect(setAppState).toHaveBeenCalledWith('active');
            });

            it('should set active state if current state is background', () => {
                const listener = getListener({ appState: 'background' });

                listener('active');

                expect(setAppState).toHaveBeenCalledTimes(1);
                expect(setAppState).toHaveBeenCalledWith('active');
            });

            it('should not set active state if current state is active', () => {
                const listener = getListener({ appState: 'active' });

                listener('active');

                expect(setAppState).not.toHaveBeenCalled();
            });

            it('should set inactive state if current state is active', () => {
                const listener = getListener({ appState: 'active' });

                listener('inactive');

                expect(setAppState).toHaveBeenCalledTimes(1);
                expect(setAppState).toHaveBeenCalledWith('inactive');
            });

            it('should not set inactive state if current state is inactive', () => {
                const listener = getListener({ appState: 'inactive' });

                listener('inactive');

                expect(setAppState).not.toHaveBeenCalled();
            });

            it('should not set inactive state if current state is background', () => {
                const listener = getListener({ appState: 'background' });

                listener('inactive');

                expect(setAppState).not.toHaveBeenCalled();
            });
        });
    });
});
