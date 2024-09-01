import { ObservableMap } from "../../collections";
import { ViewModel } from "../../viewModels";
import { MapItemValidationTrigger } from "../triggers/MapItemValidationTrigger";

describe('MapItemValidationTrigger', (): void => {
    it('validation is triggered when map item changes', (): void => {
        let invocationCount = 0;
        const item = new TestItem();
        const map = new ObservableMap<number, TestItem>([[1, item]]);
        const validationTrigger = new MapItemValidationTrigger({
            map,
            validationTriggerSelector({ viewModel }) {
                return [viewModel];
            }
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        item.viewModel.notifyPropertiesChanged();

        expect(invocationCount).toBe(1);
    });

    it('validation is triggered when an item is added to the map', (): void => {
        let invocationCount = 0;
        const map = new ObservableMap<number, TestItem>();
        const validationTrigger = new MapItemValidationTrigger({
            map,
            validationTriggerSelector({ viewModel }) {
                return [viewModel];
            }
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        const item = new TestItem();
        map.set(1, item);

        expect(invocationCount).toBe(1);
    });

    it('validation is triggered once when the map contains the same item multiple times and it changes', (): void => {
        let invocationCount = 0;
        const item = new TestItem();
        const map = new ObservableMap<number, TestItem>([[1, item], [2, item], [3, item]]);
        const validationTrigger = new MapItemValidationTrigger({
            map,
            validationTriggerSelector({ viewModel }) {
                return [viewModel];
            }
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        item.viewModel.notifyPropertiesChanged();

        expect(invocationCount).toBe(1);
    });

    it('validation is triggered each time the same item is added to the map and triggered once when it changes ', (): void => {
        let invocationCount = 0;
        const map = new ObservableMap<number, TestItem>();
        const validationTrigger = new MapItemValidationTrigger({
            map,
            validationTriggerSelector({ viewModel }) {
                return [viewModel];
            }
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        const item = new TestItem();
        map.set(1, item);
        expect(invocationCount).toBe(1);

        map.set(2, item);
        expect(invocationCount).toBe(2);

        map.set(3, item);
        expect(invocationCount).toBe(3);

        item.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(4);
    });

    it('validation is no longer triggered when a removed item changes', () => {
        let invocationCount = 0;
        const item1 = new TestItem();
        const item2 = new TestItem();
        const map = new ObservableMap<number, TestItem>([[1, item1], [2, item2]]);
        const validationTrigger = new MapItemValidationTrigger({
            map,
            validationTriggerSelector({ viewModel }) {
                return [viewModel];
            }
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        map.delete(1);
        expect(invocationCount).toBe(1);

        item1.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(1);

        item2.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(2);
    });

    it('validation is still triggered when the same item was added multiple times, removed, but at least one instance is still contained by the map', () => {
        let invocationCount = 0;
        const item1 = new TestItem();
        const item2 = new TestItem();
        const map = new ObservableMap<number, TestItem>([[1, item1], [2, item2]]);
        const validationTrigger = new MapItemValidationTrigger({
            map,
            validationTriggerSelector({ viewModel }) {
                return [viewModel];
            }
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        map.set(3, item1);
        expect(invocationCount).toBe(1);

        map.set(4, item1);
        expect(invocationCount).toBe(2);

        map.delete(1);
        expect(invocationCount).toBe(3);

        item1.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(4);

        item2.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(5);

        map.delete(3);
        expect(invocationCount).toBe(6);

        item1.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(7);

        item2.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(8);

        map.delete(4);
        expect(invocationCount).toBe(9);

        item1.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(9);

        item2.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(10);

        map.delete(2);
        expect(invocationCount).toBe(11);

        item1.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(11);

        item2.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(11);
    });

    it('validation is not triggered when check returns false', () => {
        let invocationCount = 0;
        let checkInvocationCount = 0;
        const item = new TestItem();
        const map = new ObservableMap<number, TestItem>([[1, item]]);
        const validationTrigger = new MapItemValidationTrigger({
            map,
            validationTriggerSelector({ viewModel }) {
                return [viewModel];
            },
            shouldTriggerValidation(actualItem) {
                checkInvocationCount++;
                expect(actualItem).toStrictEqual(item);
                return false;
            }
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        item.viewModel.notifyPropertiesChanged();

        expect(invocationCount).toBe(0);
        expect(checkInvocationCount).toBe(1);
    });
});

class TestItem {
    public viewModel = new FakeViewModel();
}

class FakeViewModel extends ViewModel {
    public notifyPropertiesChanged(): void {
        super.notifyPropertiesChanged('propertiesChanged');
    }
}