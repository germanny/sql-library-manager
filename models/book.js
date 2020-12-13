'use strict';
const Sequelize = require('sequelize');
const moment = require('moment');

module.exports = (sequelize, DataTypes) => {
  class Book extends Sequelize.Model { }
  Book.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "title"',
        },
        notEmpty: {
          // custom error message
          msg: 'Please provide a value for "title"',
        }
      }
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "author"',
        },
        notEmpty: {
          // custom error message
          msg: 'Please provide a value for "author"',
        }
      }
    },
    genre: DataTypes.STRING,
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "year"',
        },
        notEmpty: {
          // custom error message
          msg: 'Please provide a value for "year"',
        }
      }
    }
  }, { sequelize });

  return Book;
};
