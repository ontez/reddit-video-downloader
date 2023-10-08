const download = require('./download.js');
const retrieve = require('./retrieveSources.js')
const fs = require('fs');
const retrieveSources = require('./retrieveSources.js');

var postsToDownload;

txtToArray();

function txtToArray() {

    var contents;
    var tempArray;

    fs.readFile('list.txt', 'utf8', function (err, data) {
        contents = data.toString();

        tempArray = contents.trim('').split(/\r?\n/);

        postsToDownload = tempArray;

        retrieveSource();
    });


}

function downloadPosts() {

    console.log(postsToDownload);

    postsToDownload.forEach(post => {

        download(post, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            else {
                console.log(result);

            }
        })
    });
}

async function retrieveSource() {
    postsToDownload.forEach(post => {

        retrieve(post, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            else {
                console.log(result);
            }
        })
    });
}