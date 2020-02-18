<?php
  //接收POST的資料
  $data = $_POST['data'];

  switch($data){
    case  1 : $ary = "[['蘋果','1'],['草莓','2'],['鳳梨','3']]" ; break ;
    case  2 : $ary = "[['茄子','1'],['芋頭','2'],['蔥','3'],['紅蘿蔔','4']]"  ; break ;
    default : $ary = "['','']";
  }
  //將資料UTF-8化
  // $ary = mb_convert_encoding($ary,"UTF-8");
  //HTML跳脫（為了安全將<改成&lt;）
  $ary = htmlspecialchars($ary,0,"UTF-8");
  //URI編碼
  $ary = rawurlencode($ary); 

  //將輸出設定成UTF-8
  // mb_http_output ( 'UTF-8' );
  
  //輸出
  echo ($ary);
?>