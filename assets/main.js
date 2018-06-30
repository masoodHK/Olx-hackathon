const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();
const messaging = firebase.messaging();

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
                document.getElementsByClassName("error-message")[1].innerHTML = `<p>The password is too weak.</p>`
            } else {
                document.getElementsByClassName("error-message")[1].innerHTML = `<p>${errorMessage}</p>`
            }
            setTimeout(() =>{
                document.getElementsByClassName("error-message")[1].innerHTML = ""
            },5000)
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
}

changeState();
