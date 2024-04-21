import { IReadOnlyObservableCollection } from '../../src/observable-collection';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';
import { watchCollection } from '../../src/hooks/use-observable-collection';
import { EventDispatcher } from '../../src/events';
import { ObservableCollection } from '../../src/observable-collection';

describe('watch-collection/watchCollection', (): void => {
    interface ITestComponentProps {
        readonly collection: IReadOnlyObservableCollection<number>;

        renderCallback?(): void;
    }

    function TestComponent({ collection, renderCallback }: ITestComponentProps): JSX.Element {
        watchCollection(collection);

        renderCallback && renderCallback();

        return (
            <>Length: {collection.length}</>
        );
    }

    class MockObseravableCollection<TItem> extends ObservableCollection<TItem> {
        constructor(...items: readonly TItem[]) {
            super();
            this.push(...items);
            this.collectionChanged = new EventDispatcher<unknown, unknown>();
        }

        public collectionChanged: EventDispatcher<unknown, unknown>;
    }

    it('changing the collection updates the component', (): void => {
        const collection = new ObservableCollection<number>();
        const { getByText } = render(<TestComponent collection={collection} />);
        expect(getByText('Length: 0')).not.toBe(undefined);

        act(() => {
            collection.push(1);
        });

        expect(getByText('Length: 1')).not.toBe(undefined);
    });

    it('subsequent property changed notifications do not render the component if it has no change', (): void => {
        const collection = new MockObseravableCollection<number>(1);
        let renderCount = 0;
        render(<TestComponent collection={collection} renderCallback={() => renderCount++} />);
        expect(renderCount).toBe(1);

        act(() => {
            collection.collectionChanged.dispatch(undefined, undefined);
        });
        expect(renderCount).toBe(1);

        act(() => {
            collection.collectionChanged.dispatch(undefined, undefined);
        });
        expect(renderCount).toBe(1);
    });
});