const { post } = require("request");

module.exports = function (urlOfPostToDownload, callback) {

    const fs = require('fs');
    const dl = require('youtube-dl-exec');
    const request = require('request');
    const https = require('https');

    const { exec } = require("child_process");
    const { randomInt } = require('crypto');

    let allSources;

    var post_url = urlOfPostToDownload;
    var post_data;

    let callbackError = null;
    let callbackResult = null;

    var videoHasAudio = true;


    if (post_url.startsWith("https://www.reddit.com/r/")) {
        getPostData();
    }
    else {
        callbackError = "---- ERROR: Invalid Link ----";
        callback(callbackError, callbackResult);
    }

    function getPostData() {


        console.log("Getting post data...");

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

                    console.log("Success. ✅");
                    organizePostData();

                }
            )
        }
        catch {
            callbackError = "Failed to retrieve post data. ❌";
            callback(callbackError, callbackResult);
        }

    }

    function organizePostData() {

        console.log("Organizing data...");

        let altUrl = post_data[0].data.children[0].data.url_overridden_by_dest;

        if (altUrl.startsWith(altSource))
            console.log(altUrl)




        //if(altUrl.startsWith(altSource)){
        //   post_data = altUrl;
        //    useAlternativeDownload();
        //}
        //else{
        // try{
        //     var _tempData = {
        //         VIDEO_URL : "",
        //         AUDIO_URL: "",
        //         ID: "",
        //         ALT_URL: ""
        //     }

        //     let media_data = post_data[0].data.children[0].data.media.reddit_video;

        //     _tempData.VIDEO_URL = media_data.fallback_url
        //     .split("?")
        //     .shift();

        //     _tempData.ID = _tempData.VIDEO_URL
        //     .replace("https://v.redd.it/", '')
        //     .split('/')
        //     .shift();


        //     _tempData.AUDIO_URL = "https://v.redd.it/" + _tempData.ID + "/DASH_audio.mp4"

        //     post_data = _tempData;

        //     console.log("Success. ✅");
        //     downloadMedia();
        // }
        // catch{

        //     try{

        //         var _tempData = {
        //             VIDEO_URL : "",
        //             AUDIO_URL: "",
        //             ID: ""
        //         }

        //         let media_data = post_data[0].data.children[0].data.preview.reddit_video_preview;

        //         _tempData.VIDEO_URL = media_data.fallback_url
        //             .split("?")
        //             .shift();

        //         _tempData.ID = _tempData.VIDEO_URL
        //             .replace("https://v.redd.it/", '')
        //             .split('/')
        //             .shift();


        //         _tempData.AUDIO_URL = "https://v.redd.it/" + _tempData.ID + "/DASH_audio.mp4"

        //         post_data = _tempData;

        //         console.log("Success. ✅");
        //         downloadMedia();

        //     }
        //     catch{
        //         callbackError = "No media data was found. ❌";
        //         callback(callbackError, callbackResult);
        //     }
        // }
        //}




    }

    function useAlternativeDownload() {
        console.log("_____ Downloading Through Alternative Source_____")



    }

    function downloadMedia() {

        console.log("Downloading media...");
        try {
            // Download the video

            const video = fs.createWriteStream(post_data.ID + "_video.mp4");

            const videoRequest = https.get(post_data.VIDEO_URL, function (response) {
                response.pipe(video);
            })

            request(
                { uri: post_data.AUDIO_URL },

                function (error, response, body) {

                    if (body.startsWith('<')) {
                        videoHasAudio = false;

                        try {
                            fs.rename(__dirname + "\\" + post_data.ID + "_video.mp4", __dirname + "\\outputs\\" + randomInt(0, 10000) + ".mp4", function (err) {
                                if (err) throw err
                                console.log('Downloaded with no audio...')
                            })
                        }
                        catch {
                            fs.unlink(__dirname + "\\" + post_data.ID + "_video.mp4", function (err) {
                                if (err) {
                                    throw err
                                }
                            })
                        }



                    }
                    else {
                        // Download the audio
                        const audio = fs.createWriteStream(post_data.ID + "_audio.mp4");

                        const audioRequest = https.get(post_data.AUDIO_URL, function (response) {
                            response.pipe(audio);
                        });

                        console.log("Downloaded Audio. ✅");
                        combineMedia();

                    }

                }
            )

        }
        catch {
            callbackError = "Couldn't download media. ❌"
            callback(callbackError, callbackResult);
        }


    }

    async function combineMedia() {

        console.log("Processing media...")

        const command = "ffmpeg -i " + __dirname + "\\" + post_data.ID + "_video.mp4 -i " + __dirname + "\\" + post_data.ID + "_audio.mp4 -c:v copy -c:a aac " + __dirname + "\\outputs\\" + randomInt(0, 10000) + ".mp4";

        try {

            exec(command, (err, stdout, stderr) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log(stdout);

                deleteUnusedMediaFile(post_data.ID + "_video.mp4");
                deleteUnusedMediaFile(post_data.ID + "_audio.mp4");

                callbackResult = "Success ✅";
                callback(callbackError, callbackResult)

            });
        }
        catch {
            callbackError = "Failed to process media. ❌";
            callback(callbackError, callbackResult);
        }

    }

    function deleteUnusedMediaFile(name) {

        fs.unlink(__dirname + "\\" + name, function (err) {
            if (err) {
                throw err
            }
        })
    }

    function txtToArray() {

        var contents;
        var tempArray;

        fs.readFile('list.txt', 'utf8', function (err, data) {
            contents = data.toString();

            tempArray = contents.split(/\r?\n/);
            postsToDownload = tempArray;

        });
    }
}

