// MODEL budget  controller
let budgetController = (function(){
	
	let Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	// one func calc % and the other returns it
	Expense.prototype.calcPercentage = function(totalIncome){
		if(totalIncome > 0){
			this.percentage = Math.round((this.value / totalIncome) *100);
		}else{
			this.percentage = -1;
		}
	};
	// get % method, returns function
	Expense.prototype.getPercentage = function(){
		return this.percentage;
	};

	let Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	let calcTotal = function(type){
			let sum;
			sum = 0;
			data.allItems[type].forEach(function(current, index, array){
				sum += current.value;
			});
			/* [200,150,9]
			sum = 0 + 200;
			sum = 200 + 150;
			sum = 350 + 9;
			*/
			data.totals[type] = sum;
		}

	let data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals:{
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage : -1
	};



	return {
		addItem: function(type, des, val) {
			let newItem;
			// new ID
			if (data.allItems[type].length >0){
				ID = data.allItems[type][data.allItems[type].length-1].id+1;
			} else{
				ID = 0;
			}
			// create based on type
			if(type === 'exp'){
				newItem = new Expense(ID, des, val);
			} else {
				newItem = new Income(ID, des, val);
			}
			// push into structure
			data.allItems[type].push(newItem);
			// return the new elm
			return newItem;
		},
		deleteItem: function(type, id){
			let ids, index;
			ids = data.allItems[type].map(function(current){
				return current.id;
			});
			index = ids.indexOf(id);
			//del item from array
			if(index !== -1){
				data.allItems[type].splice(index, 1);
			}
		},
		calculateBudget: function(){
			// calc total income and exp
			calcTotal('exp');
			calcTotal('inc');
			// calc budget inc - exp
			data.budget = data.totals.inc - data.totals.exp;
			// calc percent of inc we spend
			if(data.totals.inc > 0){
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
			// example: 100 exp, inc 200 -> spend 50% of income
		},
		calculatePercentages: function() {
			// calc each exp by total exps + add new menthod to exp prototype
			// forEach method
			data.allItems.exp.forEach(function(currentItem){
				currentItem.calcPercentage(data.totals.inc);
			});
		},
		getPercentages: function(){
			// call get % method on each exp + return something storage => MAP
			let allPercentages = data.allItems.exp.map(function(current){
				return current.getPercentage();
			});
			return allPercentages; // returns new array
			console.log(allPercentages);
		},

		// return from data structure
		getBudget: function(){
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},
		testing: function(){
			console.log(data);
		}
	};

})();


// VIEW UI controller
let UIController = (function(){
	let DOMstrings = {
		inputType: '.add__type',
		inputDesc: '.add__description',
		inputVal: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incLabel: '.budget__income--value',
		expLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercentageLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};
	let formatNumber =  function(num, type){
			let numSplit, int, dec, sign;
			// + - before num, with 2 decimal points and comma separation in thousands
			num = Math.abs(num);
			num = num.toFixed(2); // method of number prototype primitives have methods-cast to obj

			numSplit = num.split('.');

			int = numSplit[0];
			if(int.length > 3){
				int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3);
			}
			dec = numSplit[1];
			//type === 'exp' ? sign = '-': sign = "+";
			//return type + ' ' + int + dec;
			return (type === 'exp' ? sign = '-':"+") + ' ' + int + '.' + dec;
		};

		let nodeListForEach = function(list, callback){
				for(let i = 0; i < list.length; i++){
					callback(list[i], i);
				}
			};
	
	return {
		getInput: function() {
			return {
			type: document.querySelector(DOMstrings.inputType).value,
			description: document.querySelector(DOMstrings.inputDesc).value,
			value: parseFloat(document.querySelector(DOMstrings.inputVal).value) // convert to float
			};
		},

		addListItem: function(obj, type){
			let html, newHtml, element;
			//1. create html string with placeholder text
			if (type === 'inc'){
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			} else if(type === 'exp'){
				element = DOMstrings.expensesContainer;
			html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>' 
			}
			//2. replace the placeholder text with actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
			//3. insert html into dom
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},
		deleteListItem: function(selectorID){
			let el = document.getElementById(selectorID);
			el.parentNode.removeChild(el); // parentNode of el and remove its child
		},
		clearFields: function() {
			let fields, fieldsArray;
			fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputVal); // returns a list
			fieldsArray = Array.prototype.slice.call(fields); // now thinks it's array

			fieldsArray.forEach(function(currentValue, index, array){
				currentValue.value = "";
			});
			fieldsArray[0].focus();
		},
		showBudget: function(obj){
			let type;
			obj.budget > 0 ? type = 'inc' : type = "exp";
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incLabel).textContent = formatNumber(obj.totalInc, type);
			document.querySelector(DOMstrings.expLabel).textContent = formatNumber(obj.totalExp, type);

			if(obj.percentage > 0){
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';

			}
		},
		displayMonth: function() {
			let now, year, month, months;
			now = new Date();
			months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			year = now.getFullYear();
			month = now.getMonth();
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' / ' + year;
		},

		displayPercentages: function(percentages) {
			let fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel); // returns node list
			
			

			nodeListForEach(fields, function(current, index){
				if(percentages[index] > 0){
					current.textContent = percentages[index] + '%';
				}else{
					current.textContent = '***';
				}
			});
		},
		changeType: function(){
			let fields;
			fields = document.querySelectorAll(
				DOMstrings.inputType + ',' +
				DOMstrings.inputDesc + ',' +
				DOMstrings.inputVal); // returns node List
			nodeListForEach(fields, function(cur){
				cur.classList.toggle('red-focus');
			});
			document.querySelector(DOMstrings.inputBtn).classList.toggle('.red');
		},

		getDOMStrings: function(){
			return DOMstrings;
		}
	};

})();



