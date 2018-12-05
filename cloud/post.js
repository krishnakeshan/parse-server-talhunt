const objects = require("./objects")
const main = require("./main")

//function to create a post
Parse.Cloud.define("createPost", function(req, res) {
    //get params
    var params = req.params
    var postType = params.postType
    var postSecondaryType = params.postSecondaryType
    var postUUID = params.postUUID
    var content = params.content
    var from = params.from

    //create Post object
    var newPost = new objects.PostObject()
    newPost.set("from", from)
    newPost.set("content", content)
    newPost.set("postType", postType)
    newPost.set("postSecondaryType", postSecondaryType)
    newPost.set("postUUID", postUUID)
    newPost.save(null, objects.useMasterKeyOption).then((savedPostObject) => {
        //saved post object
        res.success("Post Published")
    }, (error) => {
        //error saving post object
        console.log("error saving post object " + error)
        res.error("There was an error posting. Please try again in sometime.")
    })
})