require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose')
    // const Article = require('./models/article')
    // const methodOverride = require('method-override')
const path = require('path')
    // const Details = require('./models/model');
const adminRouter = require('./routes/adminRoutes')
const advisorRouter = require('./routes/advisorRoutes')
const userRouter = require('./routes/customerRoutes')
const stockRouter = require('./routes/stockRoutes/app')
    // const articleRouter = require('./routes/articles')
    // const otherUser = require('./routes/user')
    // const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
    // const { json } = require('express');
    // const { requireAuth, currentUser } = require('./middleware/login_signup_mw');
    // const logger = require('morgan')
const port = process.env.PORT || 3000;


// console.log(__dirname)
// dotenv.config({ path: './config.env' });

// connection to database
mongoose.connect('mongodb://localhost:27017/moneyInf', {
    useUnifiedTopology: true,
    useNewUrlParser: true
})

// connect to Atlas
// const dbURI = process.env.DATABASE.replace("PASSWORD" ,process.env.PASSWORD );
// mongoose.connect(dbURI ,{
//     useUnifiedTopology: true, useCreateIndex: true, useNewUrlParser: true 
// }).then( (res) => app.listen(port ,() =>{console.log(`App running from ${port} port`)}))
//   .catch((err) => console.log(err));


// middlewalres
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.urlencoded({ extended: false }))
    // app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())


// view engines
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/templates/views'))


// routes
// app.get('/', async(req, res) => {
//     res.render('login');
// })

// app.get('/admin', async(req, res) => {
//     res.render('adminRegister');
// })

// app.get('/home', requireAuth, async(req, res) => {
//     const articles = await Article.find().sort({ createdAt: 'desc' })
//     res.render('home', { articles: articles });
// })

app.use('/admin', adminRouter)
app.use('/advisor', advisorRouter)
app.use('/user', userRouter)
app.use(stockRouter)

app.listen(port, () => { console.log(`App running from ${port} port`) })







// wallet system
// https://payu.in/developer-guides
// https: //devguide.payu.in/merchant-integration/encryption-of-request/
// https://blog.idrisolubisi.com/how-to-build-a-wallet-system-with-flutterwave-payment-integration-into-nodejs-application
// https://github.com/Olanetsoft/wallet-demo-with-flutterwave
// file:///C:/Users/kambo/Downloads/Money%20infinity%20SOW%20(1).pdf