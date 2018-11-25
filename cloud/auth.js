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
        userQuery.find().then((users) => {
            if (users.length == 0) {
                //user doesn't exist, create new
                var newUser = new Parse.User()
                newUser.set("username", userInfo.phone.number)
                newUser.set("password", password)
                newUser.set("phone", userInfo.phone.number)
                newUser.signUp().then((newUser) => {
                    //created parse user, now create firebase user
                    main.firebaseAdmin.auth().createCustomToken(userInfo.id)
                        .then(function (customToken) {
                            //generated custom token, return both tokens to user
                            let tokens = newUser.getSessionToken() + "," + customToken
                            res.success(tokens)
                        }).catch(function (error) {
                            //error generating token
                            console.log("error creating custom token " + error)
                            res.error("error creating custom token")
                        })
                }, (error) => {
                    //error occured signing up
                    console.log("error creating user " + error)
                    res.error("error creating user")
                })
            }

            //user already exists, return
            else {
                console.log("user already exists")
                res.error("user already exists")
            }
        }, (error) => {
            console.log("error finding users " + error)
            res.error("error getting users")
        })
    }).catch(function (error) {
        console.log("error validating token " + error)
        res.error("error getting user information")
    })
})