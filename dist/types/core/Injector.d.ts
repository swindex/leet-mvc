export interface InjectorType {
    implement: <T>(InjectTemplate: T) => InjectorType & T;
    [key: string]: any;
}
export declare const Injector: InjectorType;
