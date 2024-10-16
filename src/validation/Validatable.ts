import type { IValidatable } from './IValidatable';
import { ViewModel } from '../viewModels';

/**
 * Represents a base implementation for a validatable
 * @template TValidationError The concrete type for representing validaiton errors (strings, enums, numbers etc.).
 */
export class Validatable<TValidationError = string> extends ViewModel implements IValidatable<TValidationError> {
    private _error: TValidationError | null;

    /**
     * A flag indicating whether the object is valid.
     */
    public get isValid(): boolean {
        return this._error === null;
    }

    /**
     * A flag indicating whether the object is invalid.
     */
    public get isInvalid(): boolean {
        return this._error !== null;
    }

    /**
     * Gets or sets the error message when the object is invalid.
     */
    public get error(): TValidationError | null {
        return this._error;
    }

    /**
     * Gets or sets the error message when the object is invalid.
     */
    public set error(value: TValidationError | false | null | undefined) {
        const normalizedError = (value === false || value === null || value === undefined) ? null : value;

        if (this._error !== normalizedError) {
            this._error = normalizedError;
            this.notifyPropertiesChanged('error', 'isValid', 'isInvalid');
        }
    }
}