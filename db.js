import { Sequelize, DataTypes } from "sequelize";
import sqlite3 from "sqlite3";

new sqlite3.Database("goodnews.db");
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "goodnews.db",
  logging: false,
});

export const Feed = sequelize.define(
  "Feed",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_published_at: {
      type: DataTypes.STRING,
    },
  },
  { underscored: true }
);

export const Article = sequelize.define(
  "Article",
  {
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  },
  { underscored: true }
);

Feed.hasMany(Article);
Article.belongsTo(Feed);

await Feed.sync();
await Article.sync();
