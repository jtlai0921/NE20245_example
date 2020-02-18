<?php

  //回應用字串
  $data = "這是伺服器的訊息。請輸入資料。";

  //將資料UTF-8化
  // $data = mb_convert_encoding($data,"UTF-8");
  
  //URI編碼
  $data = rawurlencode($data); 

  //將輸出設定成UTF-8
  // mb_http_output ( 'UTF-8' );
  
  //輸出
  echo ($data);

?>