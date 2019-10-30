const {
    db,
    admin
} = require("../util/admin")
const config = require("../util/config")
const firebase = require("firebase")
firebase.initializeApp(config)

const {
    validateSignUpData,
    validateLoginData,
    reduceUserDetails
} = require("../util/validators")

exports.signup = (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    }

    const {
        valid,
        errors
    } = validateSignUpData(newUser)
    if (!valid) return res.status(400).json(errors)

    const noImg = "no-img.png"

    let token, userId
    db.doc(`/users/${newUser.handle}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                return res.status(400).json({
                    handle: "This handle is already taken"
                })
            } else {
                return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        })
        .then((data) => {
            userId = data.user.uid
            return data.user.getIdToken()
        }) // ** we need this step to create a user details collection coz Firebase auth does not store full details
        .then((idToken) => {
            token = idToken
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
                userId
            }
            return db.doc(`/users/${newUser.handle}`).set(userCredentials)
        })
        .then((data) => {
            return res.status(201).json({
                token
            })
        })
        .catch((err) => {
            console.log(err)
            if (err.code === "auth/email-already-in-use") {
                return res.status(400).json({
                    email: "Email already in use"
                })
            } else {
                return res.status(500).json({
                    general: "Something went wrong, please try again"
                })
            }
        })
}

exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    }

    const {
        valid,
        errors
    } = validateLoginData(user)
    if (!valid) return res.status(400).json(errors)


    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken()
        })
        .then(token => {
            return res.json({
                token
            })
        })
        .catch(err => {
            console.log(err)

            return res.status(403).json({
                general: "Wrong credentials, try again "
            })

        })
}

// add users details 
exports.addUserDetails = (req, res) => {
    let userDetails = reduceUserDetails(req.body)

    db.doc(`/users/${req.user.handle}`).update(userDetails)
        .then(() => {
            return res.json({
                message: "Details are added"
            })
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({
                error: err.code
            })
        })
}

/// get any user's details
exports.getUserDetails = (req, res) => {
    userData = {}
    db.doc(`/users/${req.params.handle}`).get()
        .then(doc => {
            if (doc.exists) {
                userData.user = doc.data()
                return db.collection('news').where("userHandle", "==", req.params.handle)
                    .orderBy("createdAt", "desc").get()
            } else {
                return res.status(404).json({
                    error: "User not found"
                })
            }
        })
        .then(data => {
            userData.news = []
            data.forEach(doc => {
                userData.news.push({
                    body: doc.data().body,
                    createdAt: doc.data().createdAt,
                    userHandle: doc.data().userHandle,
                    userImage: doc.data().userImage,
                    likeCount: doc.data().likeCount,
                    commentCount: doc.data().commentCount,
                    newsId: doc.data().newsId
                })
            })
            return res.json(userData)
        })
        .catch(err => {
            console.error(err)
            return res.status(500).json({
                error: err.code
            })
        })
}


// get own user details  
exports.getAuthenticatedUser = (req, res) => {
    let userData = {}
    db.doc(`/users/${req.user.handle}`).get()
        .then((doc) => {
            if (doc.exists) {
                userData.credentials = doc.data()
                return db
                    .collection("likes")
                    .where("userHandle", '==', req.user.handle)
                    .get()
            }
        })
        .then((data) => {
            userData.likes = []
            data.forEach((doc) => {
                userData.likes.push(doc.data())
            })
            return db.collection('notifications').where("recipient", "==", req.user.handle)
                .orderBy('createdAt', 'desc').limit(10).get()
        })
        .then(data => {
            userData.notifications = []
            data.forEach((doc) => {
                userData.notifications.push({
                    recipient: doc.data().recipient,
                    sender: doc.data().sender,
                    createdAt: doc.data().createdAt,
                    newsId: doc.data().newsId,
                    type: doc.data().type,
                    read: doc.data().read,
                    notificationId: doc.id
                })
            })
            console.log(userData)
            return res.json(userData)
        })
        .catch((err) => {
            console.log(err)
            return res.status(500).json({
                error: err.code
            })
        })

}
// Upload a profile image
exports.uploadImage = (req, res) => {
    const BusBoy = require("busboy")
    const path = require("path")
    const os = require("os")
    const fs = require("fs")
    const busboy = new BusBoy({
        headers: req.headers
    })

    let imageToBeUploaded = {}
    let imageFileName


    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {

        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(400).json({
                error: "Wrong format!"
            })
        }


        const imageExtension = filename.split('.').pop()

        imageFileName = `${Math.round(
            Math.random() * 1000000000000
          ).toString()}.${imageExtension}`;

        const filepath = path.join(os.tmpdir(), imageFileName)
        imageToBeUploaded = {
            filepath,
            mimetype
        }
        file.pipe(fs.createWriteStream(filepath))

    })
    busboy.on("finish", () => {
        admin.storage().bucket(`${config.storageBucket}`).upload(imageToBeUploaded.filepath, {
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: imageToBeUploaded.mimetype
                    }
                }
            })
            .then(() => {
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`
                return db.doc(`/users/${req.user.handle}`).update({
                    imageUrl
                })
            })
            .then(() => {
                return res.json({
                    message: "Image uploaded successfully"
                })
            })
            .catch(err => {
                console.error(err)
                return res.status(500).json({
                    error: 'something went wrong'
                })
            })
    })

    busboy.end(req.rawBody);
}

exports.markNotificationsAsRead = (req, res) => {

    let batch = db.batch()
    req.body.forEach(NotificationId => {
        const notification = db.doc(`/notifications/${NotificationId}`)
        batch.update(notification, {
            read: true
        })
    })
    batch.commit()
        .then(() => {
            return res.json({
                message: "Notification marked as read"
            })
        })
        .catch(err => {
            console.error(err)
            return res.status(500).json({
                error: err.code
            })
        })
}