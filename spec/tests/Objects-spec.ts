import { Objects } from "../../core/Objects";

describe('test Objects methods',function(){

	it('Expect assign to produce a copy of simple object',function(){
		var a: any;
		var b = {
			a:"some text",
			someProp:1,
			c:[1,2,3],
		}

		a = Objects.overwrite(a,b)
		
		expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
		expect(a==b).toBeTruthy();
	})

	it('Expect assign to produce a copy of complex object',function(){
		var a: any = {};
		var b: any = {
			a:"some text",
			b:1,
			c:[1,2,3],
			someDate: new Date(),
			someObj: new (function(this: any){this.aaa=355} as any)
		}

		a = Objects.overwrite(a,b)
		expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
		expect(a==b).toBeFalsy();
		expect(a.someObj).toEqual(b.someObj);
	})

	it('Expect overwrite method to completely overwrite all properties of target, preserving the SOURCE references',function(){
		var a: any = {a:null,b:null,c:[5,8,9,10.12, 15],willberemoved:'aaaa',someDate:new Date('2015-08-09'),someObj: new (function(this: any){this.aaa=955} as any)};
		var b: any = {
			a:"some text",
			b:1,
			c:[1,2,3],
			someDate: new Date(),
			someObj: new (function(this: any){this.aaa=355} as any)
		}
		var oldref = a;
		a = Objects.overwrite(a,b);
		//expect same keys
		expect(Object.keys(a)).toEqual(Object.keys(b));
		//expect reference to remain
		expect(a==oldref).toBeTruthy();
		//expect properties to match
		expect(a.a==b.a).toBeTruthy();
	})

	it('Expect owerwrite to partial object with different object type produce a copy of complex object',function(){
		var a: any = {a:null,b:null,c:[5,8,9,10.12, 15]};
		var b: any = {
			a:"some text",
			b:1,
			c:{aa:1,bb:2,cc:3}
		}

		a = Objects.overwrite(a,b);
		expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
		expect(a==b).toBeFalsy();
	})

	it('Expect overwrite method to remove all items from an array and replace it with properties of Source, while preserving the SOURCE reference',function(){
		var a: any = [1,2,3,4,5,6,7,8,9,10];
		var b: any = {
			a:"some text",
			b:1,
			c:{aa:1,bb:2,cc:3}
		}

		a = Objects.overwrite(a,b);
		//compare keys only
		expect(Object.keys(a)).toEqual(Object.keys(b));
		expect(a==b).toBeFalsy();
	})
});