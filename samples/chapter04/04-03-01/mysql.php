<?php

  //連接資料庫 (*請小心密碼的處理方式)
  $db = mysql_connect('localhost','ajaxuser','ajaxpwd');
  mysql_select_db('ajaxdb',$db);

  //以GET接收資料，並做SQL跳脫
  $code = mysql_escape_string($_GET['code']);

  //建立SQL敘述
  $sql  = "select * from todoufuken where todoufuken_code = '$code';";

  //執行SQL查詢
  $todoufuken_name = mysql_query($sql,$db);
  
  //以UTF-8輸出
  mb_http_output ( 'UTF-8' );

  //依序輸出結果集合中之都道府縣欄位的值
  while($aryCol=mysql_fetch_assoc($todoufuken_name))
  {
    $msg = "code:".$code." 是 ".$aryCol['todoufuken_name'];
    //將資料庫取出的資料轉換成UTF-8
    $msg = mb_convert_encoding($msg,"UTF-8");
    //URI編碼
    $msg = rawurlencode($msg); 
    //輸出
    echo ($msg);
  }


/*
 * 參考 : 這個範例使用的資料表與資料
 *

create table todoufuken
(
  todoufuken_code      varchar(2)    not null  primary key    ,
  todoufuken_name      varchar(10)                  
);

insert todoufuken (todoufuken_code,todoufuken_name) values( '08' ,'茨城縣' );
insert todoufuken (todoufuken_code,todoufuken_name) values( '09' ,'栃木縣' );
insert todoufuken (todoufuken_code,todoufuken_name) values( '10' ,'群馬縣' );
insert todoufuken (todoufuken_code,todoufuken_name) values( '11' ,'埼玉縣' );
insert todoufuken (todoufuken_code,todoufuken_name) values( '12' ,'千葉縣' );

*/
?>