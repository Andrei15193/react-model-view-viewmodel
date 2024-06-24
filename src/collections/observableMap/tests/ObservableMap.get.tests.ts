import { ObservableMap } from '../ObservableMap';
import { testBlankMutatingOperation } from './common';

describe('ObserableMap.get', (): void => {
    it('looking up items in an empty map returns undefined', (): void => {
        testBlankMutatingOperation<number, string>({
            initialState: [],

            applyOperation: map => map.get(1),

            expectedResult: undefined
        });
    });

    it('looking up item by existing key returns item', (): void => {
        const expectedItem = {};

        testBlankMutatingOperation<number, object>({
            initialState: [
                [1, {}],
                [2, expectedItem],
                [3, {}]
            ],

            applyOperation: map => map.get(2),

            expectedResult: expectedItem
        });
    });

    it('looking up item by non-existing key returns undefined', (): void => {
        testBlankMutatingOperation<number, string>({
            initialState: [
                [1, 'a'],
                [2, 'b'],
                [3, 'c']
            ],

            applyOperation: map => map.get(4),

            expectedResult: undefined
        });
    });

    it('looking up items while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableMap = new ObservableMap<number, string>([
                    [1, 'a'],
                    [2, 'b'],
                    [3, 'c']
                ]);

                let valueToCheck = 2;
                for (const _ of observableMap) {
                    observableMap.get(valueToCheck);
                    valueToCheck++;
                }
            })
            .not
            .toThrow()
    });
});