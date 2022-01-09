//1.引入express模块
const express = require('express')
//2.引入与数据库相关的模块
const pool = require('../pool.js')
//3.创建路由对象(固定语法)
const router = express.Router()
//4.往该路由器中添加多个子路由
//(1)用户登录
//只需要手机号登录
router.post('/login',(req,res,next)=>{
  //接收请求参数
  let obj = req.body
  console.log(obj.phone,obj.password);
  for(var i in obj){
    if(obj[i]==''){
      res.send({
      "code":0,
      "msg":`${i}不能为空`
      })
      return;
    }
  }
  // console.log(obj)
  //约定对应数据u_phone 的参数名是uphone
  //执行SQL命令
  pool.query('select * from users where phone=?&&password=?',[obj.phone,obj.password],(err,data)=>{
    if(err){next(err);return}
    //检查数据库返回结果
    console.log(data)
    //查询到了只有一个数组包裹一个对象[{}]
    //查不到返回[]
    if (data.length==0) {
      res.send({"code":0,"msg":"登录失败"})
    }else {
      res.send({"code":1,"msg":"登录成功","data":data})
    }
  })
})
//(2)用户注册
router.post('/reg',(req,res,next)=>{
  //查看请求体
  let obj = req.body
  console.log(obj)
  for(var i in obj){
    if(obj[i]==''){
      res.send({
      "code":0,
      "msg":`${i}不能为空`
      })
      return;
    }
  }
  // console.log(obj) 
  //约定的名字在这里需要注意
  //u_names="xxxx" 需要前端使用参数名与数据库字段名保持一致
  pool.query('insert into users set ?',[obj],(err,data)=>{
    if(err){next(err);return}
    //查看data
    // console.log(data)
    //如果重复注册，该错误就被错误处理带走了，所以只需要处理注册成功即可
    res.send({"code":1,"msg":"注册成功"})
  })
})
//(3)用户信息修改
router.post('/edit',(req,res,next)=>{
  //请求体参数
  let obj = req.body
  console.log(obj.phone,obj.password)
  for(var i in obj){
    if(obj[i]==''){
      res.send({
      "code":0,
      "msg":`${i}不能为空`
      })
      return;
    }
  }
  //执行SQL命令
  //因为这个sql语句又长又数据多，因此写一个SQL变量验证没问题后在加到pool.query()里
  //u_names对应unames，u_phone对应uphone,u_member对应umember,约定一个没有更改的旧手机号oldphone
  let sql = `update users set password="${obj.password}" where phone="${obj.phone}";`
  console.log(sql) 
  pool.query(sql,(err,data)=>{
    if(err){next(err);return}
    // data 是代表修改成功是该 data.affectedRows
    // console.log(data)
    if(data.affectedRows == 0){
      res.send({"code":0,"msg":"修改失败"})
    }else {
      res.send({"code":1,"msg":"修改成功"})
    }
  })
})
//(4)查询img
router.get('/query',(req,res,next)=>{
  //接收请求体
  let obj = req.query
  console.log(obj)
  if(obj.label==''){
    obj.label='武汉'
  }
  var label=obj.label
  var labelval = `%${label}%`
  pool.query('SELECT * FROM PW WHERE label LIKE ? OR names LIKE ? ',[labelval,labelval],(err,data)=>{
    if(err){next(err);return}
 
    if(data.length == 0){
      res.send({
        "code":0,
        "msg":"没有查到相关数据"
      })
    }else {
      res.send({
        "code":1,
        "msg":"查到数据并返回",
        "data":data
      })
    }
  })
})
//(5)收藏添加
router.get('/coll',(req,res,next)=>{
  //接收请求体
  let obj = req.query
  console.log(obj)
  pool.query('SELECT * FROM collection WHERE userid=? and pwid=?',[obj.userid,obj.pwid],(err,data)=>{
  if(data.length==''){
    pool.query('INSERT INTO `collection` VALUES (null,?,?,?,?);',[obj.userid,obj.pwid,obj.img,obj.ifvideo],(err,data)=>{
      if(err){next(err);return}
      if(data.length == 0){
        res.send({
          "code":0,
          "msg":"收藏失败"
        })
      }else {
        res.send({
          "code":1,
          "msg":"收藏成功",
          "data":data
        })
      }
    })
  }else {
    res.send({
      "code":0,
      "msg":"重复收藏",
      
    })
  }
})
})
//(6)查询收藏
router.get('/Querycollection',(req,res,next)=>{
  //接收请求体
  let obj = req.query
  console.log(obj)
  pool.query('SELECT * FROM collection WHERE userid=? order by lid desc;',[obj.userid],(err,data)=>{
    if(err){next(err);return}
    if(data.length == 0){
      res.send({
        "code":0,
        "msg":"暂无收藏"
      })
    }else {
      res.send({
        "code":1,
        "msg":"查询作品成功",
        "data":data
      })
    }
  })
})
//(7)查询图片信息
router.get('/details',(req,res,next)=>{
  //接收请求体
  let obj = req.query
  console.log(obj)
  pool.query('SELECT * FROM PW WHERE lid=?;',[obj.lid],(err,data)=>{
    if(err){next(err);return}
    if(data.length == 0){
      res.send({
        "code":0,
        "msg":"无此作品信息"
      })
    }else {
      res.send({
        "code":1,
        "msg":"查询作品信息成功",
        "data":data
      })
    }
  })
})
//(8)删除收藏
router.delete('/del/:lid',(req,res,next)=>{
  //接收请求参数
  let obj = req.params
  console.log(obj)//obj.lid
  //执行SQL命令
  pool.query('delete from collection where lid=?',[obj.lid],(err,data)=>{
    if(err){next(err);return}
    //判断数据的变化条数
    if(data.affectedRows==0){
      res.send({"code":0,"msg":"删除失败"})
    }else {
      res.send({"code":1,"msg":"删除成功"})
    }
  })
})
//(9)删除收藏通过用户id和图片id
router.delete('/del2/:lid&:userid',(req,res,next)=>{
  //接收请求参数
  let obj = req.params
  console.log(obj)//obj.lid
  //执行SQL命令
  pool.query('delete from collection where  userid=? and pwid=? ',[obj.userid,obj.lid],(err,data)=>{
    if(err){next(err);return}
    //判断数据的变化条数
    if(data.affectedRows==0){
      res.send({"code":0,"msg":"删除失败"})
    }else {
      res.send({"code":1,"msg":"删除成功"})
    }
  })
})
//(10)查询用户信息
router.get('/userinfo',(req,res,next)=>{
  //接收请求体
  let obj = req.query
  console.log(obj)
  pool.query('SELECT * FROM users WHERE lid=?;',[obj.userid],(err,data)=>{
    if(err){next(err);return}
    if(data.length == 0){
      res.send({
        "code":0,
        "msg":"无此作品信息"
      })
    }else {
      res.send({
        "code":1,
        "msg":"查询作品信息成功",
        "data":data
      })
    }
  })
})
//5.导出路由器router
module.exports = router;