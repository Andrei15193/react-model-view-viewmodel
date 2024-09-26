import React from 'react';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';
import { type IReadOnlyObservableSet, ObservableSet } from '../../collections';
import { useObservableSet } from '../UseObservableSet';

describe('useObservableSet', (): void => {
    interface ITestComponentProps<TItem> {
        readonly observableSet: IReadOnlyObservableSet<TItem> | null | undefined;
    }

    function TestComponent<TITem>({ observableSet }: ITestComponentProps<TITem>): JSX.Element {
        useObservableSet(observableSet);

        return (<>Values: {Array.from(observableSet || []).sort().join(', ')}</>);
    }

    it('component reacts to observable set changes', () => {
        const observableSet = new ObservableSet([1, 2, 3]);

        const { getByText } = render(
            <TestComponent observableSet={observableSet} />
        );
        expect(getByText('Values: 1, 2, 3')).not.toBe(undefined);

        act(() => {
            observableSet.add(4);
        });

        expect(getByText('Values: 1, 2, 3, 4')).not.toBe(undefined);

        act(() => {
            observableSet.delete(2);
        });

        expect(getByText('Values: 1, 3, 4')).not.toBe(undefined);

        act(() => {
            observableSet.clear();
        });

        expect(getByText('Values:')).not.toBe(undefined);
    });

    it('using null observable set works', () => {
        const { getByText } = render(
            <TestComponent observableSet={null} />
        );
        expect(getByText('Values:')).not.toBe(undefined);
    });

    it('using undefined observable set works', () => {
        const { getByText } = render(
            <TestComponent observableSet={undefined} />
        );
        expect(getByText('Values:')).not.toBe(undefined);
    });
});