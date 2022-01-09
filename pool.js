const mysql=require('mysql');
const pool=mysql.createPool({
 host:'mfdl.i234.me',
 port:'13306',
 user:'8KRAW',
 password:'lihaoyuLHY123',
 database:'8kraw',
 connectionLimit:20
})
module.exports=pool;