import { Override } from "../../core/helpers";

function test(a){
	return " AAA:"+a;
}

describe('test Override function chain',function(){
	it("",function(){

		expect(test(0)).toEqual(" AAA:0");
		
		test = Override(null, test, (next, o )=>{
			return " BBB:" + o + next();
		})

	 	expect(test(1)).toEqual(" BBB:1 AAA:1");

		test = Override(null, test, (next, o)=>{
			return " CCC:" + o + next();
		})

		expect(test(2)).toEqual(" CCC:2 BBB:2 AAA:2");

		

	})
});