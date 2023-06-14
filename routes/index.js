var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");
const { DateTime } = require("luxon");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
let Blog = require("../models/blog");
let User = require("../models/user");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json();
});

router.get("/a", (req, res, next) => {
  res.json({ message: "welcome to api" });
});

router.post("/a/posts", verifyToken, (req, res, next) => {
  jwt.verify(req.token, process.env.SECRET, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      res.json({ message: "post created", authData });
    }
  });
});
//verify token
function verifyToken(req, res, next) {
  //Get auth header value
  const bearerHeader = req.headers["authorization"];
  //Check if bearer is undefined
  if (typeof bearerHeader !== "undefined") {
    //Split header
    bearer = bearerHeader.split(" ");
    //get token from array
    const bearerToken = bearer[1];
    //Set the token
    req.token = bearerToken;
    //Next middleware
    next();
  } else {
    //forbidden
    res.sendStatus(403);
  }
}
router.get(
  "/articles",
  asyncHandler(async (req, res, next) => {
    let Blogs = await Blog.find({ published: true }).sort({ title: 1 }).exec();

    res.json(Blogs);
  })
);

router.get(
  "/article/:id",
  asyncHandler(async (req, res, next) => {
    let blog = await Blog.findById(req.params.id).exec();
    let comments = await Comment.find({ blog: blog._id }).exec();
    console.log(blog, comments);
    res.json({ blog, comments });
  })
);
router.post(
  "/article/:id/comment",
  asyncHandler(async (req, res, next) => {
    let blog = await Blog.findById(req.params.id).exec();
    let comment = new Comment({
      blog: blog._id,
      name: req.body.name,
      content: req.body.content,
    });
    await comment.save();
    res.redirect("/article/:id");
  })
);

// Author servers!

module.exports = router;

router.post("/login", [
  body("username", "Invalid username").trim().isLength({ min: 0 }).escape(),
  body("password", "Invalid password").trim().isLength({ min: 0 }).escape(),

  asyncHandler(async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ message: "Unsuccessful", errors: errors.array() });
    } else {
      let username = "shrawn";
      let password = "1234";
      let user = await User.findOne({ username: username });
      if (!user) {
        return res.json({ message: "User does not exist" });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.json({ message: "Wrong password" });
      }

      jwt.sign(
        { user },
        process.env.SECRET,
        { expiresIn: "12h" },
        (err, token) => {
          res.json({ token });
        }
      );
    }
  }),
]);

router.get(
  "/author",
  verifyToken,
  asyncHandler(async (req, res, next) => {
    try {
      jwt.verify(req.token, process.env.SECRET, async (err, authData) => {
        if (err) {
          res.sendStatus(403);
        } else {
          let authorsBlogs = await Blog.find({
            author: authData.user._id,
          })
            .sort({ date: -1 })
            .exec();

          res.json(authorsBlogs);
        }
      });
    } catch (error) {
      res.sendStatus(403);
    }
  })
);

router.post("/author/blog", [
  verifyToken,
  body("title", "Title must be atleast 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("image", "Invalid image url").trim().isLength({ min: 1 }).escape(),
  body("content", "Content should be atleast 100 characters")
    .trim()
    .isLength({ min: 100 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    try {
      jwt.verify(req.token, process.env.SECRET, async (err, authData) => {
        if (err) {
          res.sendStatus(403);
        } else {
          const errors = validationResult(req);
          const currentDateTime = DateTime.now().toISO();
          let newBlog = new Blog({
            author: authData.user._id,
            title: req.body.title,
            image: req.body.img,
            content: req.body.content,
            published: req.body.published,
            date: currentDateTime,
          });

          if (!errors.isEmpty()) {
            let arr = errors.array();
            res.json({ arr });
          } else {
            await newBlog.save();
            res.send("Success");
          }
        }
      });
    } catch (error) {
      res.sendStatus(403);
    }
  }),
]);

router.get(
  "/author/:id",
  verifyToken,
  asyncHandler(async (req, res, next) => {
    try {
      jwt.verify(req.token, process.env.SECRET, async (err, authData) => {
        if (err) {
          res.sendStatus(403);
        } else {
          let blog = await Blog.findById(req.params.id)
            .populate("author")
            .exec();
          res.json({ blog, authData });
        }
      });
    } catch (error) {
      res.sendStatus(403);
    }
  })
);

router.put("/author/:id", verifyToken, [
  body("title", "Title must be atleast 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("image", "Invalid image url").trim().isLength({ min: 1 }).escape(),
  body("content", "Content should be atleast 100 characters")
    .trim()
    .isLength({ min: 100 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    try {
      jwt.verify(req.token, process.env.SECRET, async (err, authData) => {
        if (err) {
          res.sendStatus(403);
        } else {
          const errors = validationResult(req);
          const currentDateTime = DateTime.now().toISO();
          const { id } = req.params;
          const updatedBlog = {
            title: req.body.title,
            image: req.body.image,
            content: req.body.content,
            published: req.body.published,
            date: currentDateTime,
          };

          const result = await Blog.findOneAndUpdate(
            { _id: id },
            { $set: updatedBlog },
            { new: true }
          );

          if (result) {
            // Document updated successfully
            res.json({ message: "Success", blog: result });
          } else {
            // Document not found or update failed
            res.json({ message: "Update failed" });
          }
        }
      });
    } catch (error) {
      res.sendStatus(403);
    }
  }),
]);

router.delete(
  "author/:id",
  verifyToken,
  asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.SECRET, async (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        await Blog.findByIdAndRemove(req.params.id);
        res.json({ message: "successfully removed" });
      }
    });
  })
);

module.exports = router;
