import React from 'react';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';
import { type IReadOnlyObservableMap, ObservableMap } from '../../collections';
import { useObservableMap } from '../UseObservableMap';

describe('useObservableMap', (): void => {
    interface ITestComponentProps<TKey, TItem> {
        readonly observableMap: IReadOnlyObservableMap<TKey, TItem>;
    }

    function TestComponent<TKey, TITem>({ observableMap }: ITestComponentProps<TKey, TITem>): JSX.Element {
        useObservableMap(observableMap);

        return (<>Values: {Array.from(observableMap).map(([key, value]) => `${key}: ${value}`).sort().join(', ')}</>);
    }

    it('component reacts to observable map changes', () => {
        const observableMap = new ObservableMap([[1, 'A'], [2, 'B'], [3, 'C']]);

        const { getByText } = render(
            <TestComponent observableMap={observableMap} />
        );
        expect(getByText('Values: 1: A, 2: B, 3: C')).not.toBe(undefined);

        act(() => {
            observableMap.set(4, 'D');
        });
        expect(getByText('Values: 1: A, 2: B, 3: C, 4: D')).not.toBe(undefined);

        act(() => {
            observableMap.set(2, 'E');
        });
        expect(getByText('Values: 1: A, 2: E, 3: C, 4: D')).not.toBe(undefined);

        act(() => {
            observableMap.delete(3);
        });
        expect(getByText('Values: 1: A, 2: E, 4: D')).not.toBe(undefined);

        act(() => {
            observableMap.clear();
        });
        expect(getByText('Values:')).not.toBe(undefined);
    });
});