const functions = require('firebase-functions');
const admin =  require('firebase-admin');
const cors = require('cors');
const corsInit = cors()

admin.initializeApp(functions.config().firebase);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((req, res) => {
    corsInit(req, res, () => {
        res.send("Hello from Firebase!");
    });
});

exports.sendNotification = functions.https.onRequest((res, req) => {
    if (req.body && req.body.to) {
        const payload = {
            notification: {
                title: req.body.title,
                body: req.body.message,
                click_action: req.body.url || 'https://example.com'
            }
        }
        admin.messaging().sendToDevice(req.body.to, payload).then(res => {
            console.log(res);
            return;
        }).catch(err => console.log(err));
        res.send(payload);
    }
    else {
        console.log(res);
    }
});
