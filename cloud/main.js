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
require("./main")

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