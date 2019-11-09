var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/cart', function(req, res, next) {
  // 要求登录成功的用户才能访问购物车页面
  //
  console.log(req.session)
  if(req.session.login){
    res.send('我是购物车页面')
  }else{
    res.send('请先登录')
  }
});

module.exports = router;
