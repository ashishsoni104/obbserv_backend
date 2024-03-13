const mongoose = require('mongoose');

const CrawlPageSchema = new mongoose.Schema({
    url:{
        type:String,
        require:true
    },
    is_robots:{
        type:Number,
        require:true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('CrawlPage',CrawlPageSchema);