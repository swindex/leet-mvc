/**
 * Validate data array according to validating rules, defined in template object, errors will be writtel in errors object and visibuility flags written in attributes object
 * @param {{[key:string]:any}} [data]
 * @param {FieldTemplate[]} [template]
 * @param {{[key:string]:any}} [errors]
 * @param {{nestedData?:boolean}} [options]
 */
export declare function FormValidator(data: any, template: any, errors: any, options: any): void;
export declare namespace FormValidator {
    var messages: {
        accepted: string;
        active_url: string;
        after: string;
        alpha: string;
        alpha_dash: string;
        alpha_num: string;
        array: string;
        before: string;
        between: {
            number: string;
            numeric: string;
            file: string;
            string: string;
            array: string;
        };
        boolean: string;
        confirmed: string;
        date: string;
        date_format: string;
        different: string;
        digits: string;
        digits_between: string;
        distinct: string;
        email: string;
        exists: string;
        filled: string;
        image: string;
        in: string;
        in_array: string;
        integer: string;
        ip: string;
        json: string;
        max: {
            number: string;
            numeric: string;
            file: string;
            string: string;
            array: string;
        };
        mimes: string;
        min: {
            number: string;
            numeric: string;
            file: string;
            string: string;
            array: string;
        };
        not_in: string;
        number: string;
        numeric: string;
        present: string;
        regex: string;
        required: string;
        required_if: string;
        required_unless: string;
        required_with: string;
        required_with_all: string;
        required_without: string;
        required_without_all: string;
        same: string;
        size: {
            number: string;
            numeric: string;
            file: string;
            string: string;
            array: string;
        };
        string: string;
        timezone: string;
        unique: string;
        url: string;
        isValid: string;
    };
    var rules: {
        unique(value: any, type: any, conditions: any, validator: any): boolean;
        accepted(value: any, type: any, conditions: any, validator: any): boolean;
        required(value: any, type: any, conditions: any, validator: any, name: any): any;
        filled(value: any, type: any, conditions: any, validator: any): any;
        different(value: any, type: any, conditions: any, validator: any): boolean;
        same(value: any, type: any, conditions: any, validator: any): boolean;
        required_if(value: any, type: any, conditions: any, validator: any): any;
        min(value: any, type: any, conditions: any, validator: any): boolean;
        mimes(value: any, type: any, conditions: any, validator: any): boolean;
        max(value: any, type: any, conditions: any, validator: any): boolean;
        size(value: any, type: any, conditions: any, validator: any): boolean;
        after(value: any, type: any, conditions: any, validator: any): boolean;
        before(value: any, type: any, conditions: any, validator: any): boolean;
        date(value: any, type: any, conditions: any, validator: any): boolean;
        digits(value: any, type: any, conditions: any, validator: any): boolean;
        digits_between(value: any, type: any, conditions: any, validator: any): boolean;
        in(value: any, type: any, conditions: any, validator: any): boolean;
        string(value: any, type: any, conditions: any, validator: any): boolean;
        boolean(value: any, type: any, conditions: any, validator: any): boolean;
        numeric(value: any, type: any, conditions: any, validator: any): boolean;
        integer(value: any, type: any, conditions: any, validator: any): boolean;
        email(value: any, type: any, conditions: any, validator: any): boolean;
        isValid(value: any, type: any, conditions: any, validator: any, name: any): any;
        regex(value: any, type: any, conditions: any, validator: any): any;
    };
}
export declare const FormWalker: {
    /**
     * Walk the fieldTemplate array setting fully-qualified _name properties
     * Returns a flat representation of the template that should be used for binding to the view
     * @param {FieldTemplate[]} obj
     * @return {{[key:string]:FieldTemplate}}
     */
    set_names(obj: any): {};
    /**
       * Walk object calling callback on every node
       * @param {object} obj1
       */
    getVibleData(obj1: any): void;
};
