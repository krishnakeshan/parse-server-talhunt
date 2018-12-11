const objects = require("./objects")

//after save trigger for comment
Parse.Cloud.afterSave("PostComment", function(req, res) {
    var commentObject = req.object

    //get post object for this comment
    var postQuery = new Parse.Query(objects.PostObject)
    postQuery.get(commentObject.get("post"), objects.useMasterKeyOption).then((postObject) => {
        //got post object, create notification
        var newNotification = new objects.NotificationObject()
        newNotification.set("from", commentObject.from)
        newNotification.set("for", postObject.get("from"))
        newNotification.set("type", objects.notificationTypeComment)
        newNotification.set("seen", false)
        newNotification.set("content", postObject.id)
        newNotification.save(null, objects.useMasterKeyOption).then((savedObject) => {
            //saved notification
            res.success("saved")
        }, (error) => {
            //error saving notification
            console.log("error saving notification " + error)
            res.error("error saving notification " + error)
        })
    }, (error) => {
        //error getting post object
        console.log("error getting post object " + error)
        res.error("error getting post object " + error)
    })
})