# Noose

Noose is a social media app to share news/updates between a group of people developed in React, Redux and Firebase. 

The app utilizes several Firebase services such as 

- Authentication to allow users to register and login to the web application.
- Cloud Firestore to store and sync news for the client- and server-side development.
- Cloud Storage to store and serve user-generated content like their profile pictures.
- Cloud Functions to automatically run backend code (Node.js) in response to events triggered by Firebase features and HTTPS requests.
- Notification services to notify users when someone comments in a post they created.

The front end of the app is built in React and Redux and fulfills the following requirements. 

- Everyone can see News/updates. 
- Users can register, login, and logout. The token is stored in local storage and deleted once the user logout. 
- Only authenticated users can post news/updates, comment, or like a post. 
- Only news/update owners can edit a post or delete it.
- Users should receive a notification when someone likes or comment in their posts. 
- Authenticated users can view their details on the home page and edit their details. 
