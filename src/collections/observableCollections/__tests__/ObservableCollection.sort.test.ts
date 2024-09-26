import { ObservableCollection } from '../ObservableCollection';
import { selfResult, testBlankReorderingOperation, testReorderingOperation } from './common';

describe('ObservableCollection.sort', (): void => {
    it('sorting an empty collection has no effect', (): void => {
        testBlankReorderingOperation<number>({
            initialState: [],

            applyOperation: collection => collection.sort(),

            expectedResult: selfResult
        });
    });

    it('sorting a collection with one item has no effect', (): void => {
        testBlankReorderingOperation<number>({
            initialState: [1],

            applyOperation: collection => collection.sort(),

            expectedResult: selfResult
        });
    });

    it('sorting a collection reorders the items using default sort comparison', (): void => {
        testReorderingOperation<number | null | undefined>({
            collectionOperation: 'sort',
            initialState: [1, undefined, 2, 3, -1, undefined, 3, 100, null, 22, 11, 200, -100],
            changedProperties: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],

            applyOperation: collection => collection.sort(),

            expectedResult: selfResult,
            expectedCollection: [-1, -100, 1, 100, 11, 2, 200, 22, 3, 3, null, undefined, undefined]
        });
    });

    it('sorting a collection reorders the items using provided sort comparison', (): void => {
        testReorderingOperation<number | undefined>({
            collectionOperation: 'sort',
            initialState: [1, undefined, 2, 3],
            changedProperties: [1, 2, 3],

            applyOperation: {
                applyArrayOperation: collection => collection.sort((left, right) => left! - right!),
                applyCollectionOperation: collection => collection.sort((left, right) => left - right)
            },

            expectedResult: selfResult,
            expectedCollection: [1, 2, 3, undefined]
        });
    });

    it('sorting notifies only about changed indexes', (): void => {
        testReorderingOperation<number>({
            collectionOperation: 'sort',
            initialState: [1, 4, 3, 2, 5],
            changedProperties: [1, 3],

            applyOperation: collection => collection.sort(),

            expectedResult: selfResult,
            expectedCollection: [1, 2, 3, 4, 5]
        });
    });

    it('mutating the collection while sorting items breaks the operation', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1, 2]);
                observableCollection.sort(() => {
                    observableCollection.pop();
                    return 0;
                });
            })
            .toThrow(new Error('Collection has changed while being iterated.'))
    });

    it('sorting sorted items while iterating does not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1, 2]);

                for (const _ of observableCollection)
                    observableCollection.sort();
            })
            .not
            .toThrow()
    });

    it('sorting unsorted items while iterating breaks iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([2, 1]);

                for (const _ of observableCollection)
                    observableCollection.sort();
            })
            .toThrow(new Error('Collection has changed while being iterated.'))
    });

    it('sorting an empty collection while iterating does not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>();
                const iterator = observableCollection[Symbol.iterator]();

                observableCollection.sort();

                iterator.next();
            })
            .not
            .toThrow()
    });

    it('sorting a collection with one item while iterating does not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1]);
                const iterator = observableCollection[Symbol.iterator]();

                observableCollection.sort();

                iterator.next();
            })
            .not
            .toThrow()
    });
});