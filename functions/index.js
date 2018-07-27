const functions = require('firebase-functions');
const admin =  require('firebase-admin');
const cors = require('cors')({origin: true});

admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        res.send("Hello from Firebase!");
    });
});

exports.sendNotification = functions.https.onRequest((res, req) => {
    cors(req, res, () => {
        if (req.body && req.body.to) {
            const payload = {
                notification: {
                    title: req.body.title,
                    body: req.body.message,
                    click_action: req.body.url || 'https://example.com'
                }
            }
            admin.messaging().sendToDevice(req.body.to, payload);
            res.send(payload);
        }
        else {
            console.log(res);
        }
    });
});

// exports.notifyUser = functions.firestore.document('chats/{chatID}').onWrite((context, change)=>{
    
// });

// exports.createRoom = functions.firestore.document('chats/{chatID}').onCreate((snap,context)=>{

// })