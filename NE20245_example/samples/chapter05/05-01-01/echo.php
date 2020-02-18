<?php

  //接收GET的資料
  $data = $_GET['data'];
  $data = "伺服器收到了 --".$data."-- 。";
  
  //將收到的資料轉換成UTF-8
  // $data = mb_convert_encoding($data,"UTF-8");
  
  //HTML跳脫（為了安全將<改成&lt;）
  $data = htmlspecialchars($data,0,"UTF-8");

  //URI編碼
  $data = rawurlencode($data); 

  //將輸出設定成UTF-8
  // mb_http_output ( 'UTF-8' );
  
  //輸出
  echo ($data);

?>