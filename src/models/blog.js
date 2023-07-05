import Category from "./category.js";
import db from "./index.js";
import Likes from "./likes,js";
import User from "./user.js";

const Blog = db.sequelize.define("blogs", {
    blog_id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    user_id: {
        type: db.Sequelize.INT,
        allowNull : false
    },
    title: {
        type : db.Sequelize.TEXT('medium'),
        allowNull : false
    },
    content : {
        type : db.Sequelize.TEXT('long'),
        allowNull : false
    },
    country : {
        type : db.Sequelize.STRING(45),
        allowNull : false,
    },
    category_id : {
        type : db.Sequelize.INTEGER,
        allowNull : false,
    },
    url : {
        type : db.Sequelize.STRING(45),
        allowNull : true,
    },
    keywords : {
        type : db.Sequelize.TEXT('medium'),
        allowNull : false,
    },
    blog_pic : {
        type : db.Sequelize.STRING.BINARY(100),
        allowNull : true,
    },
    
})

Blog.belongsTo(Category);
Blog.belongsTo(User);
Blog.belongsToMany(Likes);

export default Blog;
