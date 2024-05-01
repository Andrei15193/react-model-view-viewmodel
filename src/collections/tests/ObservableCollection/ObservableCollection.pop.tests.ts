import { ObservableCollection } from '../../ObservableCollection';
import { testBlankMutatingOperation, testMutatingOperation } from './common';

describe('ObserableCollection.pop', (): void => {
    it('poping an item from an empty collection has no effect', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: collection => collection.pop()
        });
    });

    it('poping an item from a non-empty collection returns the last item', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'pop',
            initialState: [1, 2, 3],
            changedProperties: ['length', 2],

            applyOperation: collection => collection.pop()
        });
    });

    it('popping items while iterating will break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection)
                    observableCollection.pop();
            })
            .toThrow(new Error('Collection has changed while being iterated.'))
    });

    it('popping items from empty collection while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>();
                const iterator = observableCollection[Symbol.iterator]();

                observableCollection.pop();

                iterator.next();
            })
            .not
            .toThrow()
    });
});