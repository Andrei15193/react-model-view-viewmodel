import { ObservableCollection } from '../ObservableCollection';
import { selfResult, testBlankMutatingOperation, testMutatingOperation } from './common';

describe('ObservableCollection.fill', (): void => {
    it('filling an empty collection has no effect', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: collection => collection.fill(10),

            expectedResult: selfResult
        });
    });

    it('filling an entire collection changes all items', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'fill',
            initialState: [1, 2, 3, 4, 5],
            changedProperties: [0, 1, 2, 3, 4],

            applyOperation: collection => collection.fill(10),

            expectedResult: selfResult,
            expectedCollection: [10, 10, 10, 10, 10]
        });
    });

    it('filling a collection from a start index changes all items from that location onwards', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'fill',
            initialState: [1, 2, 3, 4, 5],
            changedProperties: [2, 3, 4],

            applyOperation: collection => collection.fill(10, 2),

            expectedResult: selfResult,
            expectedCollection: [1, 2, 10, 10, 10]
        });
    });

    it('filling a collection from a negative start index changes all items from the normalized location onwards', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'fill',
            initialState: [1, 2, 3, 4, 5],
            changedProperties: [3, 4],

            applyOperation: collection => collection.fill(10, -2),

            expectedResult: selfResult,
            expectedCollection: [1, 2, 3, 10, 10]
        });
    });

    it('filling a collection from a start index equal to collection length has no effect', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5],

            applyOperation: collection => collection.fill(10, 5),

            expectedResult: selfResult
        });
    });

    it('filling a collection from a start index equal to negative collection length fills entire collection', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'fill',
            initialState: [1, 2, 3, 4, 5],
            changedProperties: [0, 1, 2, 3, 4],

            applyOperation: collection => collection.fill(10, -5),

            expectedResult: selfResult,
            expectedCollection: [10, 10, 10, 10, 10]
        });
    });

    it('filling a collection from a start to end index changes all items inside the range', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'fill',
            initialState: [1, 2, 3, 4, 5],
            changedProperties: [1, 2],

            applyOperation: collection => collection.fill(10, 1, 3),

            expectedResult: selfResult,
            expectedCollection: [1, 10, 10, 4, 5]
        });
    });

    it('filling a collection from a start to negative end index changes all items inside the normalized range', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'fill',
            initialState: [1, 2, 3, 4, 5],
            changedProperties: [1, 2, 3],

            applyOperation: collection => collection.fill(10, 1, -1),

            expectedResult: selfResult,
            expectedCollection: [1, 10, 10, 10, 5]
        });
    });

    it('filling a collection where end equal to start has no effect', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5],

            applyOperation: collection => collection.fill(10, 3, 3),

            expectedResult: selfResult
        });
    });

    it('filling a collection where end is before start has no effect', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5],

            applyOperation: collection => collection.fill(10, 3, 2),

            expectedResult: selfResult
        });
    });

    it('filling items while iterating breaks iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1, 2, 3]);

                for (const _ of observableCollection)
                    observableCollection.fill(1);
            })
            .toThrow(new Error('Collection has changed while being iterated.'))
    });

    it('filling items in an empty collection while iterating does not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>();
                const iterator = observableCollection[Symbol.iterator]();

                observableCollection.fill(1);

                iterator.next();
            })
            .not
            .toThrow()
    });

    it('filling items when end index the same as start index while iterating does not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1, 2, 3, 4, 5]);
                const iterator = observableCollection[Symbol.iterator]();

                observableCollection.fill(10, 3, 3);

                iterator.next();
            })
            .not
            .toThrow()
    });

    it('filling items when end index is less than start index while iterating does not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1, 2, 3, 4, 5]);
                const iterator = observableCollection[Symbol.iterator]();

                observableCollection.fill(10, 3, 2);

                iterator.next();
            })
            .not
            .toThrow()
    });
});