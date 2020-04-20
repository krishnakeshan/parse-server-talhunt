const objects = require("./objects")
const main = require("./main")

//function to create a post
Parse.Cloud.define("createPost", function (req, res) {
    //get params
    var params = req.params
    var type = params.postType
    var secondaryType = params.postSecondaryType
    var uuid = params.postUUID
    var content = params.content
    var from = params.from
    var recommendTo = params.recommendTo

    //create Post object
    var newPost = new objects.PostObject()
    newPost.set("from", from)
    newPost.set("content", content)
    newPost.set("type", type)
    newPost.set("secondaryType", secondaryType)
    newPost.set("uuid", uuid)
    newPost.set("stars", [])
    newPost.set("starCount", 0)
    newPost.set("isShared", false)
    newPost.save(null, objects.useMasterKeyOption).then((savedPostObject) => {
        //saved post object, now create recommendation object if recommendation selected
        if (recommendTo.length != 0) {
            var newRecommendation = new objects.RecommendationObject()
            newRecommendation.set("from", from)
            newRecommendation.set("to", recommendTo)
            newRecommendation.set("post", savedPostObject.id)
            newRecommendation.set("count", 1)
            newRecommendation.set("support", [])
            newRecommendation.save(null, objects.useMasterKeyOption).then((savedRecommendation) => {
                //created recommendation object, return successfully
                res.success("Post Published")
            }, (error) => {
                //error creating recommendation object
                console.log("error creating recommendation object " + error)
                res.error("error creating recommendation object")
            })
        } else {
            //no recommendation creation needed, return success
            res.success("Post Published");
        }
    }, (error) => {
        //error saving post object
        console.log("error saving post object " + error)
        res.error("There was an error posting. Please try again in sometime.")
    })
})

//function to star this post
Parse.Cloud.define("starPost", function (req, res) {
    //get params
    var params = req.params
    var postId = params.postId
    var userId = params.userId

    //get post object
    var postQuery = new Parse.Query(objects.PostObject)
    postQuery.get(postId, objects.useMasterKeyOption).then((postObject) => {
        //got post object, add this user's star if not already added
        if (!postObject.get("stars").includes(userId)) {
            var stars = postObject.get("stars"), starCount = postObject.get("starCount")
            stars.push(userId) //add user to list of starrers
            starCount += 1
            postObject.set("stars", stars)
            postObject.set("starCount", starCount)
            postObject.save(null, objects.useMasterKeyOption).then((savedPost) => {
                //post saved, create notification
                var userQuery = new Parse.Query(Parse.User)
                userQuery.get(userId, objects.useMasterKeyOption).then((userObject) => {
                    //create notification
                    var notification = new Parse.Object("Notification")
                    notification.set("type", "postStarNotification")
                    notification.set("content", { "postId": postId })
                    notification.set("seen", false)
                    notification.set("forId", postObject.get("from"))
                    let notificationString = userObject.get("name") + " starred your post"
                    notification.set("notificationString", notificationString)
                    notification.save(null, objects.useMasterKeyOption)
                    res.success("post saved")
                }, (error) => {
                    //error getting user
                    console.log("error getting user " + userId)
                    res.error("error getting user " + userId)
                })
            }, (error) => {
                //error saving post
                console.log("error saving post " + error)
                res.error("error saving post " + error)
            })
        }
    }, (error) => {
        //error getting post object
        console.log("error getting post object " + error)
        res.error("error getting post object " + error)
    })
})

//function to un-star this post
Parse.Cloud.define("unStarPost", function (req, res) {
    //get params
    var params = req.params
    var postId = params.postId
    var userId = params.userId

    //get post object
    var postQuery = new Parse.Query(objects.PostObject)
    postQuery.get(postId, objects.useMasterKeyOption).then((postObject) => {
        //got post object, add this user's star if not already added
        if (postObject.get("stars").includes(userId)) {
            var stars = postObject.get("stars"),
                starCount = postObject.get("starCount")
            var index = stars.indexOf(userId)
            stars.splice(index, 1)
            starCount -= 1
            postObject.set("stars", stars)
            postObject.set("starCount", starCount)
            postObject.save(null, objects.useMasterKeyOption).then((savedPost) => {
                res.success("post saved")
            }, (error) => {
                //error saving post
                console.log("error saving post " + error)
                res.error("error saving post " + error)
            })
        }
    }, (error) => {
        //error getting post object
        console.log("error getting post object " + error)
        res.error("error getting post object " + error)
    })
})

