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
        // add a user and asign a token
      addUser: async (parent, { username, email, password }) => {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { token, user };
      },
        // attempt login and decode credentials
      login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
  
        if (!user) {
          throw new AuthenticationError('Failed to login. Incorrect credentials.');
        }
  
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
          throw new AuthenticationError('Failed to login. Incorrect credentials.');
        }
  
        const token = signToken(user);
  
        return { token, user };
      },
        // update the current user with a new saved book
      addBook: async (parent, { bookData }, context) => {
        if (context.user) {
            const updateUser = await User
            .findOneAndUpdate(
                { _id: context.user._id }, 
                { $addToSet: {savedBooks: bookData } }, 
                { new: true },
            )
            .populate("books");      
            return updateUser;
        }
        throw new AuthenticationError('Please login to save a book.');
      },
      removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
            const updateUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId } } },
                { new: true },
            )
            return updateUser;
        }
        throw new AuthenticationError('Please login to delete a book.');
      },
    },
  };
  
  module.exports = resolvers;
  