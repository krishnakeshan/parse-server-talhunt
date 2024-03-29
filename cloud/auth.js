const objects = require("./objects")
const request = require("request-promise-native")
const main = require("./main")

//function to create user account with phone number
Parse.Cloud.define("createUserAccount", function (req, res) {
    var params = req.params
    var phoneNumber = params.phoneNumber
    var password = params.password

    //first check if user with this number already exists
    var userQuery = new Parse.Query(Parse.User)
    userQuery.equalTo("phoneNumber", phoneNumber)
    userQuery.find(objects.useMasterKeyOption).then((users) => {
        //query executed
        if (users.length == 0) {
            //setup name and nameLowerCase variables
            var name = params.firstName + " " + params.lastName
            var nameLowerCase = name.toLowerCase()

            //user doesn't exist, create new
            var newUser = new Parse.User()
            newUser.set("username", phoneNumber)
            newUser.set("password", password)
            newUser.set("phone", phoneNumber)
            newUser.set("firstName", params.firstName)
            newUser.set("lastName", params.lastName)
            newUser.set("name", name)
            newUser.set("nameLowerCase", nameLowerCase)
            newUser.set("profileType", params.profileType)
            newUser.set("coachType", "")
            newUser.set("gender", params.gender)
            newUser.set("age", params.age)
            newUser.set("city", params.city)
            newUser.set("sports", [])
            newUser.set("subSports", {})
            newUser.set("positions", {})
            newUser.set("country", params.country)
            newUser.set("support", 0)
            newUser.set("supporting", 0)

            //sign up user
            newUser.signUp(null, objects.useMasterKeyOption).then((newUser) => {
                res.success({
                    'result': true,
                    'parseSessionToken': newUser.getSessionToken()
                })
            }, (error) => {
                //error occured signing up
                console.log("error creating user " + error)
                res.success({
                    'result': false,
                    'reason': 'error creating user ' + error
                })
            })
        } else {
            console.log("user already exists")
            res.success({
                'result': false,
                'reason': 'account with this number already exists'
            })
        }
    }).catch((error) => {
        console.error("error finding user objects")
        res.error({
            'result': false,
            'reason': 'error finding user objects ' + error
        })
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

//method to update coach type
Parse.Cloud.define("updateCoachType", function (req, res) {
    var params = req.params
    var userId = params.userId
    var coachType = params.coachType

    //get user object
    var userQuery = new Parse.Query(Parse.User)
    userQuery.get(userId, objects.useMasterKeyOption).then((userObject) => {
        //got user object, save coach type
        userObject.set("coachType", coachType).save(null, objects.useMasterKeyOption).then((savedObject) => {
            //saved user object, return
            res.success("saved")
        }, (error) => {
            //error saving user object
            console.log("error saving user object " + error)
            res.error("error saving user object " + error)
        })
    }, (error) => {
        //error getting user object
        console.log("error getting user object " + error)
        res.error("error getting user object " + error)
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