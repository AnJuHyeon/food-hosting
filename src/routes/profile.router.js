const express = require('express');
const { checkAuthenticated, checkIsMe } = require('../middlewares/auth');
const router = express.Router({
    mergeParams : true
});
const Post = require('../models/posts.model');
const User = require('../models/users.model')

router.get('/', checkAuthenticated,(req,res)=>{
    Post.find({"author.id" : req.params.id})
    .populate('comments')
    .sort({createAt : -1})
    .exec((err,posts)=>{
        if(err){
            req.flash('error','게시물 가져오기 실패')
            res.redirect('back')
        }
        else{
            User.findById(req.params.id,(err,user)=>{
                if(err || !user){
                    req.flash('error','없는 유저입니다.')
                    res.redirect('back')
                }
                else{
                    res.render('profile',{
                        posts : posts,
                        user : user
                    })
                }
            })
        }
    })
   
} )

router.get('/edit', checkIsMe,(req,res)=>{
    res.render('profile/edit',{
        user : req.user
    })
})

router.put('/', checkIsMe,(req,res)=>{
    User.findByIdAndUpdate(req.params.id,req.body,
        (err,user)=>{
            if(err || !user){
                req.flash('error','업데이트 도중 에러 발생')
                res.redirect('back')
            }
            else{
                req.flash('success','유저 데이터 업데이트 완료')
                res.redirect('/profile/' + req.params.id)
            }
        })
})
module.exports = router;