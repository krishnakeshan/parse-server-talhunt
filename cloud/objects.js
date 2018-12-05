//facebook stuff
exports.facebookAPIBaseURL = "https://graph.accountkit.com/v1.3/me/"
exports.facebookAppId = "2196060427333447"

//Parse objects
exports.PostObject = Parse.Object.extend("Post")
exports.SupportObject = Parse.Object.extend("Support")

//options object for using master key
exports.useMasterKeyOption = {
    useMasterKey: true
}