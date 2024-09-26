import { ObservableMap } from '../ObservableMap';
import { testBlankMutatingOperation, testMutatingOperation } from './common';

describe('ObservableMap.clear', (): void => {
    it('clearing an empty map has no effect', (): void => {
        testBlankMutatingOperation<number, string>({
            initialState: [],

            applyOperation: map => map.clear(),

            expectedResult: undefined
        });
    });

    it('clearing a map removes all items', (): void => {
        testMutatingOperation<number, string>({
            mapOperation: 'clear',
            initialState: [
                [1, 'a'],
                [2, 'b'],
                [3, 'c']
            ],
            changedProperties: ['size'],

            applyOperation: map => map.clear(),

            expectedMap: [],
            expectedResult: undefined
        });
    });

    it('clearing items while iterating breaks iterators', (): void => {
        expect(
            () => {
                const observableMap = new ObservableMap<number, string>([
                    [1, 'a'],
                    [2, 'b'],
                    [3, 'c']
                ]);

                for (const _ of observableMap)
                    observableMap.clear();
            })
            .toThrow(new Error('Map has changed while being iterated.'));
    });
});