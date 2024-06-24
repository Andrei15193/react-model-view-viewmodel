import { ObservableMap } from '../ObservableMap';
import { testBlankMutatingOperation } from './common';

describe('ObservableMap.forEach', (): void => {
    it('iterating over an empty map does not invoke the callback', (): void => {
        let mapInvocationCount = 0;
        let observableMapInvocationCount = 0;

        testBlankMutatingOperation<string, number>({
            initialState: [],

            applyOperation: {
                applyMapOperation: map => map.forEach(_ => mapInvocationCount++),
                applyObservableMapOperation: observableMap => observableMap.forEach(_ => observableMapInvocationCount++)
            },

            expectedResult: undefined
        });

        expect(mapInvocationCount).toBe(0);
        expect(observableMapInvocationCount).toBe(0);
    });

    it('iterating over a map invokes the callback for each item', (): void => {
        const mapItems: (readonly [string, number])[] = [];
        const observableMapItems: (readonly [string, number])[] = [];

        testBlankMutatingOperation<string, number>({
            initialState: [
                ['a', 1],
                ['b', 2],
                ['c', 3]
            ],

            applyOperation: {
                applyMapOperation: map => map.forEach((item, key) => mapItems.push([key, item])),
                applyObservableMapOperation: observableMap => observableMap.forEach((item, key) => observableMapItems.push([key, item]))
            },

            expectedResult: undefined
        });

        expect(observableMapItems).toEqual(mapItems);
    });

    it('calling forEach passes arguments to each parameter accordingly', (): void => {
        let invocationCount = 0;
        const observableMap = new ObservableMap<number, string>([
            [1, 'a']
        ]);
        observableMap.forEach((item, key, map) => {
            invocationCount++;

            expect(key).toBe(1);
            expect(item).toBe('a');
            expect(map).toStrictEqual(observableMap);

            return true;
        });

        expect(invocationCount).toBe(1);
    });

    it('calling forEach with context passes it to the callback', (): void => {
        let invocationCount = 0;
        const context = {};
        const observableMap = new ObservableMap<number, string>([
            [1, 'a']
        ]);
        observableMap.forEach(
            function (item, key, map) {
                invocationCount++;

                expect(this).toStrictEqual(context);
                expect(key).toBe(1);
                expect(item).toBe('a');
                expect(map).toStrictEqual(observableMap);

                return true;
            },
            context
        );

        expect(invocationCount).toBe(1);
    });

    it('modifying the map while executing forEach throws exception', (): void => {
        expect(
            () => {
                const observableMap = new ObservableMap<number, string>([
                    [1, 'a'],
                    [2, 'b'],
                    [3, 'c']
                ]);
                observableMap.forEach(_ => {
                    observableMap.clear();
                });
            })
            .toThrow(new Error('Map has changed while being iterated.'));
    });

    it('calling forEach while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableMap = new ObservableMap<number, string>([
                    [1, 'a'],
                    [2, 'b'],
                    [3, 'c']
                ]);

                for (const _ of observableMap)
                    observableMap.forEach(_ => { });
            })
            .not
            .toThrow();
    });
});