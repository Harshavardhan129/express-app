const express = require("express");
const app = express();
const port = 3000;
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const bcrypt = require("bcrypt");

var serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

app.set("view engine", "ejs");

app.get("/signin", (req, res) => {
  res.render("signin");
});

app.get("/signinsubmit", (req, res) => {
  const email = req.query.email;
  const password = req.query.password;  
  db.collection('users')
    .where("email", "==", email)
    .get()
    .then((docs) => {
      if (docs.size > 0) {
        let userDoc;
        docs.forEach((doc) => {
          userDoc = doc;
        });
        const user = userDoc.data();
        bcrypt.compare(password, user.password)
          .then((match) => {
            if (match) {
              res.render("cod");
            } else {
              res.send("<h1>Login failed, incorrect login credentials</h1>");
            }
          })
          .catch((error) => {
            console.error("Error comparing passwords:", error);
            res.send("<h1>Login failed</h1>");
          });
      } else {
        res.send("<h1>Login failed, incorrect login credentials</h1>");
      }
    })
    .catch((error) => {
      console.error("Error checking login credentials:", error);
      res.send("<h1>Login failed</h1>");
    });
});

app.get("/signupsubmit", (req, res) => {
  const firstname = req.query.firstname;
  const lastname = req.query.lastname;
  const email = req.query.email;
  const password = req.query.password;
  db.collection('users')
    .where("email", "==", email)
    .get()
    .then((docs) => {
      if (docs.size > 0) {
        res.render("signfail");
      } else {
        bcrypt.hash(password, 10)
          .then((hashedPassword) => {
            return db.collection('users').add({
              name: firstname + " " + lastname,
              email: email,
              password: hashedPassword,
            });
          })
          .then(() => {
            res.render("signsucc");
          })
          .catch((error) => {
            console.error("Error signing up:", error);
            res.send("Signup failed");
          });
      }
    })
    .catch((error) => {
      console.error("Error checking for existing email:", error);
      res.send("Signup failed");
    });
});

app.get("/navsubmit", (req, res) => {
  res.render("signin");
});

app.get("/", (req, res) => {
  res.render("signup");
});

app.get("/cod", (req, res) => {
  res.render("cod");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
