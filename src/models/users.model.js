const mongoose = require('mongoose');
const bcrypt =require('bcryptjs')
// 이메일,비번 -> 로그인 1 google -->로그인 2 
const userSchema = mongoose.Schema({ 
    email :{
        type : String,
        unique : true, //한 개만 있어야됨
        trim : true,
        required : true,
    },
    password : {
        type : String,
        minLength : 4,  
    }, 
    // sparse :이메일로 로그인 했을 때 구글은 값이 null, 그 다음 구글로 로그인 할 때는 값이 있고 또 그 다음에 이메일로 로그인을 하게되면
    // 구글은 또 널 값을 가지게 되는데 이렇게 되면 unique : true 에 위배됨. 그래서 쓰는 것
    googleId : {
        type : String,
        unique : true,
        sparse : true 
    },
    kakaoid :{
        type : String,
        unique : true,
        sparse : true 
    }, 
    username :{
        type : String,
        required : true,
        trim : true,
    },
    firstName :{
        type : String,
        default : 'First name',
    },
    lastName : {
        type : String,
        default : 'Last name',
    },
    bio : {
        type : String,
        default : '데이터 없음',
    },
    hometown : {
        type : String,
        default : '데이터 없음'
    },
    workspace : {
        type : String,
        default : '데이터 없음'
    },
    education : {
        type : String,
        default : '데이터 없음'
    },
    contact : {
        type : Number,
        default : "0101234567"
    },
    friends : [{type : String}],
    friendsRequests :[{type : String}],

} ,{timestamps : true});

const saltRounds = 10; 
userSchema.pre('save',function (next){
   let user=this;
   if(user.isModified('password')) {
    bcrypt.genSalt(saltRounds, function(err,salt){
        if(err) return next(err);
        bcrypt.hash(user.password,salt , function(err,hash){
            if(err) return next(err);
            user.password = hash;
            next();

        })
    })
   } else{
    next();
   }
})

//cb == callback
userSchema.methods.comparePassword = function(plainPassword, cb){
    //bcrypt compare 비교
    //compare password => client , this.password => 데이터베이스에 있는 비밀번호
    bcrypt.compare(plainPassword,this.password, function(err,isMatch){
        if(err) return cb(err);
        cb(null,isMatch);
    })
} 

const User = mongoose.model('User', userSchema);

module.exports = User; 
 