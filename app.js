// implementing modules
// IIFE, imediately invoked function
// scope not visable from the outside 



// BUDGET CONTROLLER: 
// 
//
//
// separation of concerns: each part of the application should only be interested in doing one thing independantly
var budgetController = (function() {
	// Private Methods
	// function contructures to hold multiple objects
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	}; 

	Expense.prototype.calcPercentage = function (totalIncome) {
		if(totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function () {
		return this.percentage;
	};

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	// calculate the total expenses and incomes
	var calculateTotal = function (type) {
		// 
		var sum = 0;

		/* example: 
			0
			[200, 400, 100]
			sum = 0 + 200;
			sum = 200 + 400;
			sum = 600 + 100 = 700
		*/

		data.allItems[type].forEach(function (cur) {
			sum += cur.value;
		});
		data.totals[type] = sum;
	};

	// object for all the data
	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc:0
		},
		budget: 0,
		percentage: -1
	};

	return {
		// Public Methods
		addItem: function(type, des, val) {
			var newItem, ID;

			// [1 2 3 4 5], next ID = 6
			// [1 2 4 6 8], next ID = 9
			// ID = last ID + 1

			// Create new ID
			if(data.allItems[type].length > 0 ) {
				ID = data.allItems[type][data.allItems[type].length -1].id + 1;
			} else {
				ID = 0;
			}

			// Create new item base on 'inc' or 'exp' type
			if(type === 'exp') {
				newItem = new Expense(ID, des, val);
			} else if(type === 'inc') {
				newItem = new Income(ID, des, val);
			} 

			// Push it into our data structure
			data.allItems[type].push(newItem);

			// Return the new element
			return newItem;
		}, 

		deleteItem: function (type, id) {

			var ids, index;
			// id = 3 
			// data.allItems[type][id];
			// ids = [1 2 4 6 8]
			// index = 3

			ids = data.allItems[type].map(function (current) {
				return current.id;
			});

			index = ids.indexOf(id);

			if(index !== -1) {
				data.allItems[type].splice(index, 1);
			}

		},

		calculateBudget: function () {

			// Calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			// Calculate budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;

			// Calculate the percentage of income that we spent
			// total expenses divided by the total incomes
			if(data.totals.inc > 0) { // You can't divide by zero
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1; // means there is no percentage 
			}
			// Expense = 100 and income 300, spent 33.333% = 100/300 = 0.3333 * 100
		},

		calculatePercentages: function () {
			
			/*
				a=20
				b=10
				c=40
				income = 100
				a=20/100=20%
				b=10/100=10%
				c=40/100=40%
			*/ 

			data.allItems.exp.forEach(function (cur) {
				cur.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function () {
			var allPerc = data.allItems.exp.map(function (cur) {
				return cur.getPercentage();
			});
			return allPerc;
		},

		getBudget: function () {
			// Public function
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},

		testing: function() {
			console.log(data);
		}
	};

})();


// UI CONTROLLER: 
// 
//
//
var UIController = (function() {

	// storage data structure
	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	
	var formatNumber = function (num, type) {
		var numSplit, int, dec;

		/*
			+ or - before number
			exactly 2 decimal points
			comma separating the thousands
			ex.
			2310.4567 -> + 2,310.46
			2000 -> + 2,000.00
		*/
		
		// set the num to its the absolute value
		num = Math.abs(num);
		// set the decimal point to 2 digits
		num = num.toFixed(2);

		numSplit = num.split('.');

		int = numSplit[0];

		if(int.length > 3) {
			// input 23510, output 23,510
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
		}

		dec = numSplit[1];

		// teranary opperator instead of the if statement
		//type === 'exp' ? sign = '-' : sign = '+';
		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
	};

	var nodeListForEach = function (list, callback) {
		for(var i = 0; i < list.length; i++) {
			callback(list[i], i);
		} 
	};
	
	/*
	var formatNumber = function(num, type) {
        
        var numSplit, int, dec, resultArr;

        num = Math.abs(num); // returns the absolute value of a number
        num = num.toFixed(2); // converts number into a string, keeping only two decimals
        
        numSplit = num.split("."); // divide inputed number in 2 parts: numbers before decimal dot, and numbers AFTER the decimal dot
        
        int = numSplit[0].split(""); // split the number into an array
        
        dec = numSplit[1];
        
        resultArr = [];
        
        for (var i = int.length - 1; i >= 0; i--) {
    		// then looped backwards over each digit in the array, inserting commas in front of every 3rd digit
          if ((int.length - i) % 3 === 1 && i !== int.length - 1) {
            resultArr.unshift(",");
          }
          resultArr.unshift(intArr[i]); // adds new items to the beginning of an array
        }
        
        return (type === "inc" ? '+ ' : "- ") + resultArr.join("") + "." + dec;
        // used the join method to convert the array back into a string.
    };
	*/

	return {
		// Public Methods
		getInput: function () { 
			return {
				type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
				description: document.querySelector(DOMstrings.inputDescription).value,
				// convert this string into a floating point number 
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		addListItem: function (obj, type) {
			// Create html string with placholder text
			var html, newHtml, element;
			if(type === 'inc') {
				element = DOMstrings.incomeContainer;

				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';	
			} else if (type === 'exp') {
				element = DOMstrings.expenseContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			
			// Replace the placeholder tesxt with some actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			// Insert HTML into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		deleteListItem: function (selectorID) {
			// remove child element 
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		clearFields: function () {
			var fields, fieldsArr;

			// Creates a list of the DOMstrings
			//fields = document.querySelectorAll(DOMstrings.inputType + ', ' + DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

			// Convert the DOMstrings list into an array to hold the DOMstrings
			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function (current, index, array) {
				current.value = "";
			});

			fieldsArr[0].focus();
		},

		displayBudget: function (obj) {
			
			var type;

			obj.budget > 0 ? type = 'inc' : type = 'exp';

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
			

			if(obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},

		displayPercentages: function (percentages) {
			
			// returns a node list
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

			

			nodeListForEach(fields, function (current, index) {
				
				if(percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}

			});

		},

		displayMonth: function () {
			
			var now, year, month, months;
			now = new Date();

			//var christmas = new Date(2016, 11, 25);

			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			month = now.getMonth();

			year = now.getFullYear();
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

		},

		changeType: function () {
			
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ',' + 
				DOMstrings.inputDescription + ',' +
				DOMstrings.inputValue);

			nodeListForEach(fields, function (cur) {
				cur.classList.toggle('red-focus');

			});

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},

		setInitType: function () {
			
			document.querySelector(DOMstrings.inputType).value = 0;
		},

		getDOMstrings: function () {
			return DOMstrings;
		}
	};

})();


// GLOBAL APP CONTROLLER 
// We will pass the other two modules as arguments into the controller 
// So that this controller know about the other two controllers and can connect them
// 
//
//
var controller = (function(budgetCtrl, UICtrl) {
	// Private Methods
	var setupEventListeners = function() {
		
		// 
		var DOM = UICtrl.getDOMstrings();
		// click event listener
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		// global document event listener
		document.addEventListener('keypress', function(event) {
			//console.log(event);
			if(event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
	};

	var updateBudget = function (argument) {

		// 1. Calculate the budget
		budgetCtrl.calculateBudget();

		// 2. return the budget
		var budget = budgetCtrl.getBudget();

		// 3. Display the budget on the UI
		UICtrl.displayBudget(budget);
	};

	var updatePercentages = function () {
		
		// 1. Calculate percentages
		budgetCtrl.calculatePercentages();

		// 2 .Read percentages from budget controller
		var percentages = budgetCtrl.getPercentages();

		// 3. Update the UI with the new percentages
		UICtrl.displayPercentages(percentages);
	};
	
	var ctrlAddItem = function () {
		
		var input, newItem;

		// 1. Get the filled input data
		input = UICtrl.getInput();

		if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
			
			// 2. Add item to the budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			// 3. Add the item to the UI
			UICtrl.addListItem(newItem, input.type);

			// 4. Clear the fields
			UICtrl.clearFields();
			
			// 5. Calculate and update the budget
			updateBudget();

			// 6. Calculate and update percentages
			updatePercentages();
		}
	};

	var ctrlDeleteItem = function (event) {
		var itemID, splitID, type, ID;

		// traverse the DOM to the element we need
		itemID = event.target.parentNode.parentNode.parentNode.id;

		if(itemID) {

			// inc-1
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			// 1. delete the item from the data structure
			budgetCtrl.deleteItem(type, ID);

			// 2. Delete the item from the UI
			UICtrl.deleteListItem(itemID);

			// 3. Update and show the new budget
			updateBudget();

			// 4. Calculate and update percentages
			updatePercentages();
		}
	};

	return {
		// Public Method
		init: function () {
			console.log("application has started.");
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventListeners();
			
			//UICtrl.setInitType();
			
		}
	};

})(budgetController, UIController);



controller.init();