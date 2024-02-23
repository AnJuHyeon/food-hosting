const express = require('express');
const { checkAuthenticated } = require('../middlewares/auth');
const router = express.Router();
const Post = require('../models/posts.model')

router.put('/posts/:id/like', checkAuthenticated,(req,res)=>{
     Post.findById(req.params.id,(err,post)=>{
        if(err || !post){
            req.flash('error','포스트를 찾지 못함')
            res.redirect('back')
        }
        else{
            //이미 누른 좋아요
            if(post.likes.find(like=>like===req.user._id.toString())){
                const updatedLikes = post.likes.filter(like => like !==req.user._id.toString());
                Post.findByIdAndUpdate(post._id,{
                    likes : updatedLikes
                },(err,_)=>{
                    if(err){
                        req.flash('error','좋아요 업데이트하는데 에러 발생')
                        res.redirect('back')
                    }
                    else{
                        req.flash('success','좋아요 업데이트 완료')
                        res.redirect('back')
                    }
                })
            }
            //처음 누른 좋아요
            else{
                Post.findByIdAndUpdate(post._id,{
                    likes : post.likes.concat([req.user._id])
                },(err,_)=>{
                    if(err){
                        req.flash('error','좋아요 업데이트하는데 에러 발생')
                        res.redirect('back')
                    }
                    else{
                        req.flash('success','좋아요 업데이트 완료')
                        res.redirect('back')
                    }
                })
            }
        }
     })
})


module.exports = router;