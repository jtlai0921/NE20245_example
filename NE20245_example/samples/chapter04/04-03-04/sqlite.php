<?php


  //連接資料庫 (*請小心密碼的處理方式)
  $db = sqlite_open('ajaxdb');
  //以GET接收資料，並做SQL跳脫
  $code = sqlite_escape_string($_GET['code']);
  //建立SQL敘述
  $sql  = "select * from yubin where code = '$code';";
  //執行SQL查詢
  $data = sqlite_query($db,$sql);
  //以UTF-8輸出
  mb_http_output ( 'UTF-8' );
  //依序輸出結果集合中之地址值
  while($aryCol=sqlite_fetch_array($data,SQLITE_ASSOC))
  {
    $msg = "郵遞區號 ".$code." 是 ".$aryCol['zyusyo'];
    //將資料庫取出的資料轉換成UTF-8
    $msg = mb_convert_encoding($msg,"UTF-8");
    //URI編碼
    $msg = rawurlencode($msg); 
    //輸出
    echo ($msg);
  }


/*
 * 參考 : 這裏使用的SQlite用資料表與資料
 *

 create table yubin
 (
   code       varchar(7)    not null  primary key    ,
   zyusyo     varchar(20)
 );

insert into yubin (code,zyusyo) values('3001288','茨城縣牛久市久野町');
insert into yubin (code,zyusyo) values('3001212','茨城縣牛久市結束町');
insert into yubin (code,zyusyo) values('3001233','茨城縣牛久市榮町');

*/
?>