const objects = require("./objects")
const request = require("request-promise-native")
const main = require("./main")

//function to create user account with phone number
Parse.Cloud.define("createUserAccount", function (req, res) {
    var params = req.params
    var accessToken = params.accessToken
    var password = params.password

    //validate access token first
    var requestOptions = {
        uri: objects.facebookAPIBaseURL,
        qs: {
            access_token: accessToken
        },
        json: true
    }
    request(requestOptions).then(function (userInfo) {
        //check if user with this information already exists
        var userQuery = new Parse.Query(Parse.User)
        userQuery.equalTo("facebookId", userInfo.id)
        userQuery.find(objects.useMasterKeyOption).then((users) => {
            if (users.length == 0) {
                //user doesn't exist, create new
                var newUser = new Parse.User()
                newUser.set("username", userInfo.phone.national_number)
                newUser.set("password", password)
                newUser.set("facebookId", userInfo.id)
                newUser.set("phone", userInfo.phone.number)
                newUser.set("firstName", params.firstName)
                newUser.set("lastName", params.lastName)
                newUser.set("gender", params.gender)
                newUser.set("city", params.city)
                newUser.set("country", params.country)
                newUser.signUp(null, objects.useMasterKeyOption).then((newUser) => {
                    //created parse user, now create firebase user
                    main.firebaseAdmin.auth().createCustomToken(userInfo.id)
                        .then(function (customToken) {
                            //generated custom token, return both tokens to user
                            let tokens = newUser.getSessionToken() + "," + customToken
                            res.success(tokens)
                        }).catch(function (error) {
                            //error generating token
                            console.log("error creating custom token " + error)
                            res.error("error creating custom token " + error)
                        })
                }, (error) => {
                    //error occured signing up
                    console.log("error creating user " + error)
                    res.error("error creating user " + error)
                })
            }

            //user already exists, return
            else {
                console.log("user already exists")
                res.error("An account already exists with this phone number")
            }
        }, (error) => {
            console.log("error finding users " + error)
            res.error("error getting users " + error)
        })
    }).catch(function (error) {
        console.log("error validating token " + error)
        res.error("error getting user information " + error)
    })
})

//method to login user
Parse.Cloud.define("logInUser", function (req, res) {
    var params = req.params
    var username = params.username
    var password = params.password

    //log user into Parse
    Parse.User.logIn(username, password, objects.useMasterKeyOption).then((loggedInUser) => {
        //signed in user successfully, login to firebase
        main.firebaseAdmin.auth().createCustomToken(loggedInUser.id)
            .then(function (customToken) {
                //logged into Firebase
                let tokens = loggedInUser.getSessionToken() + "," + customToken
                res.success(tokens)
            }).catch(function (error) {
                //error logging into Firebase
                console.log("error logging into Firebase " + error)
                res.error("We're having trouble logging you in. Please try again in sometime.")
            })
    }, (error) => {
        //error signing in user
        console.log("error signing into Parse " + error)
        res.error("We're having trouble logging you in. Please try again in sometime.")
    })
})

//method to save this user's sports details
Parse.Cloud.define("addUserSportsDetails", function (req, res) {
    console.log("Starting addUserSportsDetails")
    var params = req.params
    var userId = params.userId
    var sports = params.sports
    var positions = params.positions

    //get this user's User object
    var userQuery = new Parse.Query(Parse.User)
    userQuery.get(userId, objects.useMasterKeyOption).then((userObject) => {
        //add sports details for this user object
        console.log("got user object")
        userObject.set("sports", sports)
        userObject.set("positions", positions)
        userObject.save(null, objects.useMasterKeyOption).then((savedObject) => {
            //saved user object, return success message
            console.log("saved user object");
            res.success("added sports details")
        }, (error) => {
            //error saving user object, return error message
            console.log("error saving user object")
            res.error("Error Adding Sports Details. Please try again in sometime")
        })
    }, (error) => {
        //error fetching user object
        console.log("error fetching user object " + error)
        res.error("Error Adding Sports Details. Please try again in sometime")
    })
})