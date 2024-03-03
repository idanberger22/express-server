const mongoose = require('mongoose')
const Schema = mongoose.Schema

const accountSchema = new Schema({
    nickName: {
        type: String,
        required: true,
        validate: [nicknameValidator, 'Nickname must be 10 characters or fewer']
    },
    password: {
        type: String,
        required: true
    },
    purchases: {
        type: Object,
        required: true,
        default: {}
    },
}, { timestamps: true, minimize: false })

function nicknameValidator(value) {
    return value.length <= 10
}

const UserInfo = mongoose.model('accountinfos', accountSchema)

module.exports = UserInfo
