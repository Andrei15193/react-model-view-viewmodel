import { ViewModel } from '../src/view-model';
import { expect } from "chai";

class MockViewModel extends ViewModel {
    readonly one: string;
    readonly two: string;

    public notifyPropertiesChanged(changedProperty: keyof this, ...otherChangedProperties: readonly (keyof this)[]): void {
        super.notifyPropertiesChanged(changedProperty, ...otherChangedProperties);
    }
}

describe("view-model/ViewModel", (): void => {
    it("dispatching properties changed passes view model as subject and changed properties as args", (): void => {
        const viewModel = new MockViewModel();
        let invocationCount = 0;
        viewModel.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                invocationCount++;
                expect(subject).is.equal(viewModel);
                expect(changedProperties).is.deep.equal(['one', 'two']);
            }
        })

        viewModel.notifyPropertiesChanged('one', 'two');

        expect(invocationCount).is.equal(1);
    });
});