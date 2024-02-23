const express = require('express');
const {default : mongoose} = require('mongoose');
const passport = require('passport');
const app = express();
const path = require('path');
const flash = require('connect-flash')
const methodOverride =require('method-override')
const User = require('./models/users.model');
const cookieSession = require('cookie-session');
const config = require('config');
const mainRouter = require('./routes/main.router');
const usersRouter = require('./routes/users.router');
const postsRouter = require('./routes/posts.router');
const commentsRouter = require('./routes/comments.router');
const profileRouter = require('./routes/profile.router');
const likesRouter = require('./routes/likes.router');
const friendsRouter = require('./routes/friends.router');



const serverConfig = config.get('server');



const port = serverConfig.port;

require('dotenv').config()





app.use(cookieSession({
    name : 'cookie-session-name',
    keys : [process.env.COOKIE_ENCRYPTION_KEY]
}))

// register regenerate & save after the cookieSession middleware initialization
app.use(function(request, response, next) {
    if (request.session && !request.session.regenerate) {
        request.session.regenerate = (cb) => {
            cb()
        }
    }
    if (request.session && !request.session.save) {
        request.session.save = (cb) => {
            cb()
        }
    }
    next()
})

app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');

app.use(flash());
app.use(methodOverride('_method'));

app.use(express.json());
//form 에서 있는 부분을 분석해 파싱해서 가져오기 위해 필요함.
app.use(express.urlencoded({extended : false})); 

//view engine setup
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'ejs');

mongoose.set('strictQuery', false); 
mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log('mongodb is connected');
    })
    .catch((err)=>{
        console.log(err)
    })  
//정적 파일 제공
 app.use(express.static(path.join(__dirname,'public'))) 

 //페이지를 새로고침하면 세션에서 메시지가 사라지게되어 화면에도 보이지 않게 됨. connect-flash 는 휘발성으로 한 번 실행되면 세션에서 저장값이 사라짐.
 app.get('/send', (req,res)=>{
    req.flash('post success','포스트가 생성되었습니다.')
    res.redirect('/receive')
 })
 app.get('/receive',(req,res)=>{
    res.send(req.flash('post success')[0]);
 })

app.use((req,res,next)=>{
    res.locals.error = req.flash('error')
    res.locals.success = req.flash('success');
    res.locals.currentUser = req.user;
    next();

})


app.use('/',mainRouter);
app.use('/auth',usersRouter);
app.use('/posts',postsRouter);
app.use('/posts/:id/comments',commentsRouter);
app.use('/profile/:id',profileRouter)
app.use('/friends',friendsRouter);
app.use(likesRouter);

app.use((err,req,res,next)=>{
    res.status(err.status||500);
    res.send(err.message||"Error Occured")
})


app.listen(port, ()=>{
    console.log(`Listening on ${port}`);
})

