import { ObservableMap } from '../ObservableMap';
import { testBlankMutatingOperation, testMutatingOperation } from './common';

describe('ObservableMap.delete', (): void => {
    it('deleting an item from an empty map returns false', (): void => {
        testBlankMutatingOperation<number, string>({
            initialState: [],

            applyOperation: map => map.delete(1),

            expectedResult: false
        });
    });

    it('deleting an existing item removes it from the map and returns true', (): void => {
        testMutatingOperation<number, string>({
            mapOperation: 'delete',
            initialState: [
                [1, 'a'],
                [2, 'b'],
                [3, 'c']
            ],
            changedProperties: ['size'],

            applyOperation: map => map.delete(2),

            expectedMap: [
                [1, 'a'],
                [3, 'c']
            ],
            expectedResult: true
        });
    });

    it('deleting an item that does not exist returns false', (): void => {
        testBlankMutatingOperation<number, string>({
            initialState: [
                [1, 'a'],
                [2, 'b'],
                [3, 'c']
            ],

            applyOperation: map => map.delete(4),

            expectedResult: false
        });
    });

    it('deleting items while iterating will break iterators', (): void => {
        expect(
            () => {
                const observableMap = new ObservableMap<number, string>([
                    [1, 'a'],
                    [2, 'b'],
                    [3, 'c']
                ]);

                for (const _ of observableMap)
                    observableMap.delete(2);
            })
            .toThrow(new Error('Map has changed while being iterated.'));
    });

    it('deleting item that does not exist will not break iterators', (): void => {
        expect(
            () => {
                const observableMap = new ObservableMap<number, string>([
                    [1, 'a'],
                    [2, 'b'],
                    [3, 'c']
                ]);

                for (const _ of observableMap)
                    observableMap.delete(4);
            })
            .not
            .toThrow();
    });
});