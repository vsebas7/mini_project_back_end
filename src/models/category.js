import Blog from "./blog.js";
import db from "./index.js";

const Category = db.sequelize.define("categories", {
    category_id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type : db.Sequelize.STRING(45),
        allowNull : false
    }
},
{ timestamps: false }
)

Category.hasMany(Blog);

export default Category;