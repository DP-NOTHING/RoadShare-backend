const axios = require("axios");

module.exports = {
  // APIs
  apis: function (app, admin) {
    app.post("/api/signUp", async (req, res, next) => {
      if (req && req.body) {
        // Get the user information to add to the account
        let user_email = req.body["email"].toLowerCase();
        let first_name = req.body["firstName"];
        let last_name = req.body["lastName"];
        // Add the user to the the databse
        // const db=admin.database();

        await admin
          .firestore()
          .collection("users")
          .doc(`${user_email}`)
          .set({
            email: user_email,
            first: first_name,
            last: last_name,
            car_data: {
              avg_mpg: 20,
            },
            transactions: [],
            friends: [],
            balance: 0,
          });
        res.status(200).json({ info: `${user_email} created` });
      } else {
        res.status(204).json({ info: "No request body specfied" });
      }
    });

    app.post("/api/addFriend", async (req, res, next) => {
      if (req && req.body) {
        // Get the user and the friend email
        let friend_email = req.body["friend_email"];
        let user_email = req.body["user_email"];
        // Get the current list of friends
        let friends_list = await admin
          .firestore()
          .collection("users")
          .doc(`${user_email}`)
          .get();
        friends_list = friends_list.data()["friends"];

        // Add new friend to the list of friends
        friends_list.push(friend_email);
        admin
          .firestore()
          .collection("users")
          .doc(user_email)
          .update({ friends: friends_list });

        res.status(200).json({ info: `Friend ${friend_email} added` });
      } else {
        res.status(204).json({ info: "No Request Specified" });
      }
    });

    app.post("/api/getFriends", async (req, res, next) => {
      if (req && req.body) {
        // Get the user and the friend email
        let email = req.body["email"];
        // Get the current list of friends
        let friends_list = await admin
          .firestore()
          .collection("users")
          .doc(`${email}`)
          .get();
        friends_list = friends_list.data()["friends"];

        let output = [];
        for (let i = 0; i < friends_list.length; i++) {
          let friend_doc = await admin
            .firestore()
            .collection("users")
            .doc(`${friends_list[i]}`)
            .get();

          if (friend_doc && friend_doc.exists) {
            let data = {
              name: friend_doc.data().first,
              email: friends_list[i],
            };
            output.push(data);
          }
        }

        res.status(200).json(output);
      } else {
        res.status(204).json({ info: "No Request Specified" });
      }
    });
  },
};
