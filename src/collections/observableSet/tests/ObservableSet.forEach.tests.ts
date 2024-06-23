import { ObservableSet } from '../ObservableSet';
import { testBlankMutatingOperation } from './common';

describe('ObserableSet.forEach', (): void => {
    it('iterating over an empty set does not invoke the callback', (): void => {
        let setInvocationCount = 0;
        let observableSetInvocationCount = 0;

        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: {
                applySetOperation: set => set.forEach(_ => setInvocationCount++),
                applyObservableSetOperation: observableSet => observableSet.forEach(_ => observableSetInvocationCount++)
            },

            expectedResult: undefined
        });

        expect(setInvocationCount).toBe(0);
        expect(observableSetInvocationCount).toBe(0);
    });

    it('iterating over a set invokes the callback for each item', (): void => {
        const setItems: number[] = [];
        const observableSetItems: number[] = [];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applySetOperation: set => set.forEach(item => setItems.push(item)),
                applyObservableSetOperation: observableSet => observableSet.forEach(item => observableSetItems.push(item))
            },

            expectedResult: undefined
        });

        expect(observableSetItems).toEqual(setItems);
    });

    it('calling forEach passes arguments to each parameter accordingly', (): void => {
        let invocationCount = 0;
        const observableSet = new ObservableSet<number>([1]);
        observableSet.forEach((item, key, set) => {
            invocationCount++;

            expect(item).toBe(1);
            expect(key).toBe(item);
            expect(set).toStrictEqual(observableSet);

            return true;
        });

        expect(invocationCount).toBe(1);
    });

    it('calling forEach with context passes it to the callback', (): void => {
        let invocationCount = 0;
        const context = {};
        const observableSet = new ObservableSet<number>([1]);
        observableSet.forEach(
            function (item, key, set) {
                invocationCount++;

                expect(this).toStrictEqual(context);
                expect(item).toBe(1);
                expect(key).toBe(item);
                expect(set).toStrictEqual(observableSet);

                return true;
            },
            context
        );

        expect(invocationCount).toBe(1);
    });

    it('modifying the set while executing forEach throws exception', (): void => {
        expect(
            () => {
                const observableSet = new ObservableSet<number>([1, 2, 3]);
                observableSet.forEach(_ => {
                    observableSet.clear();
                });
            })
            .toThrow(new Error('Set has changed while being iterated.'));
    });

    it('calling forEach while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableSet = new ObservableSet<number>([1, 2, 3]);

                for (const _ of observableSet)
                    observableSet.forEach(_ => {});
            })
            .not
            .toThrow();
    });
});