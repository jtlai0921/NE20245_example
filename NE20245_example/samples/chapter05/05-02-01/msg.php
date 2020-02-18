<?php

  //接收GET的資料
  $data = $_GET['data'];
  
  switch($data){
    case  1 : $msg = '您選擇了1分鐘的課程' ; break ;
    case  5 : $msg = '您選擇了5分鐘的課程' ; break ;
    case 10 : $msg = '您選擇了10分鐘的課程' ; break ;
    default : $msg = '請選擇';
  }
  
  //將資料轉換為UTF-8
  // $msg = mb_convert_encoding($msg,"UTF-8");
  
  //HTML跳脫（為了安全將<改成&lt;）
  $msg = htmlspecialchars($msg,0,"UTF-8");

  //URI編碼
  $msg = rawurlencode($msg); 

  //將輸出設定成UTF-8
  // mb_http_output ( 'UTF-8' );
  
  //輸出
  echo ($msg);

?>