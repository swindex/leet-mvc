// Poor man's dependency injection
// Import this into the index.ts and inject your objects into it
// var Inject = Injector.implement(InjectTemplate)
// Inject.Config = Config ;

export interface InjectorType {
  implement: <T>(InjectTemplate: T) => InjectorType & T;
  [key: string]: any;
}

export const Injector: InjectorType = {
  implement: function <T>(InjectTemplate: T): InjectorType & T {
    return Injector as InjectorType & T;
  }
};