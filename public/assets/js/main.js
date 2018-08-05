const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();
const messaging = firebase.messaging();

const adsStore = localforage.createInstance({
    name: 'ads'
})
const offlineAdsStore = localforage.createInstance({
    name: 'offline-ads'
})
adsStore.ready().then((result) => {
    console.log(adsStore.driver(), result)
}).catch((err) => {
    console.log(err)
});

offlineAdsStore.ready().then((result) => {
    console.log(offlineAdsStore.driver(), result)
}).catch((err) => {
    console.log(err)
});
const fileRef = $('input[type=file]#adImage')
let fileName;

const categoryTranslator = {
    "clothings": "Clothings",
    "mobile-phones": "Mobile Phones and Accessories",
    "home-ownership": "Home Ownership or Rental",
    "jobs": "Jobs",
    "retail-stores": "Retail Store or Ownership",
    "vehicles": "Vehicles",
    "home-decor": "Home Decorations and Accessories",
    "animals": "Animals or Pet Ownerships",
    "beauty-products": "Beauty Products",
    "kids": "Kids",
}

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
    if (username.length <= 0) {
        let temp = `
        <div class="alert alert-danger fade show" role="alert">
            Username is empty.
        </div>`
        $("#signin .error").html(temp);
        setTimeout(() => {
            $('.alert').alert('close');
        }, 5000)
    }
    if (confirmPassword == password) {
        auth.createUserWithEmailAndPassword(email, password)
            .then(() => {
                let userSignedIn = auth.currentUser;
                userSignedIn.updateProfile({
                    displayName: username
                })
                setTimeout(location.reload(),100);
            }).catch((err) => {
                let temp = `
                <div class="alert alert-danger fade show" role="alert">
                    ${err.message}
                </div>`
                $("#signin .error").html(temp);
                setTimeout(() => {
                    $('.alert').alert('close');
                }, 5000)
            });
    }
}

function logIn() {
    let email = document.getElementById('loginEmail').value;
    let password = document.getElementById('loginPassword').value;
    auth.signInWithEmailAndPassword(email, password).then(() => {
            setTimeout(location.reload(),100);
        })
        .catch((err) => {
            let temp = `
            <div class="alert alert-danger fade show" role="alert">
                ${err.message}
            </div>`
            $("#login .error").html(temp);
            console.log(err)
            setTimeout(() => {
                $('.alert').alert('close');
            }, 5000)
        });
}

function signOut() {
    auth.signOut().then(() => {
        setTimeout(() => {
            location.reload();
        }, 100)
    }).catch(error => console.error(error));
}

function changeState() {
    const nav = $('.form-inline.ml-auto');
    const display_name = $("#display-name")
    const email = $("#email-address")
    const addGroup = $('#addNewPost > .container')
    auth.onAuthStateChanged(user => {
        if (user) {
            nav.html(`
                <div id="user">
                    <a class="nav-link" data-toggle="modal" data-target="#profile">Welcome: ${user.displayName}</a>
                </div>
                <a onclick="signOut()" class="btn btn-primary">Sign Out</a>
            `);
            display_name.html(user.displayName)
            email.html(user.email)
            addGroup.html(`<button class="btn btn-primary" data-toggle="modal" data-target="#ad-submit">Add New Advertisement</button>`)
            database.ref('ads').orderByChild('adAuthor').equalTo(user.displayName).once('value', snapshot => {
                snapshot.forEach(data => {
                    $('#ads').append(showUsersAds(data.val(),data.key))
                })
            })
            database.ref('chats').once('value', snapshot => {
                console.log(snapshot.val())
                snapshot.forEach(data => {
                    console.log(data.val())
                    $('#chats').append(showChats(data.val(), data.key))
                })
            })
            grantNotificationRequest()
            messaging.onTokenRefresh(handleTokens());
        }
    });
    showPosts()
    setTimeout(() => {
        document.getElementById('loader').style.display = "none";
    }, 5000);
}

