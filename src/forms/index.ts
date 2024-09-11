import { IReadOnlyObservableCollection, IObservableCollection } from '../collections';
import { FormFieldViewModel } from './FormFieldViewModel';
import { FormSectionCollection } from './FormSectionCollection';
import { FormViewModel } from './FormViewModel';
import { IReadOnlyFormSectionCollection } from './IReadOnlyFormSectionCollection';

export { FormViewModel } from './FormViewModel';
export { type IFormFieldViewModelConfig, FormFieldViewModel } from './FormFieldViewModel';

export type { IConfigurableFormSectionCollection, FormSectionSetupCallback } from './IConfigurableFormSectionCollection'
export type { IReadOnlyFormSectionCollection } from './IReadOnlyFormSectionCollection';
export type { IFormSectionCollection } from './IFormSectionCollection'
export { FormSectionCollection } from './FormSectionCollection';





export class MyFormViewModel extends FormViewModel {
    public constructor() {
        super();

        this.withFields(
            this.name = new FormFieldViewModel<string>({
                name: 'name',
                initialValue: '',
                validators: [field => field.value === '' ? 'Required' : null]
            }),
            this.description = new FormFieldViewModel<string>({
                name: 'description',
                initialValue: ''
            })
        );
    }

    public readonly name: FormFieldViewModel<string>;

    public readonly description: FormFieldViewModel<string>;
}