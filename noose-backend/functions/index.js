const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./util/fbAuth");
const cors = require('cors');
app.use(cors());
const { db } = require("./util/admin");
const {
  getAllNews,
  postNews,
  getNews,
  deleteNews,
  commentOnNews,
  likeNews,
  unlikeNews
} = require("./handlers/news");

const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsAsRead
} = require("./handlers/users");

// ** News route
app.get("/news", getAllNews);
app.post("/news", FBAuth, postNews);
app.get("/news/:newsId", getNews);
app.delete("/news/:newsId", FBAuth, deleteNews);
app.get("/news/:newsId/like", FBAuth, likeNews);
app.get("/news/:newsId/unlike", FBAuth, unlikeNews);
app.post("/news/:newsId/comment", FBAuth, commentOnNews);

// ** Users Route
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);
app.get("/user/:handle", getUserDetails);
app.post("/notifications", FBAuth, markNotificationsAsRead);

exports.api = functions.https.onRequest(app);
exports.createNotificationOnLike = functions.firestore
  .document(`likes/{id}`)
  .onCreate(snapshot => {
    return db
      .doc(`/news/${snapshot.data().newsId}`)
      .get()
      .then(doc => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "like",
            read: false,
            newsId: doc.id
          });
        }
      })
      .catch(err => {
        console.error(err);
        return; // it's only an API trigger, no need for res
      });
  });

exports.deleteNotificationOnUnLike = functions.firestore
  .document("likes/{id}")
  .onDelete(snapshot => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch(err => {
        console.error(err);
        return;
      });
  });

exports.createNotificationOnComment = functions.firestore
  .document(`comments/{id}`)
  .onCreate(snapshot => {
    return db
      .doc(`/news/${snapshot.data().newsId}`)
      .get()
      .then(doc => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "comment",
            read: false,
            newsId: doc.id
          });
        }
      })
      .catch(err => {
        console.error(err);
        return; // it's only an API trigger, no need for res
      });
  });

exports.onUserImageChange = functions.firestore
  .document("/users/{userId}")
  .onUpdate(change => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log("image has been changed");
      const batch = db.batch();
      return db
        .collection("news")
        .where("userHandle", "==", change.before.data().handle)
        .get()
        .then(data => {
          data.forEach(doc => {
            const news = db.doc(`/news/${doc.id}`);
            batch.update(news, {
              userImage: change.after.data().imageUrl
            });
          });
          return batch.commit();
        });
    } else return true;
  });

exports.onNewsDelete = functions.firestore
  .document("/news/{newsId}")
  .onDelete((snapshot, context) => {
    const newsId = context.params.newsId;
    const batch = db.batch();
    return db
      .collection("comments")
      .where("newsId", "==", newsId)
      .get()
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db
          .collection("likes")
          .where("newsId", "==", newsId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection("notifications")
          .where("newsId", "==", newsId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch(err => console.error(err));
  });
