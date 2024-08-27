import { ViewModel } from "../../viewModels";
import { ViewModelChangedValidationTrigger } from "../triggers";

describe('ViewModelChangedValidationTrigger', (): void => {
    it('validation is triggered when view model changes', (): void => {
        let invocationCount = 0;
        const viewModel = new FakeViewModel();
        const validationTrigger = new ViewModelChangedValidationTrigger({
            viewModel
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        viewModel.notifyPropertiesChanged();

        expect(invocationCount).toBe(1);
    });

    it('validation is not triggered when view model changes but check returns false', (): void => {
        let invocationCount = 0;
        const viewModel = new FakeViewModel();
        const validationTrigger = new ViewModelChangedValidationTrigger({
            viewModel,
            shouldTriggerValidation() {
                return false;
            }
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        viewModel.notifyPropertiesChanged();

        expect(invocationCount).toBe(0);
    });

    it('validation is triggered when view model changes and check returns true', (): void => {
        let invocationCount = 0;
        const viewModel = new FakeViewModel();
        const validationTrigger = new ViewModelChangedValidationTrigger({
            viewModel,
            shouldTriggerValidation() {
                return true;
            }
        });
        validationTrigger.validationTriggered.subscribe({
            handle(subject) {
                invocationCount++;
                expect(subject).toStrictEqual(validationTrigger);
            }
        });

        viewModel.notifyPropertiesChanged();

        expect(invocationCount).toBe(1);
    });
});

class FakeViewModel extends ViewModel {
    public notifyPropertiesChanged(): void {
        super.notifyPropertiesChanged("propertiesChanged");
    }
}