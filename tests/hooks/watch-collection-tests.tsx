import type { ICollectionChange } from '../../src/events';
import type { IReadOnlyObservableCollection } from '../../src/observable-collection';
import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import './setup';
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

    it('changing the collection updates the component', (): void => {
        const collection = observableCollection<number>();
        const { getByText } = render(<TestComponent collection={collection} />);
        expect(getByText('Length: 0')).not.to.be.undefined;

        collection.push(1);

        expect(getByText('Length: 1')).not.to.be.undefined;
    });

    it('subsequent property changed notifications do not render the component if it has no change', (): void => {
        const collection = observableCollection<number>(1);
        const event = new DispatchEvent<ICollectionChange<number>>();
        (collection as any).colllectionChanged = event;
        let renderCount = 0;
        render(<TestComponent collection={collection} renderCallback={() => renderCount++} />);
        expect(renderCount).is.equal(1);

        event.dispatch(undefined, undefined);
        expect(renderCount).is.equal(1);

        event.dispatch(undefined, undefined);
        expect(renderCount).is.equal(1);
    });
});