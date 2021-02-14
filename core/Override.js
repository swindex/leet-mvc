import { argumentsToArray } from "./helpers";

/**
 * Override Function or a method 
 * @param {any} originalContext - context to call the original function from
 * @param {function} originalFunction - method or function to override
 * @param {function(function, ...any):any} overrideFunction - callback to execute instead of the original function/method
 * @returns function
 */
export function Override(originalContext, originalFunction, overrideFunction){
  return function(){
    var args = arguments;
    var argsWithNext = argumentsToArray(arguments);
    argsWithNext.unshift(function(){
      return originalFunction.apply(originalContext, arguments.length > 0 ? arguments : args );
    });
    return overrideFunction.apply( originalContext, argsWithNext );
  };
}
