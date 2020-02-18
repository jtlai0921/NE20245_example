<?php

  //以GET接收資料，並做SQL跳脫
  $code = mysql_escape_string($_GET['code']);
  
  //建立SQL敘述
  $sql = "select todoufuken_name from todoufuken where todoufuken_code = '$code' ;";
  //以shell執行SQL (*請注意密碼與指令碼的處理方式)
  escapeshellcmd($sql);
  $data = `echo '$sql;' | mysql -u ajaxuser --password=ajaxpwd ajaxdb`;

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