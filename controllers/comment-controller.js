const { Comment, Pizza } = require("../models");

// Remember that when we create a comment, it’s not a standalone comment;
// it belongs to a pizza. We need to know exactly which pizza we’re working with.

// const commentController = {
//   // add comment to pizza
//   addComment() {},

//   // remove comment
//   removeComment() {},
// };

const commentController = {
  // add comment to pizza
  addComment({ params, body }, res) {
    console.log(body);
    Comment.create(body)
      .then(({ _id }) => {
        return Pizza.findOneAndUpdate(
          { _id: params.pizzaId },
          { $push: { comments: _id } },
          { new: true }
        );
      })
      .then((dbPizzaData) => {
        if (!dbPizzaData) {
          res.status(404).json({ message: "No pizza found with this id!" });
          return;
        }
        res.json(dbPizzaData);
      })
      .catch((err) => res.json(err));
  },

  removeComment({ params }, res) {
    Comment.findOneAndDelete({ _id: params.commentId })
      .then((deletedComment) => {
        if (!deletedComment) {
          return res.status(404).json({ message: "No comment with this id!" });
        }
        return Pizza.findOneAndUpdate(
          { _id: params.pizzaId },
          { $pull: { comments: params.commentId } },
          { new: true }
        );
      })
      .then((dbPizzaData) => {
        if (!dbPizzaData) {
          res.status(404).json({ message: "No pizza found with this id!" });
          return;
        }
        res.json(dbPizzaData);
      })
      .catch((err) => res.json(err));
  },
};

module.exports = commentController;