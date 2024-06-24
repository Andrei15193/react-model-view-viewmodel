import { ObservableMap } from '../ObservableMap';
import { testBlankMutatingOperation } from './common';

describe('ObserableMap.has', (): void => {
    it('checking if item is part of empty map returns false', (): void => {
        testBlankMutatingOperation<number, string>({
            initialState: [],

            applyOperation: map => map.has(1),

            expectedResult: false
        });
    });

    it('checking if existing item is part of map returns true', (): void => {
        testBlankMutatingOperation<number, string>({
            initialState: [
                [1, '1'],
                [2, '2'],
                [3, '3']
            ],

            applyOperation: map => map.has(2),

            expectedResult: true
        });
    });

    it('checking if non-existing item is part of map returns false', (): void => {
        testBlankMutatingOperation<number, string>({
            initialState: [
                [1, '1'],
                [2, '2'],
                [3, '3']
            ],

            applyOperation: map => map.has(4),

            expectedResult: false
        });
    });

    it('checking item existence while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableMap = new ObservableMap<number, string>([
                    [1, '1'],
                    [2, '2'],
                    [3, '3']
                ]);

                let valueToCheck = 2;
                for (const _ of observableMap) {
                    observableMap.has(valueToCheck);
                    valueToCheck++;
                }
            })
            .not
            .toThrow()
    });
});