import { ObservableCollection } from '../../src/observable-collection';
import { testBlankMutatingOperation, testMutatingOperation } from './common';

describe('ObserableCollection.shift', (): void => {
    it('shifting an item from an empty collection has no effect', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: collection => collection.shift()
        });
    });

    it('shifting an item from a non-empty collection returns the last item', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'shift',
            initialState: [1, 2, 3],
            changedProperties: ['length', 0, 1, 2],

            applyOperation: collection => collection.shift()
        });
    });

    it('shifting items while iterating will break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection)
                    observableCollection.shift();
            })
            .toThrow(new Error('Collection has changed while being iterated.'))
    });

    it('shifting items from empty collection while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>();
                const iterator = observableCollection[Symbol.iterator]();

                observableCollection.shift();

                iterator.next();
            })
            .not
            .toThrow()
    });
});