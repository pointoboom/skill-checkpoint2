import { Router } from "express";
import { pool } from "../utils/db.js";

const postRouter = Router();
postRouter.get("/", async (req, res) => {
  let title = req.query.title || "";
  let category = req.query.category || "";
  let query = "";
  let values = [];
  if ((title, category)) {
    query = `select * from posts
        inner join posts_categories
        on posts.post_id = posts_categories.post_id
        where posts.title ilike $1
        and category_id ilike $2
        `;
    values = [title, category];
  } else if (title) {
    query = query = `select * from posts        
        where title ilike $1 `;
    values = [title];
  } else if (category) {
    query = `select * from posts
        inner join posts_categories
        on posts.post_id = posts_categories.post_id
        where category_id ilike $1
        `;
    values = [category];
  } else {
    query = `select * from posts
        inner join posts_categories
        on posts.post_id = posts_categories.post_id
		inner join categories
		on posts_categories.category_id = categories.category_id`;
  }
  const data = await pool.query(query, values);
  return res.json({
    data: data.rows,
    message: "Succesfully",
  });
});
postRouter.get("/:id", async (req, res) => {
  const postId = req.params.id;
  const result = await pool.query("select * from posts where post_id=$1", [
    postId,
  ]);

  return res.json({
    data: result.rows[0],
  });
});
postRouter.post("/", async (req, res) => {
  const newPost = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
  };
  const catarr = newPost.categoryId;
  const id = await pool.query(
    `insert into posts (user_id, title, content, created_at, updated_at,upvote,downvote,media_url)
        values ($1, $2, $3, $4, $5,$6,$7,$8) returning post_id`,
    [
      newPost.userId, // this is a mocked user_id, since we have no authentication system on back end
      newPost.title,
      newPost.content,
      newPost.created_at,
      newPost.updated_at,
      0,
      0,
      newPost.mediaURL,
    ]
  );
  catarr.map(async (item) => {
    await pool.query(
      `insert into posts_categories (post_id, category_id)
            values ($1, $2)`,
      [
        id.rows[0].post_id, // this is a mocked user_id, since we have no authentication system on back end
        item,
      ]
    );
  });

  return res.json({
    message: "Post has been created.",
  });
});

postRouter.put("/:id", async (req, res) => {
  const updatedPost = {
    ...req.body,
    updated_at: new Date(),
  };

  const postId = req.params.id;
  const result = await pool.query(
    "update  posts set  user_id=$1,title = $2 , content=$3, updated_at=$4,media_url=$6 where post_id=$5",
    [
      updatedPost.userId, // this is a mocked user_id, since we have no authentication system on back end
      updatedPost.title,
      updatedPost.content,
      updatedPost.updated_at,
      postId,
      updatedPost.mediaURL,
    ]
  );

  return res.json({
    message: `Post ${postId} has been updated.`,
  });
});
postRouter.delete("/:id", async (req, res) => {
  const postId = req.params.id;
  const result = await pool.query("delete from posts where post_id=$1", [
    postId,
  ]);
  return res.json({
    message: `Post ${postId} has been deleted.`,
  });
});

postRouter.post("/:id", async (req, res) => {
  const updatedPost = {
    ...req.body,
    updated_at: new Date(),
  };
  const postId = req.params.id;
  const result = await pool.query(
    "update  posts set  upvote=$1,downvote=$2 where post_id=$3",
    [
      updatedPost.upvote, // this is a mocked user_id, since we have no authentication system on back end
      updatedPost.downvote,
      postId,
    ]
  );
  return res.json({
    message: `Post ${postId} has been updated post vote.`,
  });
});

postRouter.post("/:postId/answer", async (req, res) => {
  const newAnswer = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
  };
  const postId = req.params.postId;
  const id = await pool.query(
    `insert into answers (user_id, content,post_id, created_at, updated_at,upvote,downvote,media_url)
        values ($1, $2, $3, $4, $5,$6,$7) returning post_id`,
    [
      newAnswer.userId, // this is a mocked user_id, since we have no authentication system on back end
      newAnswer.content,
      postId,
      newAnswer.created_at,
      newAnswer.updated_at,
      0,
      0,
      newAnswer.mediaURL,
    ]
  );
  return res.json({
    message: `Answer has been created at Post ${postId}.`,
  });
});

postRouter.post("/:postId/answer/:ansId", async (req, res) => {
  const updatedPost = {
    ...req.body,
    updated_at: new Date(),
  };
  const postId = req.params.postId;
  const ansId = req.params.ansId;
  const result = await pool.query(
    "update  answers set  upvote=$1,downvote=$2 where post_id=$3 and answer_id=$4",
    [
      updatedPost.upvote, // this is a mocked user_id, since we have no authentication system on back end
      updatedPost.downvote,
      postId,
      ansId,
    ]
  );
  return res.json({
    message: `Answer ${postId} has been updated answer vote.`,
  });
});
export default postRouter;
