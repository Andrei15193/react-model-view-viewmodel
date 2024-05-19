import { ObservableCollection } from '../ObservableCollection';
import { testBlankMutatingOperation, testMutatingOperation } from './common';

describe('ObserableCollection.unshift', (): void => {
    it('unshifting an item adds it to the collection', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'unshift',
            initialState: [],
            changedProperties: ['length', 0],

            applyOperation: collection => collection.unshift(1),

            expectedCollection: [1],
            expectedResult: 1
        });
    });

    it('unshifting an item to non-empty collection adds them to the collection', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'unshift',
            initialState: [1, 2, 3],
            changedProperties: ['length', 0, 1, 2, 3],

            applyOperation: collection => collection.unshift(4),

            expectedCollection: [4, 1, 2, 3],
            expectedResult: 4
        });
    });

    it('unshifting items adds them to the collection', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'unshift',
            initialState: [],
            changedProperties: ['length', 0, 1, 2],

            applyOperation: collection => collection.unshift(1, 2, 3),

            expectedCollection: [1, 2, 3],
            expectedResult: 3
        });
    });

    it('unshifting items to non-empty collection adds them to the collection', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'unshift',
            initialState: [1, 2, 3],
            changedProperties: ['length', 0, 1, 2, 3, 4, 5],

            applyOperation: collection => collection.unshift(4, 5, 6),

            expectedCollection: [4, 5, 6, 1, 2, 3],
            expectedResult: 6
        });
    });

    it('not unshifting any items to the collection has no effect', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: collection => collection.unshift(),

            expectedResult: 3
        });
    });

    it('not unshifting any items to non-empty collection has no effect', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: collection => collection.unshift(),

            expectedResult: 0
        });
    });

    it('unshifting items while iterating will break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection)
                    observableCollection.unshift(1);
            })
            .toThrow(new Error('Collection has changed while being iterated.'));
    });

    it('not unshifting items while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection)
                    observableCollection.unshift();
            })
            .not
            .toThrow();
    });
});