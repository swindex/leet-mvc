// Poor man's dependency injection
// Import this into the index.ts and inject your objects into it


import { NavController } from "./NavController";

export interface IInjector {
  Nav: NavController;
}

export const Injector = <IInjector>{};