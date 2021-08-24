//banch 1

// Primises

// const codeblocker = () => {
// 	// return new Promise((resolve, reject) => {
// 	// 	let i = 0;
// 	// 	while( i < 1000 ){i++;}
// 	// 	resolve('done'); 
// 	// })
// 	return Promise.resolve().then(c => {
// 		let i = 0;
// 		while( i < 1000 ){i++;}
// 		return 'done';
// 	})
// }

//remote


// console.log('oo');
// codeblocker().then(x=>{console.log(x)});
// console.log('2');

 // async await function

// const getFruits = async(name) => {
// 	const fruits = {
// 		pineapple : "pin",
// 		apple : "app",
// 		banana : "ban"
// 	}

// 	return fruits[name];
// }

// const makeSmoothie = async() => {
// 	const a = getFruits('apple');
// 	const b =  getFruits('banana');
// 	const sm = Promise.all([a,b]);
// 	return sm;
// }

// makeSmoothie().then(x=>console.log(x));

// const fruitInsp = async() => {
// 	if(await getFruits('pineapple') == "pin"){
// 		console.log('pineapple');
// 	}
// }

// fruitInsp();

// async function test(){
// 	let promise = new Promise((resolve, reject) => {
// 		setTimeout(() => resolve('done'), 2000);
// 	});
// 	return result = await promise;
	
// }

// test().then(x => console.log(x))





// simple javasctipt

// (function foo(){})();

// console.log(foo());

// old code for getting range
/*
let range = [{ low: 4, high: 5 }, { low: 7, high: 8 }, { low: 9, high: 10 },{low:13, high:15}, { low: 19, high: 20 }];
let low = 16;
let high = 17;

let highest = 0;
let lowest = 0;
let isValid = true;
let istrue = false;

let checkVlaueExist = range.some(x => x.low == low || x.high == low || x.high == high || x.low == high);


if (!checkVlaueExist) {
    range.forEach(function (v, i) {
    	if(highest == 0){
    		highest = v.high
    	} else {
    		highest = (v.high > highest) ? v.high : highest;
    	}

    	if(lowest == 0){
    		lowest = v.low;
    	} else {
    		lowest = (v.low < lowest) ? v.low : lowest;
    	}


    });


// console.log({"lost": lowest},{"highst": highest});
    if (low < high) {
        if ((low > lowest && low < highest) && (high < highest)) {
            range.forEach(function (v, i) {
                if (isValid) {
                    isValid = checkRange(v, low, high, isValid);
                    if (((low > v.low && low > high) && (high > v.low && high > v.high) || (low < v.low && low < v.high) && (high < v.low && high < v.high))) {
                        istrue = true;
                    } else {
                        istrue = false;
                    }
                } else {
                    istrue = false;
                }


            });

        } else if ((low < lowest) && (high < lowest)) {
        	istrue = true
        } else {
        	alert("Value is not in valid range")
        }
    } else {
        alert("low is higher than high");
    }
} else {
    // alert("low is higher than high");
    alert("Value is not in valid range")
}



function checkRange(v, low, high, isValid) {
    if ((v.low >= low && v.low <= high) && (v.high >= low && v.high <= high)) {
        isValid = false
    } else {
        isValid = true;
    }
    return isValid;
}
console.log(istrue);*/


let range = [{ low: 4, high: 5 }, { low: 7, high: 8 }, { low: 9, high: 10 },{low:13, high:15}, { low: 19, high: 20 }];
let low = 16;
let high = 17;



