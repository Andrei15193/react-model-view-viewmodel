import { ObservableCollection } from '../ObservableCollection';
import { testBlankMutatingOperation, testMutatingOperation } from './common';

describe('ObserableCollection.push', (): void => {
    it('pushing an item adds it to the collection', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'push',
            initialState: [],
            changedProperties: ['length', 0],

            applyOperation: collection => collection.push(1),

            expectedCollection: [1],
            expectedResult: 1
        });
    });

    it('pushing an item to non-empty collection adds them to the collection', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'push',
            initialState: [1, 2, 3],
            changedProperties: ['length', 3],

            applyOperation: collection => collection.push(4),

            expectedCollection: [1, 2, 3, 4],
            expectedResult: 4
        });
    });

    it('pushing items adds them to the collection', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'push',
            initialState: [],
            changedProperties: ['length', 0, 1, 2],

            applyOperation: collection => collection.push(1, 2, 3),

            expectedCollection: [1, 2, 3],
            expectedResult: 3
        });
    });

    it('pushing items to non-empty collection adds them to the collection', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'push',
            initialState: [1, 2, 3],
            changedProperties: ['length', 3, 4, 5],

            applyOperation: collection => collection.push(4, 5, 6),

            expectedCollection: [1, 2, 3, 4, 5, 6],
            expectedResult: 6
        });
    });

    it('not pushing any items to the collection has no effect', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: collection => collection.push(),

            expectedResult: 3
        });
    });

    it('not pushing any items to empty collection has no effect', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: collection => collection.push(),

            expectedResult: 0
        });
    });

    it('pushing items while iterating will break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection)
                    observableCollection.push(1);
            })
            .toThrow(new Error('Collection has changed while being iterated.'))
    });

    it('not pushing items while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection)
                    observableCollection.push();
            })
            .not
            .toThrow()
    });
});