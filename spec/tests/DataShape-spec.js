import { DataShape } from "../../core/DataShape";

describe('test DataShape methods',function(){
	it("Expect '15' to equal 15",function(){
		var ds = DataShape.integer(null);
		var val = "15";

		var c = DataShape.copy(val, ds);
		//console.log(c);
		//console.log(ds);
		expect(c).toEqual(15);
	})

	it("Expect 'aa' to equal null",function(){
		var ds = DataShape.integer(null);
		var val = "aa";

		var c = DataShape.copy(val, ds);
		//console.log(c);
		//console.log(ds);
		expect(c).toEqual(null);
	})

	it("Expect 'aa' to equal 0",function(){
		var ds = DataShape.integer(0);
		var val = "aa";

		var c = DataShape.copy(val, ds);
		//console.log(c);
		//console.log(ds);
		expect(c).toEqual(0);
	})

	it("Expect undefined to equal 0",function(){
		var ds = DataShape.integer(0);
		var val;
		var c = DataShape.copy(val, ds);
		//console.log(val,'->',c);
		expect(c).toEqual(0);
	})

	it("Expect '19.8' to equal 19",function(){
		var ds = DataShape.integer(null);
		var val = "19.8";

		var c = DataShape.copy(val, ds);
		//console.log(c);
		//console.log(ds);
		expect(c).toEqual(19);
	})

	it("Expect '19.1' to equal 19",function(){
		var ds = DataShape.integer(null);
		var val = "19.1";

		var c = DataShape.copy(val, ds);
		//console.log(c);
		//console.log(ds);
		expect(c).toEqual(19);
	})

	it("Expect 19.1 to equal '19.1'",function(){
		var ds = DataShape.string(null);
		var val = 19.1;

		var c = DataShape.copy(val, ds);
		//console.log(c);
		//console.log(ds);
		expect(c).toEqual('19.1');
	})

	it("Expect undefined string to equal null",function(){
		var ds = DataShape.string(null);
		var val;
		var c = DataShape.copy(val, ds);
		//console.log(val,'->',c);
		expect(c).toEqual(null);
	})

	it("Expect undefined string to equal ''",function(){
		var ds = DataShape.string('');
		var val;
		var c = DataShape.copy(val, ds);
		//console.log(val,'->',c);
		expect(c).toEqual('');
	})

	it("Expect null string to equal null",function(){
		var ds = DataShape.string(null);
		var val = null;
		var c = DataShape.copy(val, ds);
		//console.log(val,'->',c);
		expect(c).toEqual(null);
	})

	it("Expect undefined float to equal null",function(){
		var ds = DataShape.float(null);
		var val;
		var c = DataShape.copy(val, ds);
		//console.log(val,'->',c);
		expect(c).toEqual(null);
	})

	it("Expect '19.75' float to equal 19.75",function(){
		var ds = DataShape.float(null);
		var val = '19.75';
		var c = DataShape.copy(val, ds);
		//console.log(val,'->',c);
		expect(c).toEqual(19.75);
	})

	it("Expect boolean to equal true",function(){
		expect(DataShape.copy('true', DataShape.boolean(null))).toEqual(true);
		expect(DataShape.copy('t', DataShape.boolean(null))).toEqual(true);
		expect(DataShape.copy(1, DataShape.boolean(null))).toEqual(true);
		expect(DataShape.copy(-1, DataShape.boolean(null))).toEqual(true);
		expect(DataShape.copy(15, DataShape.boolean(null))).toEqual(true);
		expect(DataShape.copy(true, DataShape.boolean(null))).toEqual(true);
	})

	it("Expect boolean to equal false",function(){
		var un ;
		expect(DataShape.copy('false', DataShape.boolean(null))).toEqual(false);
		expect(DataShape.copy('f', DataShape.boolean(null))).toEqual(false);
		expect(DataShape.copy(0, DataShape.boolean(null))).toEqual(false);
		expect(DataShape.copy(null, DataShape.boolean(null))).toEqual(false);
		expect(DataShape.copy(un, DataShape.boolean(false))).toEqual(false);
		expect(DataShape.copy(false, DataShape.boolean(null))).toEqual(false);
	})

	it("Expect undefined boolean to equal null",function(){
		var un ;
		expect(DataShape.copy(un, DataShape.boolean(null))).toEqual(null);
	})
	it("Expect undefined boolean to equal true",function(){
		var un ;
		expect(DataShape.copy(un, DataShape.boolean(true))).toEqual(true);
	})

	it('Expect copy(obj) to convert flat object, add missing defaults AND remove unexpected fields',function(){
		var val = {
			ii:'11',
			ff:'11.2',
			ss:'11',
			uu:'aaass',
			ee:'aaass',
			fs:'aaass',
		}
		var ds = {
			ii:DataShape.integer(),
			ff:DataShape.float(),
			ss:DataShape.string(),
			pp:DataShape.string(),
			gg:DataShape.string(''),
			bb:DataShape.boolean(),
			bbn:DataShape.boolean(false),
		}

		var c = DataShape.copy(val,ds);
		//console.log(JSON.stringify(c));
		expect(JSON.stringify(c)).toEqual(JSON.stringify({
			ii:11,
			ff:11.2,
			ss:'11',
			pp:null,
			gg:'',
			bb:null,
			bbn:false
		}));
	})


	/*it('Expect copy(obj, template) method to copy data according to template. Empty object source',function(){
		var c = DataShape.copy({}, DShape.RegisterFormData);
		////console.log(JSON.stringify(c));
		////console.log(JSON.stringify(DShape.RegisterFormData));

		expect(JSON.stringify(c)).toEqual(JSON.stringify(DShape.RegisterFormData));
	})*/
	/*it('Expect copy(obj, template) method to copy data according to template. NULL object source',function(){
		var c = DataShape.copy(null, DShape.RegisterFormData);
		////console.log(JSON.stringify(c));
		////console.log(JSON.stringify(DShape.RegisterFormData));

		expect(JSON.stringify(c)).toEqual(JSON.stringify(DShape.RegisterFormData));
	})
	it('Expect copy(obj, template) method to copy data according to template. Number 555 object source',function(){
		var c = DataShape.copy(555, DShape.RegisterFormData);
		////console.log(JSON.stringify(c));
		////console.log(JSON.stringify(DShape.RegisterFormData));

		expect(JSON.stringify(c)).toEqual(JSON.stringify(DShape.RegisterFormData));
	})
	it('Expect copy(obj, template) method to copy data according to template. Partial source',function(){
		var b = DataShape.copy(DShape.RegisterFormData)
		var c = DataShape.copy({form1:{email:"AAABBB"}}, b);
		b.form1.email = "AAABBB"
		////console.log(JSON.stringify(c));
		////console.log(JSON.stringify(b));

		expect(JSON.stringify(c)).toEqual(JSON.stringify(b));
		expect(JSON.stringify(c)).not.toEqual(JSON.stringify(DShape.RegisterFormData));
	})

	it('Expect copy(obj, template, true) method to throw error. Partial source',function(){
		var b = DataShape.copy(DShape.RegisterFormData)
		expect(function(){DataShape.copy({form1:{email:"AAABBB"},form2:{},form3:{}}, b, true)}).toThrow();
	})*/

	it('Expect ret copy(obj, template, true)== obj when template has simple array',function(){
		var a = {
			a:"some text",
			b:1,
			c:[1,2],
		}
		var t = {
			a:null,
			b:null,
			c:[],
		}
		var c = DataShape.copy(a,t,true);
		expect(JSON.stringify(c)).toEqual(JSON.stringify(a));
	})

	it('Expect ret copy(obj, template, true)== obj when template has complex array',function(){
		var a = {
			a:"some text",
			b:1,
			c:[{d:'dhfhj',e:'srty',f:'tyui'},{d:'fftyh',e:'ffty',f:'gghg'}],
		}
		var t = {
			a:null,
			b:null,
			c:[{d:null,e:null,f:null}],
		}
		var c = DataShape.copy(a,t,true);
		expect(JSON.stringify(c)).toEqual(JSON.stringify(a));
	})

	it('Expect ret copy(obj, template, true) to thow error when template has complex array and obj shape is missing one element',function(){
		var a = {
			a:"some text",
			b:1,
			c:[{d:'dhfhj',e:'srty'},{d:'fftyh',e:'ffty',f:'gghg'}],
		}
		var t = {
			a:null,
			b:null,
			c:[{d:null,e:null,f:null}],
		}
		
		expect(function (){DataShape.copy(a,t,true)}).toThrow();
	})

	it('Expect ret copy(obj, template, true) to NOT thow error when template has complex array and obj array is empty',function(){
		var a = {
			a:"some text",
			b:1,
			c:[],
		}
		var t = {
			a:null,
			b:null,
			c:[{d:null,e:null,f:null}],
		}
		var c = DataShape.copy(a,t,true)
		////console.log(JSON.stringify(a));
		////console.log(JSON.stringify(c));
		////console.log(JSON.stringify(t));
		expect(function (){DataShape.copy(a,t,true)}).not.toThrow();
	})

	it('Expect ret copy(obj, template, true) to NOT thow error when template has simple property and obj property is complex',function(){
		var a = {
			a:"some text",
			b:1,
			c:[{d:'fftyh',e:{u:'r',uu:{ff:"fff"}},f:'gghg'}],
		}
		var t = {
			a:null,
			b:null,
			c:[{d:null,e:null,f:null}],
		}
		//var c = Objects.copy(a,t)
		////console.log(JSON.stringify(a));
		////console.log(JSON.stringify(c));
		////console.log(JSON.stringify(t));
		expect(function (){DataShape.copy(a,t,true)}).not.toThrow();
	})

	it('Expect ret copy(obj, template, true) to NOT thow error when template has empty array and obj array elems are complex',function(){
		var a = {
			a:"some text",
			b:1,
			c:[{d:'fftyh',e:{u:'r',uu:{ff:"fff"}},f:'gghg'}],
		}
		var t = {
			a:null,
			b:null,
			c:[],
		}
		////console.log(JSON.stringify(a));
		////console.log(JSON.stringify(c));
		////console.log(JSON.stringify(t));
		expect(function (){DataShape.copy(a,t,true)}).not.toThrow();
		
		var c = DataShape.copy(a,t,true)
		
		expect(JSON.stringify(c)).toEqual(JSON.stringify(a));
	})

	it('Expect ret copy(obj, template, true) to thow error when template has array with complex elem and obj array elems are simple',function(){
		var a = {
			a:"some text",
			b:1,
			c:[1,2,3],
		}
		var t = {
			a:null,
			b:null,
			c:[{d:'fftyh',e:{u:'r',uu:{ff:"fff"}},f:'gghg'}],
		}
		////console.log(JSON.stringify(a));
		////console.log(JSON.stringify(c));
		////console.log(JSON.stringify(t));
		expect(function (){DataShape.copy(a,t,true)}).toThrow();
		
		//var c = Objects.copy(a,t,true)
		
		//expect(JSON.stringify(c)).toEqual(JSON.stringify(a));
	})
	/*it('Expect copy(obj, template) method to copy data according to template. million times in less than 5 seconds',function(){
		var b = DataShape.copy(DShape.RegisterFormData)
		var t0 = performance.now();
		for(var i = 0 ; i < 1000000 ; i++){
			var c = DataShape.copy({form1:{email:"AAABBB"+i}}, b);
		}
		var t1 = performance.now();
		////console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")
		
		expect(t1 - t0).toBeLessThan(5000);
	})*/
});