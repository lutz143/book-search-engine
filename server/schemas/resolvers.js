const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
    Query: {
      users: async () => {
        return User.find().populate('books');
      },
      user: async (parent, { username }) => {
        return User.findOne({ username }).populate('books');
      },
      books: async (parent, { username }) => {
        const params = username ? { username } : {};
        return Book.find(params).sort({ createdAt: -1 });
      },
      book: async (parent, { bookId }) => {
        return Book.findOne({ _id: bookId });
      },
    },
  
    Mutation: {
      addUser: async (parent, { username, email, password }) => {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { token, user };
      },
      login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
  
        if (!user) {
          throw new AuthenticationError('No user found with this email address');
        }
  
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
          throw new AuthenticationError('Incorrect credentials');
        }
  
        const token = signToken(user);
  
        return { token, user };
      },
      addBook: async (parent, { bookText, bookAuthor }) => {
        const book = await Book.create({ bookText, bookAuthor });
  
        await User.findOneAndUpdate(
          { username: bookAuthor },
          { $addToSet: { books: book._id } }
        );
  
        return book;
      },
      addComment: async (parent, { bookId, commentText, commentAuthor }) => {
        return Book.findOneAndUpdate(
          { _id: bookId },
          {
            $addToSet: { comments: { commentText, commentAuthor } },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      },
      removeBook: async (parent, { bookId }) => {
        return Book.findOneAndDelete({ _id: bookId });
      },
      removeComment: async (parent, { bookId, commentId }) => {
        return Book.findOneAndUpdate(
          { _id: bookId },
          { $pull: { comments: { _id: commentId } } },
          { new: true }
        );
      },
    },
  };
  
  module.exports = resolvers;
  