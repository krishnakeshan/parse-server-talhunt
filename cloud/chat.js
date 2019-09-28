const objects = require("./objects")

//method to create a ChatObject
Parse.Cloud.define("createChatObject", function (req, res) {
    //get params
    var params = req.params
    var user1 = params.user1
    var user1Name = params.user1Name
    var user2 = params.user2
    var user2Name = params.user2Name

    //create chat object
    var newChatObject = new objects.ChatObject()
    newChatObject.set("user1", user1)
    newChatObject.set("user1Name", user1Name)
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

//method to send chat message
Parse.Cloud.define("sendChatMessage", function (req, res) {
    //get params
    var params = req.params
    var from = params.from
    var forId = params.forId
    var chat = params.chat
    var message = params.message

    //create ChatMessage object
    var newChatMessage = new objects.ChatMessageObject()
    newChatMessage.set("from", from)
    newChatMessage.set("for", forId)
    newChatMessage.set("chat", chat)
    newChatMessage.set("message", message)
    newChatMessage.save(null, objects.useMasterKeyOption).then((savedObject) => {
        //saved chat message object
        res.success("message sent")
    }, (error) => {
        //error saving chat message
        console.log("error saving chat message " + error)
        res.error("error saving chat message")
    })
})

//method to mark a chat's messages as seen
Parse.Cloud.define("markMessagesSeen", function (req, res) {
    //get parameters
    const params = req.params
    const chatObjectId = params.chat
    const user = params.user

    //get all "unseen" messages for this chat and this user
    const chatMessagesQuery = new Parse.Query(objects.ChatMessageObject)
    chatMessagesQuery.equalTo("chat", chatObjectId)
    chatMessagesQuery.equalTo("for", user)
    chatMessagesQuery.equalTo("seen", false)
    chatMessagesQuery.find(objects.useMasterKeyOption).then((messages) => {
        //got chat messages, now mark them as seen
        for (var message in messages) {
            message.set("seen", true)
        }

        //save all objects at once
        Parse.Object.saveAll(messages, objects.useMasterKeyOption).then((result) => {
            //saved chat message objects, return success
            res.success("saved chat messages")
        }, (error) => {
            //error saving chat message objects
            console.error("error saving chat messages " + error)
            res.error("error saving chat messages")
        })
    }, (error) => {
        //error getting chat messages
        console.error("error getting chat messages " + error)
        res.error("error getting chat messages")
    })
})