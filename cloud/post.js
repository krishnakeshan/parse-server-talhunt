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
    newPost.set("type", postType)
    newPost.set("secondaryType", postSecondaryType)
    newPost.set("uuid", postUUID)
    newPost.save(null, objects.useMasterKeyOption).then((savedPostObject) => {
        //saved post object
        res.success("Post Published")
    }, (error) => {
        //error saving post object
        console.log("error saving post object " + error)
        res.error("There was an error posting. Please try again in sometime.")
    })
})