import { ObservableCollection } from '../../ObservableCollection';
import { testBlankMutatingOperation } from './common';

describe('ObserableCollection.forEach', (): void => {
    it('iterating over an empty collection does not invoke the callback', (): void => {
        let arrayInvocationCount = 0;
        let collectionInvocationCount = 0;

        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: {
                applyArrayOperation: array => array.forEach(_ => arrayInvocationCount++),
                applyCollectionOperation: collection => collection.forEach(_ => collectionInvocationCount++)
            }
        });

        expect(arrayInvocationCount).toBe(0);
        expect(collectionInvocationCount).toBe(0);
    });

    it('iterating over a collection invokes the callback for each item', (): void => {
        const arrayItems: number[] = [];
        const collectionItems: number[] = [];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyArrayOperation: array => array.forEach(item => arrayItems.push(item)),
                applyCollectionOperation: collection => collection.forEach(item => collectionItems.push(item))
            }
        });

        expect(collectionItems).toEqual(arrayItems);
    });

    it('calling forEach passes arguments to each parameter accordingly', (): void => {
        let invocationCount = 0;
        const observableCollection = new ObservableCollection<number>(1);
        observableCollection.forEach((item, index, collection) => {
            invocationCount++;

            expect(item).toBe(1);
            expect(index).toBe(0);
            expect(collection).toStrictEqual(observableCollection);

            return true;
        });

        expect(invocationCount).toBe(1);
    });

    it('calling forEach with context passes it to the callback', (): void => {
        let invocationCount = 0;
        const context = {};
        const observableCollection = new ObservableCollection<number>(1);
        observableCollection.forEach(
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

    it('modifying the collection while executing forEach throws exception', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);
                observableCollection.forEach(_ => {
                    observableCollection.pop();
                });
            })
            .toThrow(new Error('Collection has changed while being iterated.'));
    });

    it('calling forEach while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection)
                    observableCollection.forEach(_ => {});
            })
            .not
            .toThrow();
    });
});