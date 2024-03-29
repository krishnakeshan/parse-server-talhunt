//facebook stuff
exports.facebookAPIBaseURL = "https://graph.accountkit.com/v1.3/me/"
exports.facebookAppId = "803592549993621"

//Parse objects
exports.PostObject = Parse.Object.extend("Post")
exports.ChatObject = Parse.Object.extend("ChatObject")
exports.ChatMessageObject = Parse.Object.extend("ChatMessage")
exports.SupportObject = Parse.Object.extend("Support")
exports.SportObject = Parse.Object.extend("Sport")
exports.SportPositionObject = Parse.Object.extend("SportPosition");
exports.RecommendationObject = Parse.Object.extend("Recommendation")
exports.NotificationObject = Parse.Object.extend("Notification")
exports.PostCommentObject = Parse.Object.extend("PostComment")
exports.BestGameObject = Parse.Object.extend("BestGame")
exports.UserSkillsObject = Parse.Object.extend("UserSkills")
exports.UserFavouritesObject = Parse.Object.extend("UserFavourites")
exports.CoachChallengeObject = Parse.Object.extend("CoachChallenge")

//constants
exports.notificationTypeRecommendation = "recommendationNotification"
exports.notificationTypeStar = "starNotification"
exports.notificationTypeComment = "commentNotification"

//options object for using master key
exports.useMasterKeyOption = {
    useMasterKey: true
}