var express = require('express');
var router	= express.Router();
var request = require('request');

// Number of asynchronous requests to be made to "https://randomuser.me/api"
var numberOfAsyncReq 	= 10;
// Global variable to store user profile in memory
var randomUserList 		= [];


router.get('/', function (req, res) {
	res.status(200).send("Welcome to our restful API");
});

// This endpoint makes 10 asynchronous requests to "https://randomuser.me/api"
// and retrieves 10 different user records and stores them in memory. 
// Each request adds 10 NEW user records to in memory
router.get('/users', function (req, res) {

	// create a promise to fetch random user information from
	// randomuser.me/api
	let getRandomUser = function () {
		
		return new Promise(function (resolve, reject) {
			
			try {
				request.get('https://randomuser.me/api', function (error, response, body) {
					if (error) {
						reject(error);
					}

					try {
						// Convert a string array json object to an array with the first element
						// being the fetched user object
						result = JSON.parse(body)["results"][0];


						let userProfile = {
							gender: result.gender,
							firstname: result.name.first,
							city: result.location.city,
							email: result.email,
							cell: result.cell
						}

						resolve(userProfile);

					} catch (error) {
						reject(error);
					}

				});

			} catch (error) {
				reject(error);
			}
		});
		
	}

	var fetchedUserList = [];
	for (var i = 0; i < numberOfAsyncReq; i++) {
		fetchedUserList.push(getRandomUser());	
	}

	// Once all 10 random user profile is fetched from the
	// randomuser.me/api, add the user profile to the global 
	// randomUserList variable
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

// Takes in user data and stores in memory and be visible by GET endpoints.
router.post('/users', function (req, res) {
	try {

		// Take the parameter value from the request
		// and define a userProfile object
		var userProfile = {
			gender: req.body.gender,
			firstname: req.body.first,
			city: req.body.city,
			email: req.body.email,
			cell: req.body.cell
		}

		// Add userProfile object to randomUserList array in memory
		randomUserList.push(userProfile);

		res.status(201).send("User successfully created!");

	} catch (error) {
		res.status(400).send("Error: Unable to create user!");
	}
});

//  Filter through existing memory storage and find user by `:firstname` value.
router.get('/users/firstname/:firstname', function (req, res) {
	try {

		var firstname = req.params.firstname;

		// Searches the array of object by firstname to find the index.
		// If index is < 0, the object with firstname is not found
		// If index >= 0, return the object in that index
		var elementPos = randomUserList.map(function(x) {
			return x.firstname
		}).indexOf(firstname);

		if (elementPos < 0) {
			res.status(404).send("User not found!");
		} else {
			res.status(200).send(randomUserList[elementPos]);
		}
	} catch (error) {
			res.status(400).send("Error. Bad request!");
	}
});


module.exports = router;