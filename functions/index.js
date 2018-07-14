const functions = require('firebase-functions');
const admin =  require('firebase-admin');
admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
    if(request.method === "GET") {
        response.send("Hello from Firebase!");
    }
});

exports.sendNotification = functions.https.onRequest((res, req) => {
    if (req.body && req.to) {
        const payload = {
            notification: {
                title: req.body.title,
                body: req.body.message,
                click_action: req.body.url || 'https://example.com'
            }
        }
        admin.messaging().sendToDevice(req.body.to, payload);
    }
});

// exports.notifyUser = functions.firestore.document('chats/{chatID}').onWrite((context, change)=>{
    
// });

// exports.createRoom = functions.firestore.document('chats/{chatID}').onCreate((snap,context)=>{

// })