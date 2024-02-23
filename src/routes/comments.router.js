const express = require('express');
const { checkAuthenticated, checkCommentOwnership, checkPostOwnerShip } = require('../middlewares/auth');
const router = express.Router({
    mergeParams : true
});
const Post = require('../models/posts.model')
const Comment = require('../models/comments.model')

router.post('/',checkAuthenticated, (req,res)=>{
    Post.findById(req.params.id,(err,post)=>{
         if(err || !post){
            req.flash('error','댓글 생성 중 포스트를 찾지 못하거나 에러 발생')
            res.redirect('back')
         }
         else{
            Comment.create(req.body,(err,comment)=>{
                if(err){
                    req.flash('error','댓글 생성 중 에러 발생')
                    res.redirect('back')
                } 
                else{
                    //생성한 댓글에 작성자 정보 넣어주기
                    comment.author.id=req.user._id;
                    comment.author.username=req.user.username;
                    comment.save();

                    //포스트에 댓글 데이터 넣기
                    post.comments.push(comment);
                    post.save();
                    req.flash('success','댓글 생성 완료')
                    res.redirect('back')
                }
            })
         }
    })
})

router.delete('/:commentId',checkCommentOwnership,(req,res)=>{
    //댓글을 찾은 후 삭제
    Comment.findByIdAndDelete(req.params.commentId,(err,_)=>{
        if(err){
            req.flash('error','댓글 삭제 중 에러가 발생')
        }
        else{
            req.flash('success','댓글 삭제 완료')
        }
        res.redirect('back')
    })
})

router.get('/:commentId/edit', checkCommentOwnership,(req,res)=>{
    Post.findById(req.params.id, (err,post)=>{
        if(err || !post){
            req.flash('error','댓글에 해당하는 게시글이 없거나 에러 발생')
            res.redirect('back')
        }
        else{
            res.render('comments/edit',{
                post : post,
                comment : req.comment
            })

        }
    })
})

router.put('/:commentId',checkCommentOwnership,(req,res)=>{
    Comment.findByIdAndUpdate(req.params.commentId,
        req.body,
        (err,_)=>{
            if(err){
                req.flash('error','댓글 수정 중 에러 발생')
                res.redirect('back')
            }
            else{
                req.flash('success','댓글 수정 완료')
                res.redirect('/posts')
            }
        })
})

module.exports = router;