//method to recommend this post to someone
Parse.Cloud.define("recommendPost", function (req, res) {
    //get params
    var params = req.params
    var from = params.from
    var to = params.to
    var post = params.post

    //created a Recommendation object with these params
    var newRecommendation = new objects.RecommendationObject()
    newRecommendation.set("from", from)
    newRecommendation.set("to", to)
    newRecommendation.set("post", post)
    newRecommendation.set("count", 0)
    newRecommendation.set("support", [])
    newRecommendation.save(null, objects.useMasterKeyOption).then((savedObject) => {
        //saved recommendation object, now create notification object
        res.success("recommendation successful")
    }, (error) => {
        //error saving recommendation object
        console.log("error saving recommendation object " + error)
        res.error("error saving recommendation object " + error)
    })
})

//method to increment top recommendation for this post
Parse.Cloud.define("incrementRecommendation", function (req, res) {
    //get params
    var params = req.params
    var recommendationId = params.recommendationId
    var userId = params.userId

    //get recommendation object
    const recommendationQuery = new Parse.Query(objects.RecommendationObject)
    recommendationQuery.get(recommendationId, objects.useMasterKeyOption).then((recommendationObject) => {
        //got recommendation object
        //get list of supporters
        var supporters = recommendationObject.get("support")
        var count = recommendationObject.get("count")
        if (!supporters.includes(userId)) {
            supporters.push(userId)
            count += 1
        }

        //save recommendation object
        recommendationObject.set("support", supporters)
        recommendationObject.set("count", count)
        recommendationObject.save(null, objects.useMasterKeyOption).then((savedObject) => {
            console.log("incremented recommendation")
            res.success(true)
        }, (error) => {
            //error saving recommendation object
            console.log("error saving recommendation object " + error)
            res.success("error saving recommendation object")
        })
    }, (error) => {
        //error getting recommendation object
        console.log("error getting recommendation object " + error)
        res.error("error getting recommendation object")
    })
})

//method to share post
Parse.Cloud.define("sharePost", function (req, res) {
    //get params
    var params = req.params
    var postId = params.postId
    var userId = params.userId

    //get post object
    const postQuery = new Parse.Query(objects.PostObject)
    postQuery.get(postId, objects.useMasterKeyOption).then((postObject) => {
        //got post object, now copy it
        var newPost = new objects.PostObject()
        newPost.set("from", userId)
        newPost.set("content", postObject.get("content"))
        newPost.set("uuid", postObject.get("uuid"))
        newPost.set("type", postObject.get("type"))
        newPost.set("secondaryType", postObject.get("secondaryType"))
        newPost.set("stars", postObject.get("stars"))
        newPost.set("starCount", postObject.get("starCount"))
        newPost.set("isShared", true)

        //save it
        newPost.save(null, objects.useMasterKeyOption).then((postObject) => {
            //saved post object, return
            console.log("shared post")
            res.success(true)
        }, (error) => {
            //error saving post object
            console.log("error saving post object")
            res.error("error saving post object")
        })
    }, (error) => {
        //error getting post object, log error
        console.log("error getting post object " + error)
        res.error("error getting post object")
    })
})

//method to publish a post comment
Parse.Cloud.define("postComment", function (req, res) {
    //get params
    var params = req.params
    var post = params.post
    var from = params.from
    var fromName = params.fromName
    var comment = params.comment

    //create PostComment object
    var newComment = new objects.PostCommentObject()
    newComment.set("post", post)
    newComment.set("from", from)
    newComment.set("fromName", fromName)
    newComment.set("comment", comment)
    newComment.save(null, objects.useMasterKeyOption).then((savedComment) => {
        //saved comment, create notification
        //get post
        var postQuery = new Parse.Query("Post")
        postQuery.get(post, objects.useMasterKeyOption).then((postObject) => {
            var notification = new Parse.Object("Notification")
            notification.set("type", "postCommentNotification")
            notification.set("content", { "postId": post })
            notification.set("seen", false)
            notification.set("forId", postObject.get("from"))
            let notificationString = fromName + " commented on your post"
            notification.set("notificationString", notificationString)
            notification.save(null, objects.useMasterKeyOption)
            res.success("comment saved")
        }, (error) => {
            //error getting post
            console.log("error getting post " + error)
            res.error("error getting post " + error)
        })
    }, (error) => {
        //error saving comment
        console.error("error saving comment " + error)
        res.error("error saving comment " + error)
    })
})