import { ObservableCollection } from '../../ObservableCollection';
import { testBlankMutatingOperation } from './common';

describe('ObserableCollection.join', (): void => {
    it('joining an empty collection returns an empty string', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: collection => collection.join(),

            expectedResult: ''
        });
    });

    it('joining an empty collection with separator returns an empty string', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: collection => collection.join('-'),

            expectedResult: ''
        });
    });

    it('joining a collection returns a string containing the string representations of each element in one string separated by comma', (): void => {
        testBlankMutatingOperation<unknown>({
            initialState: [null, undefined, 1, 'A', { prop: 'value' }, new Date('2024-05-05'), ObservableCollection],

            applyOperation: collection => collection.join(),

            expectedResult: `,,1,A,[object Object],${new Date('2024-05-05').toString()},${ObservableCollection.toString()}`
        });
    });

    it('joining a collection with separator returns a string containing the string representations of each element in one string separated by the separator', (): void => {
        testBlankMutatingOperation<unknown>({
            initialState: [null, undefined, 1, 'A', { prop: 'value' }, new Date('2024-05-05'), ObservableCollection],

            applyOperation: collection => collection.join('-'),

            expectedResult: `--1-A-[object Object]-${new Date('2024-05-05').toString()}-${ObservableCollection.toString()}`
        });
    });

    it('joining a collection with undefined separator returns a string containing the string representations of each element in one string separated by comma', (): void => {
        testBlankMutatingOperation<unknown>({
            initialState: [null, undefined, 1, 'A', { prop: 'value' }, new Date('2024-05-05'), ObservableCollection],

            applyOperation: collection => collection.join(undefined),

            expectedResult: `,,1,A,[object Object],${new Date('2024-05-05').toString()},${ObservableCollection.toString()}`
        });
    });

    it('joining a collection with null separator returns a string containing the string representations of each element in one string', (): void => {
        testBlankMutatingOperation<unknown>({
            initialState: [null, undefined, 1, 'A', { prop: 'value' }, new Date('2024-05-05'), ObservableCollection],

            applyOperation: collection => collection.join(null),

            expectedResult: `nullnull1nullAnull[object Object]null${new Date('2024-05-05').toString()}null${ObservableCollection.toString()}`
        });
    });

    it('calling join while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection)
                    observableCollection.join();
            })
            .not
            .toThrow();
    });
});