export interface IEvent<TEventArgs = void> {
    subscribe(eventHandler: IEventHandler<TEventArgs>): void;

    unsubscribe(eventHandler: IEventHandler<TEventArgs>): void;
}

export interface IEventHandler<TEventArgs = void> {
    handle(subject: object, args: TEventArgs): void;
}

export class DispatchEvent<TEventArgs = void> implements IEvent<TEventArgs> {
    private _eventHandlers: readonly IEventHandler<TEventArgs>[] = [];

    public subscribe(eventHandler: IEventHandler<TEventArgs>): void {
        this._eventHandlers = this._eventHandlers.concat(eventHandler);
    }

    public unsubscribe(eventHandler: IEventHandler<TEventArgs>): void {
        const eventHandlerIndex = this._eventHandlers.indexOf(eventHandler);
        if (eventHandlerIndex >= 0)
            this._eventHandlers = this._eventHandlers.filter((_, index) => index !== eventHandlerIndex);
    }

    public dispatch(subject: object, args: TEventArgs): void {
        this._eventHandlers.forEach(eventHandler => {
            if (this._eventHandlers.indexOf(eventHandler) >= 0)
                eventHandler.handle(subject, args);
        });
    }
}