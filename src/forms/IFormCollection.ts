import type { IObservableCollection } from '../collections';
import type { Form } from './Form';
import type { IReadOnlyFormCollection } from './IReadOnlyFormCollection';

/** 
 * Represents a configurable observable collection of forms. Callbacks can be configured for setting up individual
 * form sections for cases where validation and other aspects are based on the state of an entity or the form itself.
 *
 * @template TForm The concrete type of the form section.
 * @template TValidationError The concrete type for representing validation errors (strings, enums, numbers etc.).
 */
export interface IFormCollection<TForm extends Form<TValidationError>, TValidationError = string> extends IObservableCollection<TForm>, IReadOnlyFormCollection<TForm, TValidationError> {
    /**
     * Gets or sets the number of items in the collection.
     * @see [Array.length](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/length)
     */
    length: number;
}