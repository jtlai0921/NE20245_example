<?php

  //連接資料庫 (*請小心密碼的處理方式)
  $db = pg_connect('host=localhost dbname=ajaxdb user=ajauser password=ajax');
  
  //以GET接收資料，並做SQL跳脫
  $code = pg_escape_string($_GET['code']);
  //建立SQL敘述
  $sql  = "select * from kasen where kasen_code = '$code';";
  //執行SQL查詢
  $kasen_name = pg_query($db,$sql);
  //以UTF-8輸出
  mb_http_output ( 'UTF-8' );
  //依序輸出結果集合中之河川名欄位的值
  while($aryCol=pg_fetch_assoc($kasen_name))
  {
    $msg = "code:".$code." 是 ".$aryCol['kasen_name'];
    //將資料庫取出的資料轉換成UTF-8
    $msg = mb_convert_encoding($msg,"UTF-8");
    //URI編碼
    $msg = rawurlencode($msg); 
    //輸出
    echo ($msg);
  }

?>