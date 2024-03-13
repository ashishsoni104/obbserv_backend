const mongoose = require('mongoose');

const CrawlChildPageSchema = new mongoose.Schema({
    url:{
        type:String,
        require:true
    },
    crawl_url_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CrawlPage' // Reference to the User model
    },
    title:String,
    description:String,
    heading_h1:[String],
    heading_h2:[String],
    page_links:[String]
},
{
    timestamps: true
});

module.exports = mongoose.model('CrawlChildPage',CrawlChildPageSchema);