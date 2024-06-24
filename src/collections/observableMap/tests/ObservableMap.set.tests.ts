import { ObservableMap } from '../ObservableMap';
import { selfResult, testMutatingOperation } from './common';

describe('ObservableMap.set', (): void => {
    it('setting an item in an empty map adds it', (): void => {
        testMutatingOperation<number, string>({
            mapOperation: 'set',
            initialState: [],
            changedProperties: ['size'],

            applyOperation: map => map.set(1, 'a'),

            expectedMap: [[1, 'a']],
            expectedResult: selfResult
        });
    });

    it('setting an item adds it to the map', (): void => {
        testMutatingOperation<number, string>({
            mapOperation: 'set',
            initialState: [
                [1, 'a'],
                [2, 'b'],
                [3, 'c']
            ],
            changedProperties: ['size'],

            applyOperation: map => map.set(4, 'd'),

            expectedMap: [
                [1, 'a'],
                [2, 'b'],
                [3, 'c'],
                [4, 'd']
            ],
            expectedResult: selfResult
        });
    });

    it('setting an item on existing key replaces the previous item', (): void => {
        testMutatingOperation<number, string>({
            mapOperation: 'set',
            initialState: [
                [1, 'a'],
                [2, 'b'],
                [3, 'c']
            ],
            changedProperties: [],

            applyOperation: map => map.set(2, 'd'),

            expectedMap: [
                [1, 'a'],
                [2, 'd'],
                [3, 'c']
            ],
            expectedResult: selfResult
        });
    });

    it('setting items while iterating will break iterators', (): void => {
        expect(
            () => {
                const observableMap = new ObservableMap<number, string>([
                    [1, 'a'],
                    [2, 'b'],
                    [3, 'c']
                ]);

                for (const _ of observableMap)
                    observableMap.set(4, 'd');
            })
            .toThrow(new Error('Map has changed while being iterated.'));
    });

    it('replacing items while iterating will break iterators', (): void => {
        expect(
            () => {
                const observableMap = new ObservableMap<number, string>([
                    [1, 'a'],
                    [2, 'b'],
                    [3, 'c']
                ]);

                for (const _ of observableMap)
                    observableMap.set(2, 'd');
            })
            .toThrow(new Error('Map has changed while being iterated.'));
    });
});