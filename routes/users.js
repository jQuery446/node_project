var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var userModel = require('../models/userModel')

var saltRound = 10;//盐，加密复杂度

var jwt = require('jsonwebtoken');
var secret = 'ljljljljasdfa';

// var myPwd = '123456'; //待加密密码
// bcrypt.hash(myPwd,saltRound,function(err,hashPwd){
//   console.log('这是123456加密后的结果',hashPwd)
//    // 加密结果  $2b$10$xuab5AVPIxAR1uqiObVvFOUZ9Nm3mNgplIK5RpwGJBxJ7Hk7BC98O
// })

// //解密方法
// let hashPwd = '$2b$10$xuab5AVPIxAR1uqiObVvFOUZ9Nm3mNgplIK5RpwGJBxJ7Hk7BC98O';
// bcrypt.compare('123',hashPwd,function(err,data){
//   if(!err){
//     console.log('这是密码对比结果')
//     console.log(data)
//   }
// })

/* GET users listing. */
router.get('/reg/page', function(req, res, next) {
  let path = __dirname.split('routes')[0]
  res.sendFile(path+'views/reg.html');
});

router.get('/reg', function (req, res, next) {
  console.log(req.query)
  // 1. 判断该用户名是否已存在
  // 2. 存储新用户信息
  let {username,pwd} = req.query;
  userModel.find({username:username}).then((result)=>{
    if(result.length!=0){ //该用户名已被占用
      res.send({
        code:0,
        msg:'用户名已存在'
      })
      return false
    }
    bcrypt.hash(pwd,saltRound,(err,hashPwd)=>{ //如果用户名可用，则对用户密码进行加密
      if(!err){
        new userModel({  //实例化一个新的用户对象
          username:username,
          pwd:hashPwd
        }).save().then((result)=>{ //录入新用户至MongoDB数据库
          res.send({
            code: 1,
            msg: '注册成功'
          })
        })
      }
    })

  })
});

router.get('/login',function(req,res){
  let {username,pwd} = req.query;
  userModel.find({username}).then((result)=>{
    if(result.length==0){  //查看用户是否存在
      res.send({
        code:0,
        msg:'用户不存在'
      })
      return false;
    }
    let hashPwd = result[0].pwd;  //获取用户注册时录入数据库的加密密吗
    bcrypt.compare(pwd,hashPwd,function(err,data){ //对比密码是否正确
      if(data){ 
        console.log(req.session)
        req.session.login=true;//向浏览器设置一个用以判断登录状态的字段。login：true;
        res.send({
          code:1,
          msg:'登录成功'
        })
      }else{
        res.send({
          code: 1,
          msg: '密码错误'
        })
      }
    })

  })
})

//token使用
// var jwt=require('jsonwebtoken')
// var secret='ljlj'
//1.token的加密生成
// let token=jwt.sign({login:true},secret)
// console.log('服务端生成的token',token)
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6dHJ1ZSwiaWF0IjoxNTcyODU2MjE3fQ.ROV1F4WiWk2B6Ypc0o3_wMdB7ESq0oYNxQqy_L7SwvM

//2解密判断token是否合法
// let token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6dHJ1ZSwiaWF0IjoxNTcyODU2MjE3fQ.ROV1F4WiWk2B6Ypc0o3_wMdB7ESq0oYNxQqy_L7SwvM';
// jwt.verify(token,secret,function(err,data){
//   if(!err){
//     console.log('token的验证结果', data)
//   }
// })

router.get('/login/token', function (req, res) {
  let { username, pwd } = req.query;
  userModel.find({ username }).then((result) => {
    if (result.length == 0) {  //查看用户是否存在
      res.send({
        code: 0,
        msg: '用户不存在'
      })
      return false;
    }
    let hashPwd = result[0].pwd;  //获取用户注册时录入数据库的加密密吗
    bcrypt.compare(pwd, hashPwd, function (err, data) { //对比密码是否正确
      if (data) {
        let token = jwt.sign({login:true},secret) //生成token 下发给登录成功的用户
        res.send({
          code: 1,
          msg: '登录成功',
          data:token
        })
      } else {
        res.send({
          code: 1,
          msg: '密码错误'
        })
      }
    })

  })
})

router.get('/token/verify',function(req,res){ //判断用户token是否合法
    jwt.verify(req.query.token,secret,function(err,data){
      if(!err){
        res.send({
          code:1,
          msg:'token合法'
        })
      }else{
        res.send({
          code: 0,
          msg: 'token非法，请重新登录'
        })
      }
    })
})

module.exports = router;
