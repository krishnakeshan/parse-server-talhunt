const objects = require("./objects")

//method to create a ChatObject
Parse.Cloud.define("createChatObject", function(req, res) {
    //get params
    var params = req.params
    var user1 = params.user1
    var user1Name = params.user1Name
    var user2 = params.user2
    var user2Name = params.user2Name

    //create chat object
    var newChatObject = new objects.ChatObject()
    newChatObject.set("user1", user1)
    newChatObject.set("user1Name", user1)
    newChatObject.set("user2", user2)
    newChatObject.set("user2Name", user2Name)
    newChatObject.save(null, objects.useMasterKeyOption).then((savedObject) => {
        //saved chat object
        res.success(savedObject.id)
    }, (error) => {
        //error saving chat object
        console.log("error saving chat object " + error)
        res.error("error saving chat object " + error)
    })
})