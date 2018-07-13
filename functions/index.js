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
    if (req.body && req.body.token) {
        const payload = {
            notification: {
                title: req.body.title,
                body: req.body.message,
                status: 'Wohoo its work',
                click_action: req.body.url || 'https://example.com'
            }
        }
        admin.messaging().sendToDevice(req.body.token, payload);
    }
});

// exports.notifyUser = functions.firestore.document('chats/{chatID}').onWrite((context, change)=>{
    
// });

exports.createRoom = functions.firestore.document('chats/{chatID}').onCreate((snap,context)=>{

})