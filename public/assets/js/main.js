const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();
const messaging = firebase.messaging();
var installPromptEvent;

const fileRef = $('input[type=file]#adImage')
let fileName;

fileRef.on('change', function(event) {
    var file = event.target.files;

    for (let i = 0, f; f = file[i]; i++) {
        if (!f.type.match('image/*')) {
            continue;
        }
        console.log(f);
        fileName = f.name;
        const reader = new FileReader();

        reader.onload = (function(theFile) {
            return function(e) {
                // Render thumbnail.
                var span = document.createElement('span');
                span.innerHTML = ['<img class="thumb" src="', e.target.result,
                    '" title="', escape(theFile.name), '"/>'
                ].join('');
                document.getElementById('imagePreview').insertBefore(span, null);
            };
        })(f);

        reader.readAsDataURL(f);
    }
});

function signUp() {
    let email = document.getElementById('email').value;
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let confirmPassword = document.getElementById('confirm-password').value;
    if (confirmPassword === password) {
        auth.createUserWithEmailAndPassword(email, password)
            .then(() => {
                let userSignedIn = auth.currentUser;
                userSignedIn.updateProfile({
                    displayName: username
                })
                location.reload();
            }).catch((err) => {
                var errorCode = err.code;
                var errorMessage = err.message;
                if (errorCode === 'auth/weak-password') {
                    alert("the password is too weak")
                }
                console.log(`${err}`)
            });
    }
}

function logIn() {
    let email = document.getElementById('loginEmail').value;
    let password = document.getElementById('loginPassword').value;
    auth.signInWithEmailAndPassword(email, password).then(() => {
            location.reload();
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
}

function signOut() {
    auth.signOut().then(() => {
        setTimeout(() => {
            location.reload();
        }, 1000)
    }).catch(error => console.error(error));
}

function changeState() {
    const nav = $('form.form-inline.ml-auto');
    const addGroup = $('#addNewPost > .container')
    auth.onAuthStateChanged(user => {
        if (user) {
            nav.html(`
                <div id="user">
                    <a class="nav-link" data-toggle="modal" data-target="#profile">Welcome: ${user.displayName}</a>
                </div>
                <a onclick="signOut()" class="btn btn-primary">Sign Out</a>
            `);
            addGroup.html(`<button class="btn btn-primary" data-toggle="modal" data-target="#ad-submit">Add New Advertisement</button>`)
        }
    });
    showPosts()
}

function showPosts(categories = null, searchQuery = null) {
    const postsDiv = $('.container > #posts');
    const adRef = database.ref('ads')
    let adPost;
    if(categories && searchQuery){
        return;
    }
    else if(categories){
        adRef.orderByChild('category').equalTo(categories)
            .on('value', snapshot => {
                if (snapshot.exists()) {
                    adPost = renderAd(snapshot.val());
                    postsDiv.append(adPost);
                } else {
                    postsDiv.append(`
                        <div class="text-center">        
                            <h3>Nothing to show here</h3>
                            <p>Please try again later......
                                <i class="fa fa-sad-tear"></i>
                            </p>
                        </div>
                    `)
                }
            })
    }
    else{
        adRef.on('child_added', snapshot => {
            if (snapshot.exists()) {
                adPost = renderAd(snapshot.val());
                postsDiv.append(adPost);
            } else {
                postsDiv.append(`
                    <div class="text-center">        
                        <h3>Nothing to show here</h3>
                        <p>Please try again later......
                            <i class="fa fa-sad-tear"></i>
                        </p>
                    </div>
                `)
            }
        });
    }
}

function renderAd(data) {
        return `
            <div class="card">
                <img class="card-img-top" src="${data.adImage}" alt="Card image cap">
                <div class="card-body">
                    <h1>${data.adName} <span class="badge badge-secondary">${data.pricing} Rs.</span></h1>
                    <small>Made by: ${data.adAuthor}</small>
                    <p>Category: ${data.category}</p>
                    <hr>
                    <p>${data.adDesc}</p>
                </div>
            </div>
        `
}

function search() {
    let searchQuery = document.getElementById("searchBar").value
    let category = document.getElementById("categories").value
    showPosts(category, searchQuery);
}

function showUsersAds(data, key) {
    return `
        <tr>
            <td>${data.adName}</td>
            <td><button onclick="deleteAdPost('${key}')"></button></td>
        </tr>
    `
}

function deleteAdPost(key) {
    database.ref(`ads/${key}`).remove();
    database.ref(`users/${auth.currentUser.uid}/ads/${key}`).remove();
    location.reload();
}

function addNewAd() {
    const adName = $('#ad-name').val();
    const category = $('select#formCategories').val();
    const pricing = $("#ad-pricing").val();
    const imageRef = storage.ref(`adImages/${fileName}`);
    const imageURL = document.getElementsByClassName('thumb')[0].src;
    const adDesc = $("#description").val()
    let adAuthor = auth.currentUser.displayName;
    let adImage;

    imageRef.putString(imageURL, 'data_url').then(() => {
        imageRef.getDownloadURL().then((url) => {
            adImage = url;
            let adPost = {
                adName,
                category,
                pricing,
                adImage,
                adAuthor,
                authorID: auth.currentUser.uid,
                adDesc,
            }
            database.ref(`users/${auth.currentUser.uid}/ads`).push().set(true);
            database.ref(`ads`).push().set(adPost);
            location.reload();
        })
    });

}

$("select#categories").on('change', function(event) {
    
});

function deletePoll(pid = null) {
    database.ref(`users/${auth.currentUser.uid}/polls/${pid}`).remove();
    database.ref(`polls/${pid}`).remove();
    location.reload();
}

if ('serviceWorker' in navigator) {
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
    console.log(installPromptEvent)
});

messaging.requestPermission().then(() => {
    alert("Notification Request has been granted");
}).catch(() => {
    alert("Notification Request has been denied");
})

changeState();