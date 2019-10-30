const {
    db
} = require("../util/admin")

exports.getAllNews = (req, res) => {
    db.collection("news").orderBy('createdAt', "desc").get()
        .then(data => {
            let news = []
            data.forEach((doc) => {
                news.push({
                    newsId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt,
                    commentCount: doc.data().commentCount,
                    likeCount: doc.data().likeCount,
                    userImage: doc.data().userImage
                })
            })
            return res.json(news)
        })
        .catch(err => console.log(err))
}

exports.postNews = (req, res) => {
    if (req.body.body.trim() === '') {
        return res.status(400).json({
            body: "must not be empty"
        })
    }
    const newNews = {
        body: req.body.body,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0
    }
    db.collection("news").add(newNews)
        .then((doc) => {
            const resNews = newNews
            resNews.newsId = doc.id
            res.json(resNews)
        })
        .catch((err) => {
            res.status(500).json({
                error: "Something went wrong!"
            })
            console.error(err)
        })

}

exports.getNews = (req, res) => {
    let newsData = {}
    db.doc(`/news/${req.params.newsId}`).get()
        .then(doc => {
            if (!doc.exists) {
                return req.status(404).json({
                    error: "News not found"
                })
            }

            newsData = doc.data()
            newsData.newsId = doc.id
            return db.collection("comments").orderBy("createdAt", "desc").where("newsId", "==", req.params.newsId).get()
        })
        .then(data => {
            newsData.comments = []
            data.forEach(doc => {
                newsData.comments.push(doc.data())
            })
            return res.json(newsData)
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err.code
            })
        })
}

exports.commentOnNews = (req, res) => {
    if (req.body.body.trim() === "") return res.status(400).json({
        comment: "Must not be empty"
    })
    const newComment = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        newsId: req.params.newsId,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl
    }

    db.doc(`/news/${req.params.newsId}`).get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(400).json({
                    error: "News not found"
                })
            }
            return doc.ref.update({
                commentCount: doc.data().commentCount + 1
            })
        })
        .then(() => {
            return db.collection("comments").add(newComment)
        })
        .then(() => {
            res.json(newComment)
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: "Something went wrong"
            })
        })
}

exports.likeNews = (req, res) => {
    const likeDocument = db.collection("likes").where("userHandle", "==", req.user.handle)
        .where("newsId", '==', req.params.newsId).limit(1)

    const newsDocument = db.doc(`/news/${req.params.newsId}`)
    let newsData
    newsDocument.get()
        .then(doc => {
            if (doc.exists) {
                newsData = doc.data()
                newsData.newsId = doc.id
                return likeDocument.get()
            } else {
                return res.status(404).json({
                    error: "News not found"
                })
            }
        })
        .then(data => {
            if (data.empty) {
                return db.collection("likes").add({
                        newsId: req.params.newsId,
                        userHandle: req.user.handle
                    })
                    .then(() => {
                        newsData.likeCount++
                        return newsDocument.update({
                            likeCount: newsData.likeCount
                        })
                    })
                    .then(() => {
                        return res.json(newsData)
                    })
            } else {
                return res.status(400).json({
                    error: "News already liked"
                })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err.code
            })
        })
}

exports.unlikeNews = (req, res) => {

    const likeDocument = db.collection("likes").where("userHandle", "==", req.user.handle)
        .where("newsId", '==', req.params.newsId).limit(1)

    const newsDocument = db.doc(`/news/${req.params.newsId}`)
    let newsData
    newsDocument.get()
        .then(doc => {
            if (doc.exists) {
                newsData = doc.data()
                newsData.newsId = doc.id
                return likeDocument.get()
            } else {
                return res.status(404).json({
                    error: "News not found"
                })
            }
        })
        .then(data => {
            if (data.empty) {
                return res.status(400).json({
                    error: "News not liked"
                })

            } else {
                return db.doc(`/likes/${data.docs[0].id}`).delete()
                    .then(() => {
                        newsData.likeCount--
                        return newsDocument.update({
                            likeCount: newsData.likeCount
                        })
                    })
                    .then(() => {
                        res.json(newsData)
                    })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err.code
            })
        })
}

exports.deleteNews = (req, res) => {
    const document = db.doc(`/news/${req.params.newsId}`)
    document.get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(404).json({
                    error: "News not found"
                })
            }
            if (doc.data().userHandle !== req.user.handle) {
                return res.status(403).json({
                    error: "Unauthorized"
                })
            } else {
                return document.delete()
            }
        })
        .then(() => {
            res.json({
                message: "News deleted successfully "
            })
        })
        .catch((err) => {
            console.error(err)
            return res.status(500).json({
                error: err.code
            })
        })
}