const admin = require('firebase-admin') // to access to the database
const serviceAccount = require("./noose-ccdf3-firebase-adminsdk-obx7u-d4de758f68.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://noose-ccdf3.firebaseio.com"
});

const db = admin.firestore()

module.exports = {
    admin,
    db
}