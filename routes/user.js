const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../model/User");

router.post("/signup", async (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, 10);

  try {
    const user = await new Promise((res, rej) => {
      User.findOne({username: req.body.username}, (err, user) => {
        if (err) rej(err);
        res(user);
      });
    });
    if (user) {
      return res.status(409).json({message: "User already exists"});
    }
  }
  catch(err) {
    return res.status(500).json({message: "Error while checking if user exists: " + err});
  }

  const user = new User({
    username: req.body.username, 
    password: hash
  });

  try {
    await user.save();
    res.status(201).json({message: "User saved"});
  }
  catch (err) {
    console.log(err);
    res.status(500).json({message: "Error while saving user."});
  }
});

router.post("/signin", async (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, 10);

  try {
    const user = await new Promise((res, rej) => {
      User.findOne({username: req.body.username}, (err, user) => {
        if (err) rej(err);
        res(user);
      });
    });
    if (!user) {
      return res.status(401).json({message: "Username or password is incorrect."});
    }
    if (bcrypt.compareSync(req.body.password, user.password)) {
      const token = jwt.sign(
        {
          username: user.username
        },
        process.env.PRIVATE_KEY
      );
      return res.status(200).json({
        message: "Successfully logged in",
        token: token
      });
    } else {
      res.status(401).json({message: "Username or password is incorrect"});
    }
  }
  catch(err) {
    return res.status(401).json({message: "Auth failed" + err});
  }
});

router.delete("/:username", userAuth, async (req, res) => {
  User.findOneAndRemove({username: req.params.username}, (err, user) => {
    if (err) {
      res.status(500).json({message: "Error while deleting user."});
    } else {
      if (user) {
        res.status(200).json({message: "User deleted."});
      } else {
        res.status(400).json({message: "User with that ID not found."});
      }
    }
  });
});

module.exports = router;