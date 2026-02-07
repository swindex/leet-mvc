import { DataShape } from "../../core/DataShape";

describe('test DataShape methods',function(){
	it("Expect '15' to equal 15",function(){
		var ds = DataShape.integer(null);
		var val = "15";

		var c = DataShape.copy(val, ds);
		expect(c).toEqual(15);
	})

	it("Expect 'aa' to equal null",function(){
		var ds = DataShape.integer(null);
		var val = "aa";

		var c = DataShape.copy(val, ds);
		expect(c).toEqual(null);
	})

	it("Expect 'aa' to equal 0",function(){
		var ds = DataShape.integer(0);
		var val = "aa";

		var c = DataShape.copy(val, ds);
		expect(c).toEqual(0);
	})

	it("Expect undefined to equal 0",function(){
		var ds = DataShape.integer(0);
		var val: any;
		var c = DataShape.copy(val, ds);
		expect(c).toEqual(0);
	})

	it("Expect '19.8' to equal 19",function(){
		var ds = DataShape.integer(null);
		var val = "19.8";

		var c = DataShape.copy(val, ds);
		expect(c).toEqual(19);
	})

	it("Expect '19.1' to equal 19",function(){
		var ds = DataShape.integer(null);
		var val = "19.1";

		var c = DataShape.copy(val, ds);
		expect(c).toEqual(19);
	})

	it("Expect 19.1 to equal '19.1'",function(){
		var ds = DataShape.string(null);
		var val = 19.1;

		var c = DataShape.copy(val, ds);
		expect(c).toEqual('19.1');
	})

	it("Expect undefined string to equal null",function(){
		var ds = DataShape.string(null);
		var val: any;
		var c = DataShape.copy(val, ds);
		expect(c).toEqual(null);
	})

	it("Expect undefined string to equal ''",function(){
		var ds = DataShape.string('');
		var val: any;
		var c = DataShape.copy(val, ds);
		expect(c).toEqual('');
	})

	it("Expect null string to equal null",function(){
		var ds = DataShape.string(null);
		var val = null;
		var c = DataShape.copy(val, ds);
		expect(c).toEqual(null);
	})

	it("Expect undefined float to equal null",function(){
		var ds = DataShape.float(null);
		var val: any;
		var c = DataShape.copy(val, ds);
		expect(c).toEqual(null);
	})

	it("Expect '19.75' float to equal 19.75",function(){
		var ds = DataShape.float(null);
		var val = '19.75';
		var c = DataShape.copy(val, ds);
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
		var un: any;
		expect(DataShape.copy('false', DataShape.boolean(null))).toEqual(false);
		expect(DataShape.copy('f', DataShape.boolean(null))).toEqual(false);
		expect(DataShape.copy(0, DataShape.boolean(null))).toEqual(false);
		expect(DataShape.copy(null, DataShape.boolean(null))).toEqual(false);
		expect(DataShape.copy(un, DataShape.boolean(false))).toEqual(false);
		expect(DataShape.copy(false, DataShape.boolean(null))).toEqual(false);
	})

	it("Expect undefined boolean to equal null",function(){
		var un: any;
		expect(DataShape.copy(un, DataShape.boolean(null))).toEqual(null);
	})
	it("Expect undefined boolean to equal true",function(){
		var un: any;
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
  

  it('Expect copy(obj) to copy arr:[] as-is ',function(){
		var val = {
			ii:'11',
			obj:{
        arr:[
          {a:1,b:2},
          {a:1,b:2,c:3},
          {a:1,b:2,c:3,d:4},
        ]
      }
		}
		var ds = {
			ii:DataShape.integer(),
			obj: {
        arr:[] as any[]
      }
		}

		var c = DataShape.copy(val,ds);
		expect(JSON.stringify(c)).toEqual(JSON.stringify({
			ii:11,
			obj:{
        arr:[
          {a:1,b:2},
          {a:1,b:2,c:3},
          {a:1,b:2,c:3,d:4},
        ]
      }
		}));
  })
  
  it('Expect copy(obj) to copy arr:null as-is ',function(){
		var val = {
			ii:'11',
      obj:{
        arr:[
          {a:1,b:2},
          {a:1,b:2,c:3},
          {a:1,b:2,c:3,d:4},
        ]
      }
		}
		var ds: any = {
			ii:DataShape.integer(),
			obj: {
        arr:null
      }
		}

		var c = DataShape.copy(val,ds);
		expect(JSON.stringify(c)).toEqual(JSON.stringify({
			ii:11,
			obj:{
        arr:[
          {a:1,b:2},
          {a:1,b:2,c:3},
          {a:1,b:2,c:3,d:4},
        ]
      }
		}));
	})

	it('Expect ret copy(obj, template, true)== obj when template has simple array',function(){
		var a = {
			a:"some text",
			b:1,
			c:[1,2],
		}
		var t = {
			a:null as any,
			b:null as any,
			c:[] as any[],
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
			a:null as any,
			b:null as any,
			c:[{d:null as any,e:null as any,f:null as any}],
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
			a:null as any,
			b:null as any,
			c:[{d:null as any,e:null as any,f:null as any}],
		}
		
		expect(function (){DataShape.copy(a,t,true)}).toThrow();
	})

	it('Expect ret copy(obj, template, true) to NOT thow error when template has complex array and obj array is empty',function(){
		var a = {
			a:"some text",
			b:1,
			c:[] as any[],
		}
		var t = {
			a:null as any,
			b:null as any,
			c:[{d:null as any,e:null as any,f:null as any}],
		}
		var c = DataShape.copy(a,t,true)
		expect(function (){DataShape.copy(a,t,true)}).not.toThrow();
	})

	it('Expect ret copy(obj, template, true) to NOT thow error when template has simple property and obj property is complex',function(){
		var a = {
			a:"some text",
			b:1,
			c:[{d:'fftyh',e:{u:'r',uu:{ff:"fff"}},f:'gghg'}],
		}
		var t = {
			a:null as any,
			b:null as any,
			c:[{d:null as any,e:null as any,f:null as any}],
		}
		expect(function (){DataShape.copy(a,t,true)}).not.toThrow();
	})

	it('Expect ret copy(obj, template, true) to NOT thow error when template has empty array and obj array elems are complex',function(){
		var a = {
			a:"some text",
			b:1,
			c:[{d:'fftyh',e:{u:'r',uu:{ff:"fff"}},f:'gghg'}],
		}
		var t = {
			a:null as any,
			b:null as any,
			c:[] as any[],
		}
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
			a:null as any,
			b:null as any,
			c:[{d:'fftyh',e:{u:'r',uu:{ff:"fff"}},f:'gghg'}],
		}
		expect(function (){DataShape.copy(a,t,true)}).toThrow();
	})
});