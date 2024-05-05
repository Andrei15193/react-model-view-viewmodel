import { ObservableCollection } from '../../ObservableCollection';
import { testBlankMutatingOperation, testMutatingOperation } from './common';

describe('ObserableCollection.length', (): void => {
    it('setting the length to the same value does not raise events', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: collection => {
                collection.length = 3;
            },

            expectedResult: undefined
        });
    });

    it('setting the length to less than actual reduces the collection', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'contract',
            initialState: [1, 2, 3],
            changedProperties: ['length', 1, 2],

            applyOperation: collection => {
                collection.length = 1;
            },

            expectedCollection: [1],
            expectedResult: undefined
        });
    });

    it('setting the length to greater than actual expands the collection', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'expand',
            initialState: [1, 2, 3],
            changedProperties: ['length', 3, 4],

            applyOperation: collection => {
                collection.length = 5;
            },

            expectedCollection: [1, 2, 3, undefined, undefined],
            expectedResult: undefined
        });
    });

    it('changing collection length while iterating will break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection)
                    observableCollection.length = 10;
            })
            .toThrow(new Error('Collection has changed while being iterated.'))
    });

    it('setting collection length to the same value while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection)
                    observableCollection.length = 3;
            })
            .not
            .toThrow()
    });
});