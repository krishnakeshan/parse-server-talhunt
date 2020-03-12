const objects = require("./objects")

// after save trigger for comment
// Parse.Cloud.afterSave("PostComment", function(req, res) {
//     var commentObject = req.object

//     //get post object for this comment
//     var postQuery = new Parse.Query(objects.PostObject)
//     postQuery.get(commentObject.get("post"), objects.useMasterKeyOption).then((postObject) => {
//         //got post object, create notification
//         var newNotification = new objects.NotificationObject()
//         newNotification.set("from", commentObject.from)
//         newNotification.set("for", postObject.get("from"))
//         newNotification.set("type", objects.notificationTypeComment)
//         newNotification.set("seen", false)
//         newNotification.set("content", postObject.id)
//         newNotification.save(null, objects.useMasterKeyOption).then((savedObject) => {
//             //saved notification
//             res.success("saved")
//         }, (error) => {
//             //error saving notification
//             console.log("error saving notification " + error)
//             res.error("error saving notification " + error)
//         })
//     }, (error) => {
//         //error getting post object
//         console.log("error getting post object " + error)
//         res.error("error getting post object " + error)
//     })
// })

//method to create a notification
Parse.Cloud.define("createNotification", function (req, res) {
    //get params
    var params = req.params
    var forId = params.forId
    var notificationString = params.notificationString
    var type = params.type

    //if notification is of "recommendation" type, check if coach already seen it
    if (type == "recommendationNotification") {
        //get PostSeen object
        var postSeenQuery = new Parse.Query("PostSeen")
        postSeenQuery.equalTo("post", params.postId)
        postSeenQuery.equalTo("by", params.to)
        postSeenQuery.find(objects.useMasterKeyOption).then((postSeenObjects) => {
            if (postSeenObjects.length == 0) {
                var notificationObject = new objects.NotificationObject()
                notificationObject.set("forId", forId)
                notificationObject.set("notificationString", notificationString)
                var content = {
                    "postId": params.postId,
                    "from": params.from,
                    "to": params.to
                }
                notificationObject.set("content", content)
                notificationObject.set("type", type)
                notificationObject.set("seen", false)

                //save notification
                notificationObject.save(null, objects.useMasterKeyOption).then((savedObject) => {
                    //saved notification object
                    res.success("saved notification")
                }, (error) => {
                    //error saving notification object
                    console.log("error saving notification object " + error)
                    res.error("error saving notification object")
                })
            } else {
                res.success("saved notification")
            }
        }, (error) => {
            console.error("error retrieving PostSeen objects " + error)
            res.error("error retrieving PostSeen objects " + error)
        })
    }

    //else create notification object straight away
    else {
        var notificationObject = new objects.NotificationObject()
        notificationObject.set("forId", forId)
        notificationObject.set("notificationString", notificationString)
        var content = {
            "postId": params.postId,
            "from": params.from,
            "to": params.to
        }
        notificationObject.set("content", content)
        notificationObject.set("type", type)
        notificationObject.set("seen", false)

        //save notification
        notificationObject.save(null, objects.useMasterKeyOption).then((savedObject) => {
            //saved notification object
            res.success("saved notification")
        }, (error) => {
            //error saving notification object
            console.log("error saving notification object " + error)
            res.error("error saving notification object")
        })
    }
})