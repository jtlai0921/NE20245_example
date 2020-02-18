<?php

  //以GET接收資料，並做SQL跳脫
  $code = mysql_escape_string($_GET['code']);
  
  //建立SQL敘述
  $sql = "select zyusyo from yubin where code = '$code';";

  //以shell執行SQL (*請注意密碼與指令碼的處理方式)
  $data =  `sqlite -list -separator ',' ajaxdb '$sql'  `;

  //將輸出設定成UTF-8
  mb_http_output ( 'UTF-8' );

  //從資料庫取出資料並轉換為UTF-8
  $datau8 = mb_convert_encoding($data,"UTF-8");
  
  //URI編碼
  $datau8enc = rawurlencode($datau8); 
  
  //輸出
  echo ($datau8enc);


/*
 * 參考 : 這個範例使用的資料表與資料
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