// CONTROLLER global app
let controller = (function(budgetCtrl,UICtrl){

	let setupEventListener = function(){
	let DOM = UICtrl.getDOMStrings();
	document.querySelector(DOM.inputBtn).addEventListener('click', cntrlAddItem);

	document.addEventListener('keypress', function(e) {
		if(e.keyCode === 13){
		cntrlAddItem();
		}
	});
	document.querySelector(DOM.container).addEventListener('click', cntrlDeleteItem);

	document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
	};

	let updateBudget = function(){
		let budget;
		// calculates budget 
		budgetCtrl.calculateBudget();
		// returns budget
		budget = budgetCtrl.getBudget();
		// disply budget on UI
		//console.log(budget);
		UICtrl.showBudget(budget);
	};

	let updatePercentages = function(){
		// similar to update budget
		// calc %
		budgetCtrl.calculatePercentages();
		// read them from controller
		let percentages = budgetCtrl.getPercentages();
		// update UI
		UICtrl.displayPercentages(percentages);
		console.log(percentages);
	}

	let cntrlAddItem = function(){
		let input, newItem;
		// get field input data
		input = UICtrl.getInput();
		// all 3 correct
		if(input.description !=="" && !isNaN(input.value) && input.value > 0) {
		// add item to budget controller
		newItem = budgetCtrl.addItem(input.type, input.description, input.value);
		// add new item to UI
		UICtrl.addListItem(newItem, input.type);
		// clear the fields
		UICtrl.clearFields();
		// calculate and update budget
		updateBudget();
		// calc and update %
		updatePercentages();
		}
		
	};

	let cntrlDeleteItem = function(event) {
		let itemID, splitID, type, ID;
		itemID = event.target.parentNode.parentNode.parentNode.id;
		console.log(event.target);
		console.log(itemID);
		if(itemID){
			// tyoe inc or exp and unique ID value
			// inc-1
			splitID = itemID.split('-');
			type = splitID[0]; 
			ID = parseInt(splitID[1]); // returns a string needs to be cast as int
			// delete item from data
			budgetCtrl.deleteItem(type, ID);
			// delete item from UI
			UICtrl.deleteListItem(itemID);
			// update budget totals
			updateBudget();
			// calc and update %
			updatePercentages();
		}
	};
	
	
	return {
		init: function(){
			console.log('app began');
			UICtrl.displayMonth();
			UICtrl.showBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventListener();
		}
	}

})(budgetController, UIController);

controller.init();