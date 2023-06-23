var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");
const { DateTime } = require("luxon");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const he = require("he");
let Blog = require("../models/blog");
let User = require("../models/user");
let Comment = require("../models/comments");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json();
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
  "/frontpage",
  asyncHandler(async (req, res, next) => {
    let Blogs = await Blog.find({ frontpage: true, published: true })
      .limit(3)
      .sort({ date: -1 })
      .exec();
    res.json(Blogs);
  })
);

router.get(
  "/article/:id",
  asyncHandler(async (req, res, next) => {
    let blog = await Blog.findById(req.params.id).populate("author").exec();
    let comments = await Comment.find({ blog: blog._id })
      .limit(4)
      .sort({ date: -1 })
      .exec();
    console.log(blog, comments);
    res.json({ blog, comments });
  })
);
router.get(
  "/article/:id/all-comments",
  asyncHandler(async (req, res, next) => {
    let blog = await Blog.findById(req.params.id).exec();
    let comments = await Comment.find({ blog: blog._id })
      .sort({ date: -1 })
      .exec();

    res.json({ comments });
  })
);

router.post("/article/:id/comment", [
  body("name", "Invalid name").trim().isLength({ min: 1 }).escape(),
  body("content", "Invalid comment").trim().isLength({ min: 1 }).escape(),
  asyncHandler(async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ message: "Unsuccessful", errors: errors.array() });
    } else {
      const currentDateTime = DateTime.now().toISO();
      let blog = await Blog.findById(req.params.id).exec();
      let comment = new Comment({
        blog: req.params.id,
        name: req.body.name,
        content: req.body.content,
        date: currentDateTime,
      });
      await comment.save();
      res.json({ message: "success" });
    }
  }),
]);

// Author servers!

router.post("/login", [
  body("username", "Invalid username").trim().isLength({ min: 1 }).escape(),
  body("password", "Invalid password").trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ message: "Unsuccessful", errors: errors.array() });
    } else {
      let username = req.body.username;
      let password = req.body.password;
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
  body("content", "Content should be atleast 100 characters")
    .trim()
    .isLength({ min: 100 })
    .escape(),
  body("image", "Image url is invalid").trim().isLength({ min: 10 }).escape(),
  body("alt", "Alt for image is required").trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res, next) => {
    try {
      jwt.verify(req.token, process.env.SECRET, async (err, authData) => {
        if (err) {
          res.sendStatus(403);
        } else {
          const errors = validationResult(req);
          const currentDateTime = DateTime.now().toISO();
          let publishedStatus = false;
          if (req.body.published) {
            publishedStatus = true;
          }
          let newBlog = new Blog({
            author: authData.user._id,
            title: req.body.title,
            desc: req.body.desc,
            image: he.decode(req.body.image),
            alt: req.body.alt,
            content: req.body.content,
            published: publishedStatus,
            date: currentDateTime,
          });

          if (!errors.isEmpty()) {
            let arr = errors.array();
            res.json({ arr });
          } else {
            await newBlog.save();
            res.json({ message: "Success", blog: newBlog });
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

          // Encode the image URL before sending it in the response

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
  body("image", "Image url is invalid").trim().isLength({ min: 1 }).escape(),
  body("alt", "Alt for image is required").trim().isLength({ min: 1 }).escape(),

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
            desc: req.body.desc,
            image: he.decode(he.decode(req.body.image)),
            alt: req.body.alt,
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
  "/author/:id",
  verifyToken,
  asyncHandler(async (req, res, next) => {
    try {
      jwt.verify(req.token, process.env.SECRET, async (err, authData) => {
        if (err) {
          res.sendStatus(403);
        } else {
          await Blog.findByIdAndRemove(req.params.id);
          res.json({ message: "successfully removed" });
        }
      });
    } catch (error) {
      res.sendStatus(403);
    }
  })
);

module.exports = router;
