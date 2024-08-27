import type { IValidatable } from './IValidatable';
import { ViewModel } from '../viewModels';

export class Validatable<TValidationError = string> extends ViewModel implements IValidatable<TValidationError> {
    private _error: TValidationError | null

    public get isValid(): boolean {
        return this._error === null;
    }

    public get isInvalid(): boolean {
        return this._error !== null;
    }

    public get error(): TValidationError | null {
        return this._error;
    }

    public set error(value: TValidationError | false | null | undefined) {
        const normalizedError = value === false || value === null || value === undefined ? null : value;

        if (this._error !== normalizedError) {
            this._error = normalizedError;
            this.notifyPropertiesChanged('error');
        }
    }
}