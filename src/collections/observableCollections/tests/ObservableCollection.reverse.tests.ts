import { ObservableCollection } from '../ObservableCollection';
import { selfResult, testBlankReorderingOperation, testReorderingOperation } from './common';

describe('ObservableCollection.reverse', (): void => {
    it('reversing an empty collection has no effect', (): void => {
        testBlankReorderingOperation<number>({
            initialState: [],

            applyOperation: collection => collection.reverse(),

            expectedResult: selfResult
        });
    });

    it('reversing a collection with one item has no effect', (): void => {
        testBlankReorderingOperation<number>({
            initialState: [1],

            applyOperation: collection => collection.reverse(),

            expectedResult: selfResult
        });
    });

    it('reversing a collection with an even number of items inverses the order of the collection', (): void => {
        testReorderingOperation<number>({
            collectionOperation: 'reverse',
            initialState: [1, 2, 3, 4, 5, 6, 7, 8],
            changedProperties: [0, 1, 2, 3, 4, 5, 6, 7],

            applyOperation: collection => collection.reverse(),

            expectedResult: selfResult,
            expectedCollection: [8, 7, 6, 5, 4, 3, 2, 1]
        });
    });

    it('reversing a collection with an odd number of items inverses the order of the collection', (): void => {
        testReorderingOperation<number>({
            collectionOperation: 'reverse',
            initialState: [1, 2, 3, 4, 5],
            changedProperties: [0, 1, 3, 4],

            applyOperation: collection => collection.reverse(),

            expectedResult: selfResult,
            expectedCollection: [5, 4, 3, 2, 1]
        });
    });

    it('reversing items while iterating will break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1, 2]);

                for (const _ of observableCollection)
                    observableCollection.reverse();
            })
            .toThrow(new Error('Collection has changed while being iterated.'))
    });

    it('reversing an empty collection while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>();
                const iterator = observableCollection[Symbol.iterator]();

                observableCollection.reverse();

                iterator.next();
            })
            .not
            .toThrow()
    });

    it('reversing a collection with one item while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1]);
                const iterator = observableCollection[Symbol.iterator]();

                observableCollection.reverse();

                iterator.next();
            })
            .not
            .toThrow()
    });
});