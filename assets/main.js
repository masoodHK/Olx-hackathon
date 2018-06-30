const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();
const messaging = firebase.messaging();
var installPromptEvent;

function signUp() {
    let email = document.getElementById('email').value;
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let confirmPassword = document.getElementById('confirm-password').value;
    
    if(confirmPassword === password){
        auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            let userSignedIn = auth.currentUser;
            userSignedIn.updateProfile({
                displayName: username,
                emailVerified: true
            })
            setTimeout(() => {
                location = 'index.html';
            }, 1000)
        }).catch((err) => {
            var errorCode = err.code;
            var errorMessage = err.message;
            if (errorCode === 'auth/weak-password') {
                alert("the password is too weak")
            }
            console.log(`${err}`)
        });
    }
    return false
}

function logIn() {
    let email = document.getElementById('loginEmail').value;
    let password = document.getElementById('loginPassword').value;
    auth.signInWithEmailAndPassword(email, password).then(() => {
        setTimeout(() => {
            location = 'index.html';
        }, 1000)
    })
    .catch((err) => {
        var errorCode = err.code;
        var errorMessage = err.message;
        if (errorCode) {
            console.log('Error:' + errorCode);
        } else {
            console.log(errorMessage);
        }
        console.log(`Error: ${err}`)
    });
    return false
}

function signOut() {
    auth.signOut().then(() => {
        setTimeout(() => {
            location = 'index.html';
        }, 1000)
    }).catch(error => console.error(error));
}

function showLoginModal() {
    $('.ui.modal#login')
        .modal('show')
    ;
}


function showSignUpModal() {
    $('.ui.modal#sign-up')
        .modal('show')
    ;
}

if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log(`Service Worker Scope: ${reg.scope}`))
        .catch(error => console.log(error));
    navigator.serviceWorker.ready.then(function(reg) { 
       reg.sync.register('dataSync');
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
      event.preventDefault();
      installPromptEvent = event;
});
