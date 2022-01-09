//模块
const express=require('express');
//引入路由
const userRouter = require('./routes/user.js')
//接口
const app=express();
//监听
app.listen(9926,()=>{
var day=new Date();
console.log('启动成功,时间:'+day.toLocaleString());
});
//中间件
app.use(express.urlencoded({
extended:false
}));

app.use(express.static('./public'))
// app.use(express.static('./img'))
//用 
app.use('/user',userRouter)                                                 