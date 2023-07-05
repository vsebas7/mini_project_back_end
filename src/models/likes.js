import Blog from "./blog.js";
import db from "./index.js";
import User from "./user.js";

const Likes = db.sequelize.define("likes", {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    date: {
        type: db.Sequelize.DATETIME,
        allowNull: false
    },
    blog_id: {
        type: db.Sequelize.INT,
        allowNull : false
    },
    user_id: {
        type: db.Sequelize.INT,
        allowNull : false
    },
    
},
{ timestamps: false }
)

Likes.hasMany(User);
Likes.hasMany(Blog);

export default Likes;
