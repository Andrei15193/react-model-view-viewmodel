import { ViewModel } from '../../../viewModels';

export class FakeViewModelValidationTrigger extends ViewModel {
    public triggerValidation() {
        this.notifyPropertiesChanged('triggerValidation');
    }
}