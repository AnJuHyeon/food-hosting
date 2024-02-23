const express = require('express');
const { checkAuthenticated, checkPostOwnerShip } = require('../middlewares/auth');
const router = express.Router();
const Post = require('../models/posts.model')
const Comment =require('../models/comments.model')
const path = require('path');
const multer = require('multer');


const storageEngine = multer.diskStorage({
    destination :  (req,res,callback)=>{
        callback(null, path.join(__dirname,'../public/assets/images')) 
    },
    filename : (req,file,callback)=>{
        callback(null,file.originalname);       
    }
})

const upload = multer({storage : storageEngine}).single('image')

router.post('/',checkAuthenticated,upload,(req,res,next)=>{
    let desc = req.body.desc;
    let image = req.file ? req.file.filename : "";
    // console.log('req.file',req.file);
    // console.log('req.file.filename',req.file.filename);
    Post.create({
        image : image,
        description : desc,
        author : {
            id : req.user._id,
            username : req.user.username
        }
    }, (err,_)=>{
        if(err){
            req.flash('error','포스트 생성 실패');
            res.redirect("back")
        }else{
            req.flash('success','포스트 생성 성공')
            res.redirect("back");
        }
    })//사용하지 않는 것이 있으면 _으로 나타내주면된다.
})


router.get('/',checkAuthenticated,(req,res)=>{
   Post.find() 
   .populate('comments')
   .sort({createAt:-1})
   .exec((err,posts)=>{
    if(err){
        console.log(err);
    }
    else{
        res.render('posts',{
            posts : posts,

        })
    } 
   })
})

router.get('/:id/edit',checkPostOwnerShip,(req,res)=>{
    res.render('posts/edit',{
         post : req.post
    }) 
 })

router.put('/:id', checkPostOwnerShip,(req,res)=>{
    Post.findByIdAndUpdate(req.params.id, req.body,(err,post)=>{
        if(err){
            req.flash('errpr','게시물을 수정하는데 오류가 발생')
            res.redirect('/posts')
        }
        else{
            req.flash('success','게시물 수정 완료');
            res.redirect('/posts')
        }
    })
})

router.delete('/:id',checkPostOwnerShip,(req,res)=>{
    Post.findByIdAndDelete(req.params.id,(err,post)=>{
        if(err){
            req.flash('error','게시물을 지우기 실패.');
        }
        else{
            req.flash('success','게시물 지우기 완료')
        }
        res.redirect('/posts')
    })
})

module.exports = router;