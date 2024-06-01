import { ObservableCollection } from '../ObservableCollection';
import { testBlankMutatingOperation } from './common';

describe('ObserableCollection.map', (): void => {
    it('mapping an empty collection returns an empty array', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: {
                applyArrayOperation: array => array.map(item => item),
                applyCollectionOperation: collection => collection.map(item => item)
            },

            expectedResult: []
        });
    });

    it('mapping a collection returns an array containing the result', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyArrayOperation: array => array.map(item => item + 10),
                applyCollectionOperation: collection => collection.map(item => item + 10)
            },

            expectedResult: [11, 12, 13]
        });
    });

    it('calling map passes arguments to each parameter accordingly', (): void => {
        let invocationCount = 0;
        const observableCollection = new ObservableCollection<number>([1]);
        observableCollection.map((item, index, collection) => {
            invocationCount++;

            expect(item).toBe(1);
            expect(index).toBe(0);
            expect(collection).toStrictEqual(observableCollection);

            return item;
        });

        expect(invocationCount).toBe(1);
    });

    it('calling map with context passes it to the callback', (): void => {
        let invocationCount = 0;
        const context = {};
        const observableCollection = new ObservableCollection<number>([1]);
        observableCollection.map(
            function (item, index, collection) {
                invocationCount++;

                expect(this).toStrictEqual(context);
                expect(item).toBe(1);
                expect(index).toBe(0);
                expect(collection).toStrictEqual(observableCollection);

                return item;
            },
            context
        );

        expect(invocationCount).toBe(1);
    });

    it('modifying the collection while executing map throws exception', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1, 2, 3]);
                observableCollection.map(_ => {
                    observableCollection.pop();
                });
            })
            .toThrow(new Error('Collection has changed while being iterated.'));
    });

    it('calling map while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1, 2, 3]);

                for (const _ of observableCollection)
                    observableCollection.map(item => item);
            })
            .not
            .toThrow();
    });
});