const express = require('express');
const bodyParser = require('body-parser');
const { mongoose } = require('mongoose');
const crawlerRouter = require('./routes/crawler')
var cors = require('cors');
const app = express();

mongoose.connect('mongodb+srv://ashishsoni104:kOBEMnsOjX0Shwkg@cluster0.8pr4rxf.mongodb.net/crawler?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.urlencoded({
    extended:false
}));
app.use(cors());
app.use(express.json());

app.use('/api/crawler',crawlerRouter)

app.listen(8080,()=>{
    console.log(`Server run at 8080`);
})
