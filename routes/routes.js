var express = require('express');
var router	= express.Router();
var request = require('request');

var numberOfAsyncReq 	= 10;
var randomUserList 		= [];


router.get('/', function (req, res) {
	res.status(200).send("Welcome to our restful API");
});

router.get('/users', function (req, res) {

	let getRandomUser = function () {
		
		return new Promise(function (resolve, reject) {
			request.get('https://randomuser.me/api', function (error, response, body) {
				if (error) {
					reject(error);
				}

				result = JSON.parse(body)["results"][0];

				let userProfile = {
					gender: result.gender,
					firstname: result.name.first,
					city: result.location.city,
					email: result.email,
					cell: result.cell
				}

				resolve(userProfile);

			});
		});
		
	}

	var fetchedUserList = [];
	for (var i = 0; i < numberOfAsyncReq; i++) {
		fetchedUserList.push(getRandomUser());	
	}

	Promise.all(fetchedUserList)
	.then(function(results){
		// Add NEW random users fetched to in memory
		randomUserList.push.apply(randomUserList, results);

		res.status(200).send(randomUserList);
	})
	.catch(function(err) {
		res.status(401).send("Error", err);
	});
	
});


router.post('/users', function (req, res) {
	var userProfile = {
		gender: req.body.gender,
		firstname: req.body.first,
		city: req.body.city,
		email: req.body.email,
		cell: req.body.cell
	}

	randomUserList.push(userProfile);

	res.status(201).send("User successfully created!");
});


router.get('/users/firstname/:firstname', function (req, res) {
	var firstname = req.params.firstname;

	var elementPos = randomUserList.map(function(x) {
		return x.firstname
	}).indexOf(firstname);

	if (elementPos < 0) {
		res.status(404).send("User not found!");
	} else {
		res.status(200).send(randomUserList[elementPos]);
	}
});


module.exports = router;