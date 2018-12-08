const objects = require("./objects")
const main = require("./main")

//function to create a post
Parse.Cloud.define("createPost", function(req, res) {
    //get params
    var params = req.params
    var type = params.postType
    var secondaryType = params.postSecondaryType
    var uuid = params.postUUID
    var content = params.content
    var from = params.from

    //create Post object
    var newPost = new objects.PostObject()
    newPost.set("from", from)
    newPost.set("content", content)
    newPost.set("type", type)
    newPost.set("secondaryType", secondaryType)
    newPost.set("uuid", uuid)
    newPost.set("stars", [])
    newPost.set("starCount", 0)
    newPost.save(null, objects.useMasterKeyOption).then((savedPostObject) => {
        //saved post object
        res.success("Post Published")
    }, (error) => {
        //error saving post object
        console.log("error saving post object " + error)
        res.error("There was an error posting. Please try again in sometime.")
    })
})

//function to star this post
Parse.Cloud.define("starPost", function(req, res) {
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
            stars.push(userId)
            starCount += 1
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

//function to un-star this post
Parse.Cloud.define("unStarPost", function(req, res) {
    //get params
    var params = req.params
    var postId = params.postId
    var userId = params.userId

    //get post object
    var postQuery = new Parse.Query(objects.PostObject)
    postQuery.get(postId, objects.useMasterKeyOption).then((postObject) => {
        //got post object, add this user's star if not already added
        if (postObject.get("stars").includes(userId)) {
            var stars = postObject.get("stars"), starCount = postObject.get("starCount")
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
Parse.Cloud.define("recommendPost", function(req, res) {
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
    newRecommendation.save(null, objects.useMasterKeyOption).then((savedObject) => {
        //saved recommendation object
        res.success("post recommended")
    }, (error) => {
        //error saving recommendation object
        console.log("error saving recommendation object " + error)
        res.error("error saving recommendation object " + error)
    })
})

//method to publish a post comment
Parse.Cloud.define("postComment", function(req, res) {
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
        //saved comment
        res.success("comment saved")
    }, (error) => {
        //error saving comment
        console.error("error saving comment " + error)
        res.error("error saving comment " + error)
    })
})