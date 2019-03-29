$(function() {
	var testType = 'addition';
	
	var testTypeId = '';
	var operand2min = 0;
	var operand2max = 0;
	var timer;
	var secondsAllowed = 0;
	var secondsElapsed = 0;

	var numCorrect = 0;
	var numCompleted = 0;
	var numTotal = 0;
	
	function refresh() {
		$('#main').show();
		$('#problems').hide();
		$('#results').hide();		
		
		$('#menu li').removeClass('selected');
		$('#menu #' + testType).addClass('selected');
		
		$('#row0').toggle(testType != 'division'); // can't divide by zero
		
		$('#facts div').each(function() {
			testTypeId = this.id
			numCorrect = localStorage[testType + 'score' + testTypeId];
			numTotal = getTotal(testTypeId);
			secondsElapsed = localStorage[testType + 'time' + testTypeId];
			rating = localStorage[testType + 'rating' + testTypeId];
						
			var ratingImage = 'no_image';
			if (numTotal == 20 && rating == 'Fair') {
				ratingImage = 'flag_bronze';
			} else if (numTotal == 20 && rating == 'Good') {
				ratingImage = 'flag_silver';
			} else if (numTotal == 20 && rating == 'Perfect') {
				ratingImage = 'flag_gold';
			} else if (numTotal == 50 && rating == 'Fair') {
				ratingImage = 'medal_bronze';
			} else if (numTotal == 50 && rating == 'Good') {
				ratingImage = 'medal_silver';
			} else if (numTotal == 50 && rating == 'Perfect') {
				ratingImage = 'medal_gold';			
			} else if (numTotal == 100 && rating == 'Fair') {
				ratingImage = 'crown_bronze';
			} else if (numTotal == 100 && rating == 'Good') {
				ratingImage = 'crown_silver';
			} else if (numTotal == 100 && rating == 'Perfect') {
				ratingImage = 'crown_gold';			
			}
			
			var ratingHtml = '';
			if (rating == undefined) {
				var locked = false;
				$('.' + testTypeId + '_req').each(function() {
					var prerequisiteRating = localStorage[testType + 'rating' + this.id];
					if (prerequisiteRating == undefined) { locked = true; }
				});
				if (locked) {
					ratingHtml = 'Locked';
					$(this).addClass('locked');
				} else {
					ratingHtml = '????';
					$(this).removeClass('locked');
				}
			} else {
				ratingHtml += '<img src="img/' + ratingImage + '.png" alt="' + ratingImage + '" />';
				ratingHtml += ' (' + numCorrect + '/' + numTotal + ') ' + getTime(secondsElapsed);
				
				// if (rating == 'Perfect') { $(this).addClass('locked'); }
			}
			$(this).html(ratingHtml);
		});
	}
	refresh();
	
	$('#menu li').click(function() {
		testType = this.id;
		refresh();
	});
	
	$('.start').click(function() {
		if ($(this).hasClass('locked')) { return; }
	
		numCorrect = 0;
		numCompleted = 0;
		secondsElapsed = 0;
		
		testTypeId = this.id;
		operand2min = parseInt(testTypeId.substr(0,1));
		operand2max = parseInt(testTypeId.substr(1,1));
		numTotal = getTotal(testTypeId);
		
		$('#main').hide();
		$('.numCorrect').html(numCorrect);
		$('.numCompleted').html(numCompleted);
		$('.numTotal').html(numTotal);
		nextProblem();
		$('#problems').show();
		$('#finish').hide();
		
		if (numTotal == 20) {
			secondsAllowed = 120;
		} else if (numTotal == 50) {
			secondsAllowed = 240;
		} else if (numTotal == 100) {
			secondsAllowed = 360;
		} else { // just for testing
			secondsAllowed = 10;
		}
		$('#time').html(getTime(secondsAllowed));
		
		timer = setInterval(function() {
			secondsElapsed++;
			$('#time').html(getTime(secondsAllowed - secondsElapsed));
			
			if (secondsElapsed == secondsAllowed) {
				clearInterval(timer);
				showResults();
			}
		}, 1000);
	});
	
	function getTotal(testTypeId) {
		return parseInt(testTypeId.substr(3, testTypeId.length - 3))
	}
	
	function getTime(numSeconds) {
		var minutes = Math.floor(numSeconds / 60);
		var seconds =  numSeconds - (minutes * 60);
		if (seconds < 10) { seconds = '0' + seconds; }
		return minutes + ':' + seconds;
	}

	$('#answers li').hover(function() {
		if($(this).hasClass('wrongSelected') || $('#finish').is(':visible')) { return; }
		$(this).addClass('hover');
	}, function () {
		$(this).removeClass('hover');
	});
	
	$('body').keypress(function(e) {
		if (!($('#answers').is(':visible')) || $('#finish').is(':visible')) { return; }
		
		var character = String.fromCharCode(e.keyCode);
		
		if (character == 'a') {
			checkAnswer($('#answer0'))
		} else if (character == 's') {
			checkAnswer($('#answer1'))
		} else if (character == 'd') {
			checkAnswer($('#answer2'))
		} else if (character == 'f') {
			checkAnswer($('#answer3'))
		}
	});
	
	$('#answers li').click(function() {
		if ($('#finish').is(':visible')) {
			return;
		} else {
			checkAnswer(this);
		}
	});
	
	function checkAnswer(selectedItem) {
		if ($(selectedItem).hasClass('correct')) {
			if (!($('#wrongAnswerMessage').is(':visible'))) {
				numCorrect++;
			}
			
			$('#wrongAnswerMessage').hide();
			numCompleted++;
			$('.numCorrect').html(numCorrect);
			$('.numCompleted').html(numCompleted);
			
			if(numCompleted == numTotal) {
				clearInterval(timer);
				$('#finish').show();
			} else {
				nextProblem();
			}
		} else { // must be a wrong answer
			$('#wrongAnswerMessage').show();
			$(selectedItem).addClass('wrongSelected');
			$(selectedItem).removeClass('hover');
		}
	}
	
	function nextProblem() {
		$('#wrongAnswerMessage').hide();
		$('#answers li').removeClass('correct wrong wrongSelected');
	
		var operand2 = Random(operand2min, operand2max);
		var operand1 = getOperand1(operand2);	
		var operator = getOperator();
		
		$('#operand1').html(operand1);
		$('#operator').html(operator);
		$('#operand2').html(operand2);
		
		var correctAnswer = getCorrectAnswer(operand1, operand2);
		var correctAnswerIndex = Random(0, 3);
		//if the index is less than the answer, select another index to avoid negative numbers
		while (correctAnswer < correctAnswerIndex) {
			correctAnswerIndex = Random(0, 3);
		}
		for (i = 0; i < 4; i++) {
			if (i == correctAnswerIndex) {
				$('#answer' + i).html(correctAnswer).addClass('correct');
			} else {
				$('#answer' + i).html(correctAnswer - (correctAnswerIndex - i)).addClass('wrong');
			}
		}
	}
	
	function getOperand1(operand2) {
		if (testType == 'addition' || testType == 'multiplication') {
			return Random(0,9);
		} else if (testType == 'subtraction') {
			return Random(operand2, operand2 + 9);
		} else if (testType == 'division') {
			return operand2 * Random(0,9);
		}
	}

	function getOperator() {
		if (testType == 'addition') {
			return '+';
		} else if (testType == 'subtraction') {
			return '&minus;';
		} else if (testType == 'multiplication') {
			return '&times;';
		} else if (testType == 'division') {
			return '&divide;';
		}
	}
	
	function getCorrectAnswer(operand1, operand2) {
		if (testType == 'addition') {
			return operand1 + operand2;
		} else if (testType == 'subtraction') {
			return operand1 - operand2;
		} else if (testType == 'multiplication') {
			return operand1 * operand2;
		} else if (testType == 'division') {
			return operand1 / operand2;
		}
	}
	
	function Random(minVal, maxVal) {
		return Math.floor((Math.random() * (maxVal - minVal + 1)) + minVal);
	}
	
	$('#finish').click(function() {
		showResults();
	});
	
	function showResults() {
		$('#outOfTime').toggle(secondsElapsed == secondsAllowed);
		
		if (numCorrect == numTotal) {
			$('#resultMessage').html('Perfect!');
			rating = 'Perfect';
		} else if (numCorrect / numTotal >= .9) {
			$('#resultMessage').html('Great Job!');
			rating = 'Good';
		} else if (numCorrect / numTotal >= .8) {
			$('#resultMessage').html('Not Bad...');
			rating = 'Fair';
		} else {
			$('#resultMessage').html('Try Again...');
			rating = 'Poor';
		}
		
		var updateRating = false;
		var oldScore = localStorage[testType + 'score' + testTypeId];
		var oldTime = localStorage[testType + 'time' + testTypeId];
		
		if (oldScore == undefined || numCorrect > oldScore || (numCorrect == oldScore && secondsElapsed < oldTime)) {
			localStorage[testType + 'score' + testTypeId] = numCorrect;
			localStorage[testType + 'time' + testTypeId] = secondsElapsed;
			localStorage[testType + 'rating' + testTypeId] = rating;
		}
		
		$('#problems').hide();
		$('#results').show();
	}
	
	$('#backToMenu').click(function() {
		var returnToMenu = confirm('Are you sure you want to return to the main menu?');
		if (returnToMenu) {
			clearInterval(timer);
			refresh();
		}
	});
	
	$('#backToMenu2').click(function() {
		refresh();
	});
	
	$('#clearData').click(function() {
		var clearData = confirm('Are you sure you want to erase all the saved data?');
		if (clearData) {
			localStorage.clear();
			refresh();
		}
	});
});