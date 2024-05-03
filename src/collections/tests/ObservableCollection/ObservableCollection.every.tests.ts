import { ObservableCollection } from '../../ObservableCollection';
import { testBlankMutatingOperation } from './common';

describe('ObserableCollection.every', (): void => {
    it('checking every element of an empty collection returns true', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyArrayOperation: array => array.every(_ => false),
                applyCollectionOperation: collection => collection.every(_ => false)
            }
        });
    });

    it('checking every element of an collection returns false when not all items satisfy the condition', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyArrayOperation: array => array.every(item => item === 3),
                applyCollectionOperation: collection => collection.every(item => item === 3)
            }
        });
    });

    it('checking every element of an collection returns true when all items satisfy the condition', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyArrayOperation: array => array.every(item => item > 0),
                applyCollectionOperation: collection => collection.every(item => item > 0)
            }
        });
    });

    it('calling every passes arguments to each parameter accordingly', (): void => {
        let invocationCount = 0;
        const observableCollection = new ObservableCollection<number>(1);
        observableCollection.every((item, index, collection) => {
            invocationCount++;

            expect(item).toBe(1);
            expect(index).toBe(0);
            expect(collection).toStrictEqual(observableCollection);

            return true;
        });

        expect(invocationCount).toBe(1);
    });

    it('calling every with context passes it to the callback', (): void => {
        let invocationCount = 0;
        const context = {};
        const observableCollection = new ObservableCollection<number>(1);
        observableCollection.every(
            function (item, index, collection) {
                invocationCount++;

                expect(this).toStrictEqual(context);
                expect(item).toBe(1);
                expect(index).toBe(0);
                expect(collection).toStrictEqual(observableCollection);

                return true;
            },
            context
        );

        expect(invocationCount).toBe(1);
    });

    it('calling every while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection)
                    observableCollection.every(_ => true);
            })
            .not
            .toThrow();
    });
});