function showPosts(categories = null, searchQuery = null) {
    const postsDiv = $('.container > #posts');
    const adRef = database.ref('ads')
    var adPost = "";
    adRef.on('value', snapshot => {
        if (snapshot.exists()) {
            snapshot.forEach(data => {
                adsStore.setItem(data.key, data.val()).catch(err => console.log(err));
            })
        } else {
            postsDiv.html("" + `
                <div class="text-center">        
                    <h3>Nothing to show here</h3>
                    <p>Please try again later......
                        <i class="fa fa-sad-tear"></i>
                    </p>
                </div>
            `)
        }
    });
    if(categories && searchQuery){
        adRef.orderByChild('category').equalTo(categories).on('value', snapshot => {
            if (snapshot.exists()) {
                snapshot.forEach(data => {
                    if(ad.adName == searchQuery){
                        adsStore.getItem(data.key).then(result => {
                            adPost += renderAd(result, data.key);
                            postsDiv.html(adPost);
                        })
                    }
                    else {;
                        postsDiv.html(`
                            <div class="text-center">        
                                <h3>Nothing to show here</h3>
                                <p>Please try again later......
                                    <i class="fa fa-sad-tear"></i>
                                </p>
                            </div>
                        `)
                    }
                })
            } else {
                document.getElementById('posts').innerHTML = "";
                postsDiv.html(`
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
    else if(searchQuery) {
        adsStore.keys().then(keys => {
            keys.forEach(key => {
                adsStore.getItem(key).then(data => {
                    if(data.adName === searchQuery) {
                        adPost += renderAd(data, key);
                        postsDiv.html(adPost);
                    }
                })
            });
        });
    }
    else if(categories){
        adRef.orderByChild('category').equalTo(categories).on('value', snapshot => {
            if (snapshot.exists()) {
                snapshot.forEach(data => {
                    adsStore.getItem(data.key).then(result => {
                        adPost += renderAd(result, data.key);
                        postsDiv.html(adPost);
                    })
                })
            } else {
                document.getElementById('posts').innerHTML = "";
                postsDiv.html(`
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
        adsStore.keys().then(keys => {
            keys.forEach(key => {
                adsStore.getItem(key).then(data => {
                    adPost += renderAd(data, key);
                    postsDiv.html(adPost);
                })
            });
        });
    }
    setTimeout(() => {
        let images = $('img.card-img-top');
        for (let i = 0; i < images.length; i++) {
            images[i].src = images[i].getAttribute('data-src')
            images[i].removeAttribute('data-src')
        }
    }, 5000)
}

function renderAd(data, key) {
    if(auth.currentUser == null) {
        return `
            <div class="card">
                <img class="card-img-top" src="assets/images/placeholder.png" data-src="${data.adImage}">
                <div class="card-body">
                    <h1>${data.adName} <span class="badge badge-secondary">${data.pricing} Rs.</span></h1>
                    <small>Made by: ${data.adAuthor}</small>
                    <p>Category: ${categoryTranslator[data.category]}</p>
                    <hr>
                    <p>${data.adDesc}</p>
                </div>
            </div>
        `
    }
    else if (data.authorID == auth.currentUser.uid) {
        return `
            <div class="card ${checkFavorite(key)}">
                <img class="card-img-top" src="assets/images/placeholder.png" data-src="${data.adImage}">
                <div class="card-body">
                    <h1>${data.adName} <span class="badge badge-secondary">${data.pricing} Rs.</span></h1>
                    <small>Made by: ${data.adAuthor}</small>
                    <p>Category: ${categoryTranslator[data.category]}</p>
                    <hr>
                    <p>${data.adDesc}</p>
                </div>
                <div class="card-footer">
                    <button class="btn" onclick="setAdAsYourFavorite('${key}', this)">Mark as favorite</button>
                    <button class="btn" onclick="saveOffline('${key}')">Save for offline</button>
                </div>
            </div>
        `
    }
    else {
        return `
            <div class="card ${checkFavorite(key)}">
                <img class="card-img-top" src="assets/images/placeholder.png" data-src="${data.adImage}">
                <div class="card-body">
                    <h1>${data.adName} <span class="badge badge-secondary">${data.pricing} Rs.</span></h1>
                    <small>Made by: ${data.adAuthor}</small>
                    <p>Category: ${categoryTranslator[data.category]}</p>
                    <hr>
                    <p>${data.adDesc}</p>
                </div>
                <div class="card-footer">
                    <button class="btn" data-toggle="modal" data-target="#chat-modal" onclick="startChat('${auth.currentUser.displayName}-${data.adAuthor}', '${data.adAuthor}', '${data.authorID}')">Chat Now</button>
                    <button class="btn" onclick="setAdAsYourFavorite('${key}', this)">Mark as favorite</button>
                    <button class="btn" onclick="saveOffline('${key}')">Save for offline</button>
            </div>
            </div>
        `
    }
}

function checkFavorite(key) {
    let res = ""
    database.ref(`users/${auth.currentUser.uid}/ads/favorites/${key}`)
        .on('value', snapshot => {
            if(snapshot.exists()){
                res = snapshot.val() ? "favorite" : "";
            }
        })
    return res;
}

function search() {
    let searchQuery = document.getElementById("searchBar").value
    let category = document.getElementById("categories").value
    showPosts(category, searchQuery);
    searchQuery = "";
}

function showUsersAds(data, key) {
    return `
        <tr>
            <td>${data.adName}</td>
            <td><button class="btn btn-danger" onclick="deleteAdPost('${key}')">Delete this ad</button></td>
        </tr>
    `
}
function showChats(data, key) {
    if(data.buyer === auth.currentUser.displayName) {
    return `
        <tr>
            <td>${data.seller}</td>
            <td><button class="btn btn-default" data-toggle="modal" data-target="#chat-modal" onclick="startChat('${key}')">Start Chat</button></td>
        </tr>
    `
}
    else {
        return `
            <tr>
                <td>${data.buyer}</td>
                <td><button class="btn btn-default" data-toggle="modal" data-target="#chat-modal" onclick="startChat('${key}')">Start Chat</button></td>
            </tr>
        `
    }
}

function setAdAsYourFavorite(key, element) {
    $(element).parent().parent().attr('class', 'favorite');
    database.ref(`users/${auth.currentUser.uid}/ads/favorites/${key}`).set(true);
    sendNotification({
        'title':`Success`,
        'body': "The advertisement has been added to your favorites",
        'icon': 'assets/images/icons/icon-192x192.png'
    })
}

function saveOffline(key) {
    console.log(key)
    adsStore.getItem(key).then(res => {
        offlineAdsStore.setItem(key, res).then(() => {
            sendNotification({
                'title':`Success`,
                'body': "The advertisement has been saved offline",
                'icon': 'assets/images/icons/icon-192x192.png'
            })
        })
    })
}

function deleteAdPost(key) {
    database.ref(`ads/${key}`).remove();
    database.ref(`users/${auth.currentUser.uid}/ads/${key}`).remove();
    adsStore.removeItem(key).then(res => console.log(res))
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

    imageRef.putString(imageURL, 'data_url').then((snapshot) => {
        console.log(snapshot)
        firebase.storage().ref().child(`adImages/${fileName}`).getDownloadURL().then((url) => {
           console.log(url)
            adImage = url;
            console.log(adImage)
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
        }).catch(error => console.log(error))
    }).catch(error => console.log(error));

}
function startChat(key, receiver = null, receiverKey = null) {
    let receiverToken;
    let chatRoomRef = database.ref(`chats/${key}`);
    chatRoomRef.once('value', snapshot => {
        if(snapshot.exists()){                    
            if(snapshot.val().seller == auth.currentUser.displayName) {
                $("#individual").html(snapshot.val().buyer)
                retreiveToken(snapshot.val().buyerID).then(token => {
                    receiverToken = token;
                })
            }
            else {
                $("#individual").html(snapshot.val().seller);
                retreiveToken(snapshot.val().sellerID).then(token => {
                    receiverToken = token;
                })
            }
        }
        else {
            chatRoomRef.set({
                buyer: auth.currentUser.displayName,
                buyerID: auth.currentUser.uid,
                seller: receiver,
                sellerID: receiverKey,
                messages: {}
            })
            $("#individual").html(receiver);
            retreiveToken(receiverKey).then(token => {
                receiverToken = token;
            })
            
        }
    })
    console.log(key);
    showMessages(key);
    $("#send").on('click', function(){
        sendMessage(key, receiverToken);
    });
}

function showMessages(room) {
    console.log(room);
    const roomRef = database.ref(`chats/${room}/messages`);
    let msg = "";
    $("#chat-message").html(msg);
    roomRef.on('child_added', snapshot => {
        console.log(snapshot.val().timestamp)
        msg += renderMessage(snapshot.val());
        $("#chat-message").html(msg);
        $('#chat-message').scrollTop($('#chat-message').height())
    })
}

function retreiveToken(uid) {
    return new Promise((resolve) => {
        let token;
        database.ref(`users/${uid}/token`).once('value', snapshot => {
            token = snapshot.val();
            return resolve(token);
        });
    })
}

function renderMessage(data) {
    return `<div class="message">
        <p>${data.message}</p>
        <small>${data.sender}: Sent on: ${(new Date(data.timestamp)).toLocaleString()}</small>
    </div>`
}

function sendMessage(room, to) {
    console.log(room)
    const roomRef = database.ref(`chats/${room}/messages`);
    const message = $("#message").val();
    roomRef.push().set({
        message,
        sender: auth.currentUser.displayName,
        timestamp: Date.now()
    });
    document.getElementById("message").value = "";
    fetch("https://fcm.googleapis.com/fcm/send", {
        "method": "POST",
        'headers': {
            'Authorization': 'key=' + KEY,
            'Content-Type': 'application/json'
        },
        "body": JSON.stringify({
            'notification': {
                'title':`New Message from ${auth.currentUser.displayName}`,
                'body': message,
				'icon': 'assets/images/icons/icon-192x192.png'
            },
            "to": to
        })
    }).then(res => console.log(res)).catch(err => console.log(err))
}

function updateUI(worker) {
    let userUpdate = confirm("A new update is released.\n Do you wanna apply it now or later")
    if(userUpdate != true) {
        return
    }
    worker.postMessage({action: 'skipWaiting'});
    setTimeout(location.reload(), 1000);
}

function trackUpdates(worker) {
    worker.addEventListener('statechange', () => {
        if(worker.state === "installed") {
            updateUI(worker);
        }
    })
}

function renderNotification (data) {
    return `
        <div class="notification">
            <div class="image">
                <img src="${data.icon}">
            </div>
            <div class="data">
                <h5>${data.title}</h5>
                <p>${data.body}</p>
            </div>
        </div>
    `
}

$("select#categories").change(function() {
    showPosts($(this).val());
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => {
            console.log(`Service Worker Scope: ${reg.scope}`);
            reg.addEventListener('updatefound', () => {
                trackUpdates(reg.installing)
            })
            if(reg.installing) {
                trackUpdates(reg.installing)
                return
            }
            if(reg.waiting) {
                updateUI(reg.waiting);
                return;
            }
        })
        .catch(error => console.log(error));
}
function grantNotificationRequest(){
    messaging.requestPermission().then(() => {
        const push = new Notification("Notification Request has been granted", {
            body: "You can now receive notifications",
            icon: "assets/images/icons/icon-192x192.png"
        });
        setTimeout(() => {
            push.close()
        }, 5000);
            handleTokens();
    }).catch(() => {
        console.log("Notification Request has been denied");
    })
}

function handleTokens() {
    return messaging.getToken().then(token => {
        database.ref(`users/${auth.currentUser.uid}/token`).set(token)
    })
}
function sendNotification (data) {
    $('#toast-notifications').append(renderNotification(data)).fadeIn();
    setTimeout(() => {
        $('#toast-notifications').empty().fadeOut();
    }, 10000)
}

messaging.onMessage(payload => {
    sendNotification(payload.notification)
})

window.onload = changeState();