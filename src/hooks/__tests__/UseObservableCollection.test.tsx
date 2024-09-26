import React from 'react';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';
import { type IReadOnlyObservableCollection, ObservableCollection } from '../../collections';
import { useObservableCollection } from '../UseObservableCollection';

describe('useObservableCollection', (): void => {
    interface ITestComponentProps<TItem> {
        readonly observableCollection: IReadOnlyObservableCollection<TItem> | null | undefined;
    }

    function TestComponent<TITem>({ observableCollection }: ITestComponentProps<TITem>): JSX.Element {
        useObservableCollection(observableCollection);

        return (<>Values: {observableCollection?.join(', ') || ''}</>);
    }

    it('component reacts to observable collection changes', () => {
        const observableCollection = new ObservableCollection([1, 2, 3]);

        const { getByText } = render(
            <TestComponent observableCollection={observableCollection} />
        );
        expect(getByText('Values: 1, 2, 3')).not.toBe(undefined);

        act(() => {
            observableCollection.push(4);
        });

        expect(getByText('Values: 1, 2, 3, 4')).not.toBe(undefined);

        act(() => {
            observableCollection.reverse();
        });

        expect(getByText('Values: 4, 3, 2, 1')).not.toBe(undefined);

        act(() => {
            observableCollection.splice(0, Number.POSITIVE_INFINITY);
        });

        expect(getByText('Values:')).not.toBe(undefined);
    });

    it('using null observable collection works', () => {
        const { getByText } = render(
            <TestComponent observableCollection={null} />
        );
        expect(getByText('Values:')).not.toBe(undefined);
    });

    it('using undefined observable collection works', () => {
        const { getByText } = render(
            <TestComponent observableCollection={undefined} />
        );
        expect(getByText('Values:')).not.toBe(undefined);
    });
});