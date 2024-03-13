const { URL } = require('url');
const axios = require('axios');
const cheerio = require('cheerio');
const { errorResponse, successResponse } = require('../../helpers');
const CrawlPage = require('../../models/CrawlPage');
const CrawlChildPage = require('../../models/CrawlChildPage');

const getLinks = async (link,crawlPageData) => {
    try{
        const response = await axios.get(link);
        const $ = cheerio.load(response.data);
        const links = [];
        let crawlChildPageData = new CrawlChildPage();
        crawlChildPageData.url = link;
        crawlChildPageData.crawl_url_id = crawlPageData._id;
        crawlChildPageData.title = $('title').text();
        $('meta').each((index,element)=>{
            const name = $(element).attr('name');
            if(name === 'description'){
                crawlChildPageData.title = $(element).attr('content');
            }
        });
        let h1Arr = [];
        $('h1').each((index,element)=>{
            const h1Text = $(element).text();
            h1Arr.push(h1Text);
        });
        crawlChildPageData.heading_h1 = h1Arr;
        let h2Arr = [];
        $('h2').each((index,element)=>{
            const h2Text = $(element).text();
            h2Arr.push(h2Text);
        });
        crawlChildPageData.heading_h2 = h2Arr;
        $('a').each((index, element) => {
            const href = $(element).attr('href');
            if (href && !href.startsWith('#') && !href.startsWith('mailto')) {  // Ignore anchor links
                links.push(new URL(href, link).href);
            }
        });
        crawlChildPageData.page_links = links.filter((value,index) => links.indexOf(value) === index);
        await crawlChildPageData.save();
        return links;
    }catch(e){
        console.log(e);
    }
}

const stringIsAValidUrl = (url) => {
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    return urlRegex.test(url);
}
const sleep = ms => new Promise( res => setTimeout(res, ms));

const getShallowCrawler = async (req, res) => {
    let { url } = req.body;
    try {
        url = url.trim();
        if (url !== "" && stringIsAValidUrl(url)) {
            console.log("Crawl Started");
            let checkUrlExist = await CrawlPage.findOne({url:url});

            if(checkUrlExist){
                return successResponse(req, res, "Url Already Exists", 205);
            }
            const urlData = new URL(url);
            const hostname = urlData.hostname;
            const visited = new Set();
            const queue = [url];
            let rebotsLink = url+"/robots.txt";
            let isReobot;
            try{
                await axios.get(rebotsLink);
                isReobot = 1;
            }catch(err){
                isReobot = 0;
            }
            let crawlPageData = new CrawlPage();
            crawlPageData.url = url;
            crawlPageData.is_robots = isReobot;
            await crawlPageData.save();
            while (queue.length > 0) {
                const url = queue.shift();
                if(!stringIsAValidUrl(url)){
                    continue;
                }
                if (visited.has(url)) {
                    continue;
                }
                const urlDataInside = new URL(url);
                const hostnameInside = urlDataInside.hostname; 
                if(!(hostname.trim() === hostnameInside.trim())){
                    continue;
                }
                
                visited.add(url);
                const links = await getLinks(url,crawlPageData);
                for (const link of links) {
                    queue.push(link);
                }
                sleep(500)
            }
            console.log("crawl Ended");
            return successResponse(req, res, "Success", 200);
        } else {
            return errorResponse(req, res, "Please enter valid url", 204);
        }
    } catch (e) {
        return errorResponse(req, res, e.message, 400, e.stack);
    }
}

const getCrawlPageData = async (req,res) => {
    try{    
        let data = await CrawlPage.find();
        return successResponse(req, res, {response:data}, 200);
    }catch(e){
        return errorResponse(req, res, e.message, 400, e.stack);
    }
}

const getCrawlChildPageData = async (req,res)=>{
    const page_id = req.query.page_id;
    try{
        let data = await CrawlChildPage.find({crawl_url_id:page_id});
        return successResponse(req, res, {response:data}, 200);
    }catch(e){
        return errorResponse(req, res, e.message, 400, e.stack);
    }
}

const deleteCrawlUrl = async (req,res)=>{
    const page_id = req.params.page_id;
    try{
        let childPage = await CrawlChildPage.find({crawl_url_id:page_id});
        if(childPage){
            await CrawlChildPage.deleteMany({crawl_url_id:page_id});
        }
        await CrawlPage.findByIdAndDelete(page_id)
        return successResponse(req, res, "Data Deleted Successfully", 200);
    }catch(e){
        return errorResponse(req, res, e.message, 400, e.stack);
    }
}

module.exports = {
    getShallowCrawler,
    getCrawlPageData,
    getCrawlChildPageData,
    deleteCrawlUrl
}