import { ObservableSet } from '../../collections';
import { ViewModel } from '../../viewModels';
import { SetItemValidationTrigger } from '../triggers/SetItemValidationTrigger';

describe('SetItemValidationTrigger', (): void => {
    it('validation is triggered when set item changes', (): void => {
        let invocationCount = 0;
        const item = new TestItem();
        const set = new ObservableSet<TestItem>([item]);
        const validationTrigger = new SetItemValidationTrigger({
            set,
            validationTriggerSelector({ viewModel }) {
                return viewModel;
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

    it('validation is triggered when an item is added to the set', (): void => {
        let invocationCount = 0;
        const set = new ObservableSet<TestItem>();
        const validationTrigger = new SetItemValidationTrigger({
            set,
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
        set.add(item);

        expect(invocationCount).toBe(1);
    });

    it('validation is triggered each time a unique item is added to the set and triggered once when it changes ', (): void => {
        let invocationCount = 0;
        const set = new ObservableSet<TestItem>();
        const validationTrigger = new SetItemValidationTrigger({
            set,
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
        set.add(item);
        expect(invocationCount).toBe(1);

        set.add(item);
        expect(invocationCount).toBe(1);

        set.add(item);
        expect(invocationCount).toBe(1);

        item.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(2);
    });

    it('validation is no longer triggered when a removed item changes', () => {
        let invocationCount = 0;
        const item1 = new TestItem();
        const item2 = new TestItem();
        const set = new ObservableSet<TestItem>([item1, item2]);
        const validationTrigger = new SetItemValidationTrigger({
            set,
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

        set.delete(item1);
        expect(invocationCount).toBe(1);

        item1.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(1);

        item2.viewModel.notifyPropertiesChanged();
        expect(invocationCount).toBe(2);
    });

    it('validation is not triggered when check returns false', () => {
        let invocationCount = 0;
        let checkInvocationCount = 0;
        const item = new TestItem();
        const set = new ObservableSet<TestItem>([item]);
        const validationTrigger = new SetItemValidationTrigger({
            set,
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