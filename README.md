A library for developing ReactJS applications using Model-View-ViewModel, inspired by .NET.

[Project Wiki](https://github.com/Andrei15193/react-model-view-viewmodel/wiki) | [Guides and Tutorials - Getting Started](https://github.com/Andrei15193/react-model-view-viewmodel/discussions/7) | [Project Discussions](https://github.com/Andrei15193/react-model-view-viewmodel/discussions) | [Releases](https://github.com/Andrei15193/react-model-view-viewmodel/releases) | [CodeSandbox](https://codesandbox.io/p/sandbox/react-mvvm-vwsqlv)

**API**

* **Events**
  * [IEvent\<TSubject, TEventArgs\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IEvent)
  * [IEventHandler\<TSubject, TEventArgs\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IEventHandler)
  * [EventDispatcher\<TSubject, TEventArgs\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/EventDispatcher)
* **ViewModels**
  * [INotifyPropertiesChanged](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/INotifyPropertiesChanged)
  * [ViewModel](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ViewModel)
* **Forms**
  * [Form\<TValidationError\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/Form)
  * [IFormFieldConfig\<TValue, TValidationError\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IFormFieldConfig)
  * [FormField\<TValue, TValidationError\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/FormField)
  * [ReadOnlyFormCollection\<TForm, TValidationError\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ReadOnlyFormCollection)
  * [FormCollection\<TForm, TValidationError\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/FormCollection)
  * [IConfigurableFormCollection\<TSection, TValidationError\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IConfigurableFormCollection)
  * [FormSetupCallback\<TSection, TValidationError\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/FormSetupCallback)
* **Validation**
  * [IValidator\<TValidatable, TValidationError\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IValidator)
  * [ValidatorCallback\<TValidatable, TValidationError\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ValidatorCallback)
  * [IObjectValidator\<TValidatable, TValidationError\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IObjectValidator)
  * [IValidatable\<TValidationError\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IValidatable)
* **Validation / Triggers**
  * [WellKnownValidationTrigger\<TKey, TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/WellKnownValidationTrigger)
  * [ValidationTrigger\<TTrigger\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ValidationTrigger)
* **Observable Collection**
  * [ReadOnlyObservableCollection\<TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ReadOnlyObservableCollection)
  * [ObservableCollection\<TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ObservableCollection)
  * [INotifyCollectionChanged\<TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/INotifyCollectionChanged)
  * [CollectionChangeOperation](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/CollectionChangeOperation)
  * [INotifyCollectionReordered\<TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/INotifyCollectionReordered)
  * [CollectionReorderOperation](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/CollectionReorderOperation)
* **Observable Map**
  * [ReadOnlyObservableMap\<TKey, TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ReadOnlyObservableMap)
  * [ObservableMap\<TKey, TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ObservableMap)
  * [INotifyMapChanged\<TKey, TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/INotifyMapChanged)
  * [MapChangeOperation](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/MapChangeOperation)
* **Observable Set**
  * [ReadOnlyObservableSet\<TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ReadOnlyObservableSet)
  * [ObservableSet\<TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/ObservableSet)
  * [INotifySetChanged\<TItem\>](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/INotifySetChanged)
  * [SetChangeOperation](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/SetChangeOperation)
* **Dependency Handling**
  * [IDependencyResolver](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IDependencyResolver)
  * [IDependencyContainer](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/IDependencyContainer)
  * [DependencyContainer](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/DependencyContainer)
  * [useDependency](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/useDependency)
  * [useViewModelDependency](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/useViewModelDependency)
  * [useDependencyResolver](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/useDependencyResolver)
* **React Hooks**
  * [useViewModel](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/useViewModel)
  * [useViewModelMemo](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/useViewModelMemo)
  * [useObservableCollection](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/useObservableCollection)
  * [useObservableMap](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/useObservableMap)
  * [useObservableSet](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/useObservableSet)