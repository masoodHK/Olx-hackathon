const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();
const messaging = firebase.messaging();
var installPromptEvent;
const fileRef = $('input[type=file]#adImage')
var fileType
fileRef.on('change', function (event) {
    var file = event.target.files;

    for (let i = 0, f; f = file[i]; i++) {
        if (!f.type.match('image/*')) {
            continue;
        }
        console.log(f);
        fileType = f.type;
        const reader = new FileReader();

        reader.onload = (function (theFile) {
            return function (e) {
                // Render thumbnail.
                var span = document.createElement('span');
                span.innerHTML = ['<img class="thumb" src="', e.target.result,
                    '" title="', escape(theFile.name), '"/>'].join('');
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
                    <a class="nav-link" onclick="alert('test')">Welcome: ${user.displayName}</a>
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
    adRef.on('child_added', snapshot => {
        adPost = renderAd(snapshot.val(), snapshot.key)
        postsDiv.html(adPost)
    });
}
function renderAd(data, key) {
    console.log(data.adName);
    return `
        <div class="card">
            <img class="card-img-top" src="${data.adImage}" alt="Card image cap">
            <div class="card-body">
                <h1>${data.adName}</h1>
                <small>Made by:${data.adAuthor}</small>
            </div>
        </div>
    `
}
function search() {
    let searchQuery = document.getElementById("searchBar").value
    let category = document.getElementById("categories").value
    showPosts(category, searchQuery);
}


function addNewAd() {
    const adName = document.getElementById('ad-name').value;
    const category = $('select#categories').val();
    const imageRef = storage.ref('/');
    let file = fileRef.val()
    imageRef.put(file, {content: fileType});
    imageRef
    let adAuthor = auth.currentUser.displayName;
    let adPost = {
        adName,
        category,
        adImage,
        adAuthor,
    }

    database.ref(`users/${auth.currentUser.uid}/ads`).push().set(true);
    database.ref(`ads`).push().set(adAuthor);
    location.reload();
}
/*
function viewPolls(user = null) {
    const accordion = $('.ui.styled.accordion');
    let poll
    database.ref(`polls`).on('child_added', snapshot => {
        if(user){
            poll = renderPoll(snapshot.val(), snapshot.key, user);
        }
        else {
            poll = renderPoll(snapshot.val(), snapshot.key);
        }
        accordion.append(poll);
    });
}

function renderPoll(data, key, user = null) {
    let pollOptions = ``
    for(let i = 0; i < 4; i++) {
        pollOptions += `
            <div class="field">
                <div class="ui radio checkbox">
                    <input type="radio" name="pollOption" value="${i + 1}" tabindex="0">
                    <label>${data.option[`option${i + 1}`]}</label>
                </div>
            </div>
        `
    }
    if(user) {
        return `
            <div class="title">
                <i class="dropdown icon"></i>
                <h4>
                    ${data.question}
                    <br>                
                    <small>Made by: ${data.author}</small>
                </h4>
                <span style="margin-left:auto">
                    <button class="ui button" onClick="deletePoll('${key}')">Delete Poll</button>
                </span>
            </div>
            <div class="content">
                <div class="ui form">
                    <div class="grouped fields">
                        ${pollOptions}
                        <button class="ui button" onclick="showResults(this, '${key}')">Submit</button>
                    </div>
                </div>
            </div>
        `
    }
    else {
        return `
            <div class="title">
                <i class="dropdown icon"></i>
                <h4>
                    ${data.question}
                    <br>                
                    <small>Made by: ${data.author}</small>
                </h4>
            </div>
            <div class="content">
                <div class="ui form">
                    <div class="grouped fields">
                        ${pollOptions}
                        <button class="ui button" onclick="showResults(this, '${key}')">Submit</button>
                    </div>
                </div>
            </div>
        `
    }
}

function showResults(element, key) {
    let el = $(element).parent().parent();
    let option = $("input:radio[name=pollOption]:checked").val();
    const dataRefPoll = database.ref(`polls/${key}`);
    let dataRes, pollResult = "", options;
    dataRefPoll.on('value', snapshot => {
        dataRes = snapshot.val().results
        options = snapshot.val().option
        dataRes[`option${option}`]++;
    });
    for(let i = 0; i < 4; i++) {
        pollResult += `<p>${options[`option${i + 1}`]} : ${dataRes[`option${i + 1}`]}</p>`
    }
    database.ref(`polls/${key}/results`).set(dataRes);
    el.html(
        `
            <h4>Thank you for taking part in this poll. Here are the results</h4>
            ${pollResult}
        `
    );
}

function deletePoll(pid = null) {
    database.ref(`users/${auth.currentUser.uid}/polls/${pid}`).remove();
    database.ref(`polls/${pid}`).remove();
    location.reload();
}


*/
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log(`Service Worker Scope: ${reg.scope}`))
        .catch(error => console.log(error));
    navigator.serviceWorker.ready.then(function (reg) {
        reg.sync.register('dataSync');
    });
}

window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    installPromptEvent = event;
    console.log(installPromptEvent)
});

changeState();