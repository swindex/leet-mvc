type Constructor<T = {}> = new (...args: any[]) => T;
type MixinFunction<T extends Constructor> = (superclass: T) => T;

/**
 * Instance to extend, that allows to inherit more than one class
 */
export const Mix = <T extends Constructor>(superclass: T) => new MixinBuilder(superclass);

class MixinBuilder<T extends Constructor> {
  private superclass: T;

  constructor(superclass: T) {
    this.superclass = superclass;
  }

  with<M extends MixinFunction<T>[]>(...mixins: M): T {
    return mixins.reduce((c, mixin) => mixin(c), this.superclass) as T;
  }
}