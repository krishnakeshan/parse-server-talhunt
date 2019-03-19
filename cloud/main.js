const objects = require("./objects")
const firebaseAdmin = require("firebase-admin")

//initialize firebase admin
var serviceAccount = require('./talhunt-222414-firebase-adminsdk-zl0gf-20f0a6a161.json')
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: "https://talhunt-222414.firebaseio.com",
    storageBucket: "talhunt-222414.appspot.com"
})

//export firebase variables for external use
var firebaseStorageBucket = firebaseAdmin.storage().bucket()
exports.firebaseAdmin = firebaseAdmin
exports.firebaseStorageBucket = firebaseStorageBucket

//require code from other files
require("./auth")
require("./post")
require("./chat")
require("./notifications.js")

//simple test function
Parse.Cloud.define('hello', function (req, res) {
    res.success("hello defined");
});

//cloud function to let one user support another
Parse.Cloud.define("supportUser", function (req, res) {
    //get params
    var params = req.params
    var from = params.from
    var to = params.to

    //check if this support configuration already exists
    var supportObjectQuery = new Parse.Query(objects.SupportObject)
    supportObjectQuery.equalTo("from", from)
    supportObjectQuery.equalTo("to", to)
    supportObjectQuery.find(objects.useMasterKeyOption).then((supportObjects) => {
        //got support objects, continue if no support objects exist
        if (supportObjects.length == 0) {
            //create a new Support object
            var newSupportObject = new objects.SupportObject()
            newSupportObject.set("from", from)
            newSupportObject.set("to", to)
            newSupportObject.save(null, objects.useMasterKeyOption).then((savedSupportObject) => {
                //saved support object
                res.success("You are now supporting this user")
            }, (error) => {
                //error saving support object
                console.log("error saving support object " + error)
                res.error("There was an error supporting this user. Please try again in sometime.");
            })
        }

        //else abort
        else {
            console.log("this user already supports " + from)
            res.error("You are already supporting this user")
        }
    }, (error) => {
        //error finding Support objects
        console.log("error finding support objects " + error)
        res.error("There was an error supporting this user. Please try again in sometime.")
    })
})

//cloud function to let user stop supporting another user
Parse.Cloud.define("unSupportUser", function (req, res) {
    //get params
    var params = req.params
    var from = params.from
    var to = params.to

    //delete all Support objects with this configuration
    var supportObjectQuery = new Parse.Query(objects.SupportObject)
    supportObjectQuery.equalTo("from", from)
    supportObjectQuery.equalTo("to", to)
    supportObjectQuery.find(objects.useMasterKeyOption).then((supportObjects) => {
        //delete all these support objects
        Parse.Object.destroyAll(supportObjects, objects.useMasterKeyOption).then((deletedSupportObjects) => {
            //deleted all support objects
            res.success("You are no longer supporting this user")
        }, (error) => {
            //error deleting support objects
            console.log("error deleting support objects " + error)
            res.error("There was an error completing this operation. Please try again in sometime.")
        })
    }, (error) => {
        //error finding support objects
        console.log("error finding support objects " + error)
        res.error("There was an error completing this operation. Please try again in sometime.")
    })
})

//afterSave trigger for Support objects
Parse.Cloud.afterSave("Support", function (req, res) {
    //get ids of "from" and "to" users
    var fromUserId = req.object.get("from")
    var toUserId = req.object.get("to")

    //get "from" user
    var fromUserQuery = new Parse.Query(Parse.User)
    fromUserQuery.get(fromUserId, objects.useMasterKeyOption).then((fromUserObject) => {
        //got "from" user object, now get "to" user object
        var toUserQuery = new Parse.Query(Parse.User)
        toUserQuery.get(toUserId, objects.useMasterKeyOption).then((toUserObject) => {
            //got both "to" and "from" users, now change support values
            var currentSupport = toUserObject.get("support"),
                currentSupporting = fromUserObject.get("supporting")
            toUserObject.set("support", (currentSupport + 1))
            fromUserObject.set("supporting", (currentSupporting + 1))

            //save "to" user object
            toUserObject.save(null, objects.useMasterKeyOption).then((savedToUserObject) => {
                //saved "to" user object, now save "from" user object
                fromUserObject.save(null, objects.useMasterKeyOption).then((savedFromUserObject) => {
                    //saved "from" user object
                    res.success("support updated")
                }, (error) => {
                    //error saving "from" user object
                    console.log("error saving from user object " + error)
                    res.error()
                })
            }, (error) => {
                //error saving "to" user object
                console.log("error saving to user object " + error)
                res.error("error saving to user object")
            })
        }, (error) => {
            //error getting to user object
            console.log("error getting to user object " + error)
            res.error("error getting to user object " + error)
        })
    }, (error) => {
        //error getting from user object
        console.log("error getting from user object " + error)
        res.error("error getting from user object")
    })
})

