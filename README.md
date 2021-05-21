A library for developing React applications using Model-View-ViewModel inspired
by .NET.

Model-View-ViewModel is an alternative architectural pattern for designing and
developing user interfaces to Flux. Similar wtih Flux, MVVM is a pattern which
can have multiple implementations. For instance, implementations of Flux are
Redux and MobX, as well as VueX. The patterns are not constrained to languages,
but rather concepts that they use.

Most Single-Page Applications use a Flux implementations because it solves a
number of issues while introducing others (stale data being one of them). MVVM
is not fault free, it is an alternative to Flux. Chosing one over the other
inherently means chosing the issues that the chosen pattern comes with, this is
why it is important to know about them and know which one to pick based on the
application that is being developed and eventually have libraries or frameworks
that implement these patterns so we do not have to start from scratch every
single time.

One of the things that .NET has which is not present in other programming
languages is an implementation of events which are actually an implementation
of the Observer design pattern. The main difference from the usual
implementation being that an object can expose multiple events rather than just
a subscribe/unsubscribe method pair where the observer is notified about
anything that goes on with the object.

Subscribers can pick for which events they want to listen and be notified when
they occur, providing a primary filter for when observers should be notified
about something at the object level, rather than notifying the observers for
anything and then let them decide whether they want to react or not.

Events are critical for any front-end application, anything that goes on the UI
is mostly, if not always, event driven. The user clicks a button, the user
types in an input, the code reacts to these events which in turn may generate
other events to which other objects react and eventually update the user
interface.

Having this in mind and that .NET handles this very nicely by having events
built-in, this library mimics the implementation. Not just of the event system
but of the core interfaces that are used for data binding in both WPF and
WinForms, [INotifyPropertyChanged](https://docs.microsoft.com/dotnet/api/system.componentmodel.inotifypropertychanged)
and [INotifyCollectionChanged](https://docs.microsoft.com/dotnet/api/system.collections.specialized.inotifycollectionchanged).

If you are familiar with .NET you will see the similarities with this library.