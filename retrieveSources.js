const { post } = require("request");

module.exports = function (urlOfPostToDownload, callback) {

    const request = require('request');

    var post_url = urlOfPostToDownload;
    var post_data;

    let callbackError = null;
    let callbackResult = null;

    getPostData();

    function getPostData() {

        try {
            // -- Obtain the JSON w/ the information -- //
            request(
                { uri: post_url + ".json" },

                function (error, response, body) {


                    let temp = body;

                    if (temp.startsWith('<')) {
                        return;
                    }

                    temp = JSON.parse(temp);

                    post_data = temp;

                    organizePostData();

                }


            )


        }
        catch {
            callbackError = "Failed to retrieve post data. ❌";

            if (callback)
                callback(callbackError, callbackResult);
        }

    }

    function organizePostData() {

        console.log("Starting...")

        console.log(post_data[0].data.children[0].data.media.reddit_video);
    }
}

