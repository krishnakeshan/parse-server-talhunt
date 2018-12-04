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

//simple test function
Parse.Cloud.define('hello', function(req, res) {
  res.success("hello defined");
});

//cloud function to let one user support another
Parse.Cloud.define("supportUser", function(req, res) {
  //get params
  var params = req.params
  var from = params.from
  var to = params.to

  //create a new Support object
  var newSupportObject = new objects.SupportObject()
  newSupportObject.set("from", from)
  newSupportObject.set("to", to)
  newSupportObject.save().then((savedSupportObject) => {
    //saved support object
    res.success("You are now supporting this user")
  }, (error) => {
    //error saving support object
    console.log("error saving support object " + error)
    res.error("There was an error supporting this user. Please try again in sometime.");
  })
})
