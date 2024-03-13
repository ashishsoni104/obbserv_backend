const express = require('express');
const { getShallowCrawler, getCrawlChildPageData, getCrawlPageData, deleteCrawlUrl } = require('../controllers/crawler/crawler.controller');
const router = express.Router();

router.post('/run-crawler',getShallowCrawler);
router.get('/get-page-data',getCrawlPageData);
router.get('/get-page-child-data',getCrawlChildPageData)
router.delete('/delete-page-data/:page_id',deleteCrawlUrl);

module.exports = router;