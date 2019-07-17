import { Objects } from "../../core/Objects";

describe('test Objects methods',function(){

	it('Expect assign to produce a copy of simple object',function(){
		var a ;
		var b = {
			a:"some text",
			someProp:1,
			c:[1,2,3],
		}

		a = Objects.overwrite(a,b)
		
		//console.log(JSON.stringify(a));
		//console.log(JSON.stringify(b));
		expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
		expect(a==b).toBeTruthy();
	})

	it('Expect assign to produce a copy of complex object',function(){
		var a = {};
		var b = {
			a:"some text",
			b:1,
			c:[1,2,3],
			someDate: new Date(),
			someObj: new (function(){this.aaa=355})
		}

		a = Objects.overwrite(a,b)
		//console.log(a);
		//console.log(b);
		expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
		expect(a==b).toBeFalsy();
		expect(a.someObj).toEqual(b.someObj);
	})

	it('Expect overwrite method to completely overwrite all properties of target, preserving the SOURCE references',function(){
		var a = {a:null,b:null,c:[5,8,9,10.12, 15],willberemoved:'aaaa',someDate:new Date('2015-08-09'),someObj: new (function(){this.aaa=955})};
		var b = {
			a:"some text",
			b:1,
			c:[1,2,3],
			someDate: new Date(),
			someObj: new (function(){this.aaa=355})
		}
		var oldref = a;
		a = Objects.overwrite(a,b);
		//console.log(a);
		//console.log(b);
		//expect same keys
		expect(Object.keys(a)).toEqual(Object.keys(b));
		//expect reference to remain
		expect(a==oldref).toBeTruthy();
		//expect properties to match
		expect(a.a==b.a).toBeTruthy();
	})

	it('Expect owerwrite to partial object with different object type produce a copy of complex object',function(){
		var a = {a:null,b:null,c:[5,8,9,10.12, 15]};
		var b = {
			a:"some text",
			b:1,
			c:{aa:1,bb:2,cc:3}
		}

		a = Objects.overwrite(a,b);
		//console.log(a);
		//console.log(b);
		expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
		expect(a==b).toBeFalsy();
	})

	it('Expect overwrite method to remove all items from an array and replace it with properties of Source, while preserving the SOURCE reference',function(){
		var a = [1,2,3,4,5,6,7,8,9,10];
		var b = {
			a:"some text",
			b:1,
			c:{aa:1,bb:2,cc:3}
		}

		a = Objects.overwrite(a,b);
		//console.log(a);
		//console.log(b);
		//compare keys only
		expect(Object.keys(a)).toEqual(Object.keys(b));
		expect(a==b).toBeFalsy();
	})
});