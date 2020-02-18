<?php

  //以GET接收資料
  $data = $_POST['data'];
  $data = "伺服器收到資料 --".$data."-- 。";
  
  //將收到的資料轉碼為UTF-8
  //$data = mb_convert_encoding($data,"UTF-8");
  
  //HTML跳脫（為了安全將<等字元改成&lt;）
  $data = htmlspecialchars($data,0,"UTF-8");

  //URI編碼
  $data = rawurlencode($data); 

  //將輸出設定為UTF-8
  mb_http_output ( 'UTF-8' );
  
  //輸出
  echo ($data);

?>