//afterDelete trigger for Support objects
Parse.Cloud.afterDelete("Support", function (req, res) {
    //find and increment support and supporting on both user objects
    var fromUserId = req.object.get("from")
    var toUserId = req.object.get("to")

    var fromUserQuery = new Parse.Query(Parse.User)
    fromUserQuery.get(fromUserId, objects.useMasterKeyOption).then((fromUserObject) => {
        //got "from" user object, now get "to" user object
        var toUserQuery = new Parse.Query(Parse.User)
        toUserQuery.get(toUserId, objects.useMasterKeyOption).then((toUserObject) => {
            //got both "to" and "from" users, now change support values
            var currentSupport = toUserObject.get("support"),
                currentSupporting = fromUserObject.get("supporting")
            toUserObject.set("support", (currentSupport - 1))
            fromUserObject.set("supporting", (currentSupporting - 1))

            //save both objects
            Parse.Object.saveAll([fromUserObject, toUserObject], objects.useMasterKeyOption).then((savedUserObjects) => {
                //saved user objects, return successfully
                res.success("support updated")
            }, (error) => {
                //error saving user objects
                console.log("error saving user objects " + error)
                res.error("error saving user objects")
            })
        }, (error) => {
            //error getting to user object
            console.log("error getting to user object " + error)
            res.error("error getting to user object " + error)
        })
    }, (error) => {
        //error getting from user object
        console.log("error getting from user object " + error)
        res.error("error getting from user object")
    })
})

//method to save a user's skills
// Parse.Cloud.define("saveUserSkills", function (req, res) {
//     //get params
//     var params = req.params
//     var userId = params.userId
//     var skillType = params.skillType
//     var skills = params.skills

//     //get user object
//     var userQuery = new Parse.Query(Parse.User)
//     userQuery.get(userId, objects.useMasterKeyOption).then((userObject) => {
//         //got user object, save skills
//         userObject.set(skillType, skills)
//         userObject.save(null, objects.useMasterKeyOption).then((savedObject) => {
//             //saved user object, return
//             res.success("saved")
//         }, (error) => {
//             //error saving user object
//             console.log("error saving user object " + error)
//             res.error("error saving user object " + error)
//         })
//     }, (error) => {
//         //error getting user object
//         console.log("error getting user object " + error)
//         res.error("error getting user object " + error)
//     })
// })

//method to save a user's favourites
// Parse.Cloud.define("saveUserFavourites", function (req, res) {
//     //get params
//     var params = req.params
//     var userId = params.userId
//     var favouriteType = params.favouriteType
//     var favourites = params.favourites

//     //get user object
//     var userQuery = new Parse.Query(Parse.User)
//     userQuery.get(userId, objects.useMasterKeyOption).then((userObject) => {
//         //got user object, save skills
//         userObject.set(favouriteType, favourites)
//         userObject.save(null, objects.useMasterKeyOption).then((savedObject) => {
//             //saved user object, return
//             res.success("saved")
//         }, (error) => {
//             //error saving user object
//             console.log("error saving user object " + error)
//             res.error("error saving user object " + error)
//         })
//     }, (error) => {
//         //error getting user object
//         console.log("error getting user object " + error)
//         res.error("error getting user object " + error)
//     })
// })

//method to save a user's sports
Parse.Cloud.define("saveUserSports", function (req, res) {
    //get params
    var params = req.params
    var sports = params.sports
    var userId = params.userId

    //get user object
    const userQuery = new Parse.Query(Parse.User)
    userQuery.get(userId).then((userObject) => {
        //got user object
        userObject.set("sports", sports);
        userObject.save(null, objects.useMasterKeyOption).then((savedObject) => {
            console.log("saved user sports")
            res.success("saved user sports")
        })
    }, (error) => {
        //error getting user object
        console.log("error getting user object " + error)
        res.error("error saving user object")
    })
})

