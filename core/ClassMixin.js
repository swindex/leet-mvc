/**
 * Instance to extend, that allows to inherit more than one class
 * @param {*} superclass 
 */
export var Mix = (superclass) => new MixinBuilder(superclass);

class MixinBuilder {  
  constructor(superclass) {
    this.superclass = superclass;
  }

  with(...mixins) { 
    return mixins.reduce((c, mixin) => mixin(c), this.superclass);
  }
}