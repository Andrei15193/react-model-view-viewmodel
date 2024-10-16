import { ObservableCollection } from '../ObservableCollection';
import { testBlankMutatingOperation } from './common';

describe('ObservableCollection.some', (): void => {
    it('checking some elements of an empty collection returns false', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyArrayOperation: array => array.some(_ => true),
                applyCollectionOperation: collection => collection.some(_ => true)
            },

            expectedResult: true
        });
    });

    it('checking some elements of an collection returns true when at least one item satisfies the condition', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyArrayOperation: array => array.some(item => item === 3),
                applyCollectionOperation: collection => collection.some(item => item === 3)
            },

            expectedResult: true
        });
    });

    it('checking some elements of an collection returns false when none of the items satisfy the condition', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyArrayOperation: array => array.some(item => item < 0),
                applyCollectionOperation: collection => collection.some(item => item < 0)
            },

            expectedResult: false
        });
    });

    it('calling some passes arguments to each parameter accordingly', (): void => {
        let invocationCount = 0;
        const observableCollection = new ObservableCollection<number>([1]);
        observableCollection.some((item, index, collection) => {
            invocationCount++;

            expect(item).toBe(1);
            expect(index).toBe(0);
            expect(collection).toStrictEqual(observableCollection);

            return true;
        });

        expect(invocationCount).toBe(1);
    });

    it('calling some with context passes it to the callback', (): void => {
        let invocationCount = 0;
        const context = {};
        const observableCollection = new ObservableCollection<number>([1]);
        observableCollection.some(
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

    it('modifying the collection while executing some throws exception', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1, 2, 3]);
                observableCollection.some(_ => {
                    observableCollection.pop();
                    return true;
                });
            })
            .toThrow(new Error('Collection has changed while being iterated.'));
    });

    it('calling some while iterating does not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1, 2, 3]);

                for (const _ of observableCollection)
                    observableCollection.some(_ => true);
            })
            .not
            .toThrow();
    });
});