const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://info:Haa1x4iLOYk17vxc@ruhaversedemo1.myv41fm.mongodb.net/',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

module.exports = { mongoose };