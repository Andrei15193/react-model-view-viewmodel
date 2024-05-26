import { ObservableCollection } from '../ObservableCollection';
import { selfResult, testBlankMutatingOperation, testMutatingOperation } from './common';

describe('ObserableCollection.copyWithin', (): void => {
    it('copying within an empty collection has no effect', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: collection => collection.copyWithin(0, 1),

            expectedResult: selfResult
        });
    });

    it('copying within to the same location has no effect', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5],

            applyOperation: collection => collection.copyWithin(0, 0),

            expectedResult: selfResult
        });
    });

    it('copying within from a start index greater than target copies all items until the end', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'copyWithin',
            initialState: [1, 2, 3, 4, 5, 6, 7],
            changedProperties: [2, 3, 4],

            applyOperation: collection => collection.copyWithin(2, 4),

            expectedResult: selfResult,
            expectedCollection: [1, 2, 5, 6, 7, 6, 7]
        });
    });

    it('copying within from a start index equal to collection length has no effect', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5, 6, 7],

            applyOperation: collection => collection.copyWithin(4, 7),

            expectedResult: selfResult
        });
    });

    it('copying within from a start index to end index copies items in range', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'copyWithin',
            initialState: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            changedProperties: [2, 3],

            applyOperation: collection => collection.copyWithin(2, 4, 6),

            expectedResult: selfResult,
            expectedCollection: [1, 2, 5, 6, 5, 6, 7, 8, 9]
        });
    });

    it('copying within from a start index to negative end index copies items in normalized range', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'copyWithin',
            initialState: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            changedProperties: [2, 3, 4, 5],

            applyOperation: collection => collection.copyWithin(2, 4, -1),

            expectedResult: selfResult,
            expectedCollection: [1, 2, 5, 6, 7, 8, 7, 8, 9]
        });
    });

    it('copying within when start index is equal to end index has no effect', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5],

            applyOperation: collection => collection.copyWithin(4, 2, 2),

            expectedResult: selfResult
        });
    });

    it('copying within when start index is greater than end index has no effect', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5],

            applyOperation: collection => collection.copyWithin(4, 3, 2),

            expectedResult: selfResult
        });
    });

    it('copying within while iterating will break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection)
                    observableCollection.copyWithin(1, 2);
            })
            .toThrow(new Error('Collection has changed while being iterated.'))
    });

    it('copying within of an empty collection while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>();
                const iterator = observableCollection[Symbol.iterator]();

                observableCollection.copyWithin(1, 2);

                iterator.next();
            })
            .not
            .toThrow()
    });

    it('copying within when target index the same as start index while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3, 4, 5);
                const iterator = observableCollection[Symbol.iterator]();

                observableCollection.copyWithin(2, 2);

                iterator.next();
            })
            .not
            .toThrow()
    });

    it('copying within when end index is less than start index while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3, 4, 5);
                const iterator = observableCollection[Symbol.iterator]();

                observableCollection.copyWithin(1, 3, 2);

                iterator.next();
            })
            .not
            .toThrow()
    });
});