import '../react-test-setup';
import type { IEvent, ICollectionChange } from '../../src/events';
import type { IReadOnlyObservableCollection } from '../../src/observable-collection';
import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import { watchCollection } from '../../src/hooks/watch-collection';
import { DispatchEvent } from '../../src/events';
import { observableCollection } from '../../src/observable-collection';

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

    class MockObseravableCollection<TItem> extends Array<TItem> implements IReadOnlyObservableCollection<TItem> {
        constructor(...items: readonly TItem[]) {
            super();
            this.push(...items);
            this.collectionChanged = new DispatchEvent<ICollectionChange<TItem>>();
        }

        public collectionChanged: DispatchEvent<ICollectionChange<TItem>>;

        public propertiesChanged: IEvent<readonly string[]>
    }

    it('changing the collection updates the component', (): void => {
        const collection = observableCollection<number>();
        const { getByText } = render(<TestComponent collection={collection} />);
        expect(getByText('Length: 0')).not.to.be.undefined;

        collection.push(1);

        expect(getByText('Length: 1')).not.to.be.undefined;
    });

    it('subsequent property changed notifications do not render the component if it has no change', (): void => {
        const collection = new MockObseravableCollection<number>(1);
        let renderCount = 0;
        render(<TestComponent collection={collection} renderCallback={() => renderCount++} />);
        expect(renderCount).is.equal(1);

        collection.collectionChanged.dispatch(undefined, undefined);
        expect(renderCount).is.equal(1);

        collection.collectionChanged.dispatch(undefined, undefined);
        expect(renderCount).is.equal(1);
    });
});