const express = require('express');
const usersRouter = express.Router();
const passport = require('passport');
const User = require('../models/users.model');


usersRouter.post('/login',(req,res,next)=>{ 

    passport.authenticate("local",(err,user,info)=>{

        if(err){
            return next(err);
        }
        if(!user){
            return res.json({msg:info})
        }

        req.logIn(user,function(err){
            if(err) {return next(err)}
            res.redirect('/posts')
        })
    })(req,res,next)
})

usersRouter.post('/logout',(req,res,next)=>{
    req.logOut(function (err){
        if(err){return next(err);}
        res.redirect('/login')
    })
 })

usersRouter.post('/signup', async (req,res)=>{
    //user 객체를 생성한다.req.body에 이메일과 비밀번호가 있다.
    const user = new User(req.body); 
    try {
       //user 컬렉션에 유저를 저장.
       await user.save();
       //이메일 보내기
       //sendMail('anju3802@naver.com','anju','welcome');
       res.redirect('/login');
    } catch (error) {
        console.error(error);
    }
 })
usersRouter.get('/google', passport.authenticate('google'))
usersRouter.get('/google/callback', passport.authenticate('google',{
    successReturnToOrRedirect :'/posts',
    failureRedirect :'/login',
     
}))
usersRouter.get('/kakao',passport.authenticate('kakao'));
usersRouter.get('/kakao/callback',passport.authenticate('kakao',{
    successReturnToOrRedirect : '/posts',
    failureRedirect : '/login'
}))



module.exports = usersRouter;