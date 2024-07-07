import type { IValidatable } from '../../IValidatable';
import { FakeViewModelValidationTrigger } from './FakeViewModelValidationTrigger';

export class FakeValidatable extends FakeViewModelValidationTrigger implements IValidatable {
    private _error: string | null = null;

    public get error(): string | null {
        return this._error;
    }

    public set error(value: string | null) {
        if (this._error !== value) {
            this._error = value;
            this.notifyPropertiesChanged('error');
        }
    }

    public get isValid(): boolean {
        return this.error === null || this.error === undefined;
    }

    public get isInvalid(): boolean {
        return this.error !== null && this.error !== undefined;
    }
}
