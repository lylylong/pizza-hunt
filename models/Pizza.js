const { Schema, model } = require("mongoose");
const dateFormat = require("../utils/dateFormat");

const PizzaSchema = new Schema(
  {
    //// we use Mongoose to help enforce any validation rules
    //// trim option works just like the JavaScript .trim() method
    //// which removes white space before and after the input string
    //// With Mongoose's required field, you can actually provide a custom error message
    //// e.g., required: 'You need to provide a pizza name!',
    pizzaName: {
      type: String,
      required: true,
      // required: 'You need to provide a pizza name!',
      trim: true,
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
    // createdAt: {
    //   type: Date,
    //   default: Date.now,
    // },
    createdAt: {
      type: Date,
      default: Date.now,
      get: (createdAtVal) => dateFormat(createdAtVal),
    },
    size: {
      type: String,
      required: true,
      enum: ["Personal", "Small", "Medium", "Large", "Extra Large"],
      default: "Large",
    },
    toppings: [],

    // 当决定加comments功能时，就需要连接两个models！
    // How do you think we define the type so that Mongoose knows to expect a comment?
    // We'll tell Mongoose to expect the type to be an ObjectId.
    // The ref property is especially important ---
    // --- because it tells the Pizza model which documents to search to find the right comments.
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },

  // we need to tell the schema that it can use virtuals
  // We set id to false because this is a virtual that Mongoose returns, and we don’t need it.
  {
    toJSON: {
      virtuals: true,
      getters: true,
    },
    id: false,
  }
);

// get total count of comments and replies on retrieval
// PizzaSchema.virtual("commentCount").get(function () {
//   return this.comments.length;
// });
PizzaSchema.virtual("commentCount").get(function () {
  return this.comments.reduce(
    (total, comment) => total + comment.replies.length + 1,
    0
  );
});

// create the Pizza model using the PizzaSchema
const Pizza = model("Pizza", PizzaSchema);

// export the Pizza model
module.exports = Pizza;
