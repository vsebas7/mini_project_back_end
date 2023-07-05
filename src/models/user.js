import db from "./index.js";
import Likes from "./likes,js";

const User = db.sequelize.define("users", {
    user_id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    username: {
        type: db.Sequelize.STRING(45),
        allowNull: false
    },
    email: {
        type : db.Sequelize.STRING(45),
        allowNull : false
    },
    phone : {
        type : db.Sequelize.DOUBLE,
        allowNull : false
    },
    password: {
        type: db.Sequelize.TEXT('long'),
        allowNull : false
    },
    profile_pic : {
        type : db.Sequelize.STRING.BINARY(100),
        allowNull : false,
        defaultValue : 2
    },
    isVerified : {
        type : db.Sequelize.BOOLEAN,
        allowNull : false,
        defaultValue : 0
    }
},
{ timestamps: false }
)

User.belongsToMany(Likes);
User.hasMany(Blog);

export default User;