//method to save a user's subSports
Parse.Cloud.define("saveUserSubSports", function (req, res) {
    //get params
    var params = req.params
    var subSports = params.subSports
    var userId = params.userId

    //get user object
    const userQuery = new Parse.Query(Parse.User)
    userQuery.get(userId).then((userObject) => {
        //got user object, override sports field and save
        userObject.set("subSports", subSports)
        userObject.save(null, objects.useMasterKeyOption).then((savedObject) => {
            //saved user object
            console.log("saved user object")
            res.success("saved user object")
        }, (error) => {
            //error saving user object
            console.log("error saving user object " + error)
            res.error("error saving user object")
        })
    }, (error) => {
        //error getting user object
        console.log("error getting user object " + error)
        res.error("error getting user object")
    })
})

//methods to save a user's selected positions
Parse.Cloud.define("saveUserPositions", function (req, res) {
    //get params
    var params = req.params
    var positions = params.positions
    var userId = params.userId

    //get user object
    const userQuery = new Parse.Query(Parse.User)
    userQuery.get(userId).then((userObject) => {
        //got user object
        console.log("got user object")
        userObject.set("positions", positions)
        userObject.save(null, objects.useMasterKeyOption).then((savedObject) => {
            //saved user object
            console.log("saved user object")
            res.success("saved user object")
        }, (error) => {
            //error saving user object
            console.log("error saving user object " + error)
            res.error("error saving user object")
        })
    }, (error) => {
        //error getting user object
        console.log("error getting user object " + error)
        res.error("error getting user object")
    })
})

//method to add a skill
Parse.Cloud.define("addUserSkill", function (req, res) {
    //get params
    var params = req.params
    var userId = params.userId
    var sportId = params.sportId
    var skillId = params.skillId
    var skillNo = params.skillNo

    //get user skills object
    const userSkillsQuery = new Parse.Query(objects.UserSkillsObject)
    userSkillsQuery.equalTo("userId", userId)
    userSkillsQuery.equalTo("sport", sportId)
    userSkillsQuery.find(objects.useMasterKeyOption).then((userSkillsObject) => {
        //got userSkillsObject, add this skill
        var skillsArray = []

        //get appropriate skills array
        if (skillNo == 0) {
            skillsArray = userSkillsObject.get("firstSkills")
        } else {
            skillsArray = userSkillsObject.get("secondSkills")
        }

        //add skillId
        if (!skillsArray.includes(skillId)) {
            skillsArray.push(skillId)

            //save userSkills object
            if (skillNo == 0) {
                userSkillsObject.set("firstSkills", skillsArray)
            } else {
                userSkillsObject.set("secondSkills", skillsArray)
            }
            userSkillsObject.save(null, objects.useMasterKeyOption).then((savedObject) => {
                //saved user skills
                console.log("saved user skills")
                res.success("saved user skills")
            }, (error) => {
                //error saving user skills object
                console.log("error saving user skills object " + error)
                res.error("error saving user skills object")
            })
        }
    }, (error) => {
        //error getting user skills object
        console.log("error getting user skills object " + error)
        res.error("error getting user skills object")
    })
})

//method to save a user's skills
Parse.Cloud.define("saveUserSkills", function (req, res) {
    //get params
    var params = req.params
    var userId = params.userId
    var sportId = params.sportId
    var firstSkills = params.firstSkills
    var secondSkills = params.secondSkills

    console.log("got first skills " + firstSkills)
    console.log("got second skills " + secondSkills)

    //get UserSkill object
    var userSkillsQuery = new Parse.Query(objects.UserSkillsObject)
    userSkillsQuery.equalTo("userId", userId)
    userSkillsQuery.equalTo("sport", sportId)
    userSkillsQuery.find(objects.useMasterKeyOption).then((userSkillObjects) => {
        //got user skill objects
        var userSkillObject = userSkillObjects[0];

        //save skills
        userSkillObject.set("firstSkills", firstSkills)
        userSkillObject.set("secondSkills", secondSkills)
        userSkillObject.save(null, objects.useMasterKeyOption).then((savedObject) => {
            //saved userSkillObject
            console.log("saved user skill object")
            res.success("saved user skills")
        }, (error) => {
            //error saving userSkillObject
            console.log("error saving user skill object " + error)
            res.error("error saving user skill object")
        })
    }, (error) => {
        //error getting user skill objects
        console.log("error getting user skill objects " + error)
        res.error("error getting user skill objects")
    })
})