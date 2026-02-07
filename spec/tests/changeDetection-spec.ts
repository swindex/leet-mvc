import { objectCloneCompare } from "./../../core/Watcher";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const _: any = require('lodash');

describe('Test Dirty Object change Detection',function(){
	
	it('Similar Objects to be "unchanged"',function(){
		var date = new Date();
		var a: any = {
			a:"123456",
			b:123456,
			c: new Date(date),
			d: {
				a:"123456",
				b:123456,
				c: new Date(date),
			},
			e:[
				{
					a:"123456",
					b:123456,
					c: new Date(date),
				},
				{
					a:"12388",
					b:1234887,
					c: new Date(date),
				}
			],
			f:{
				a:[1,2,3],
				b:[
					{
						a:"12388",
						b:1234887,
						c: new Date(date),
					},{
						a:"128",
						b:1237,
						c: new Date(date),
					}
				],
			}
		}
		var b: any = {
			a:"123456",
			b:123456,
			c: new Date(date),
			d: {
				a:"123456",
				b:123456,
				c: new Date(date),
			},
			e:[
				{
					a:"123456",
					b:123456,
					c: new Date(date),
				},
				{
					a:"12388",
					b:1234887,
					c: new Date(date),
				}
			],
			f:{
				a:[1,2,3],
				b:[
					{
						a:"12388",
						b:1234887,
						c: new Date(date),
					},{
						a:"128",
						b:1237,
						c: new Date(date),
					}
				],
			}
		}	
		
		var hasChanges1 = false;

		var result = objectCloneCompare(a,b, function(obj: any, k: string, value: any){
			console.log("changed: "+k);
			hasChanges1 = true;
		}, []);

		expect(hasChanges1).toBeFalsy();
		
		//expect second compare to be also falsy
		hasChanges1 = false;
		objectCloneCompare(result,b, function(obj: any, k: string, value: any){
			console.log("changed: "+k);
			hasChanges1 = true;
		}, []);
		expect(hasChanges1).toBeFalsy();

		expect(_.isEqual(a,b)).toBeTruthy();

	});


	it('Objects with changes to be marked "changed"',function(){
		var date = new Date();
		var a: any = {
			a:"123456",
			b:123456,
			c: new Date(date),
			missing:"i will be missing",
			d: {
				a:"123456",
				b:123456,
				c1: new Date(date),
			},
			willBeGone:[1,2,3],
			e_arr:[
				{
					a:"123456",
					b:123456,
					c2: new Date(date),
				},
				{
					a:"12388",
					b:1234887,
					c3: new Date(date),
				}
			],
			f:{
				a:[1,2,3],
				b_arr:[
					{
						a:"12388",
						b:1234887,
						c4: new Date(date),
					},{
						a:"128",
						b:1237,
						cc: new Date(date),
					}
				],
			}
		}
		var b: any = {
			a:"123456",
			b: 123436, //changed
			c: new Date(date),
			d: {
				a:"123456",
				b:123456,
				c1: new Date(date),
				added:"i was added"
			},
			e_arr:[
				{
					a:"123456",
					b:123456,
					c2: new Date(date),
				},
				{
					a:"12388",
					b:1234887,
					c3: new Date(date),
				},
				{a:1222,b:"ffff"} //changed
			],
			hasBeenAdded:[1,2,3],
			f:{
				a:[1,2,3],
				b_arr:[
					{
						a:"12388dd", //changed
						b:1234887,
						c4: new Date(date),
					},{
						a:"128",
						b:1237,
						cc: new Date(15555), //changed
					},
					"ffff"					//changed
				],
			}
		}	
		
		var hasChanges1 = false;
		var changedKeys: string[] = [];

		var result = objectCloneCompare(a,b, function(obj: any, k: string, value: any){
			console.log("changed: "+k);
			changedKeys.push(k)
			hasChanges1 = true;
		}, []);

		expect(hasChanges1).toBeTruthy();
		expect(changedKeys).toContain("b")
		expect(changedKeys).toContain("a")
		expect(changedKeys).toContain("cc")
		expect(changedKeys).toContain("e_arr")
		expect(changedKeys).toContain("b_arr")
		expect(changedKeys).toContain("missing")
		expect(changedKeys).toContain("added")
		expect(changedKeys).toContain("willBeGone")
		expect(changedKeys).toContain("hasBeenAdded")

		//expect second compare to return no changes
		console.log("check again");
		hasChanges1 = false;
		objectCloneCompare(result,b, function(obj: any, k: string, value: any){
			console.log("changed: "+k);
			hasChanges1 = true;
		}, []);
		expect(hasChanges1).toBeFalsy();
		expect(_.isEqual(a,b)).toBeFalsy();
	})
})