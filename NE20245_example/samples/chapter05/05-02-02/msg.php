<?php

  //輸出欄位HTML
  $msg  = '那麼，請輸入在此：<input type="text" name="ok" value="">';
  
  //將資料轉換為UTF-8
  //$msg = mb_convert_encoding($msg,"UTF-8");
  
  //HTML跳脫（為了安全將<改成&lt;）
  $msg = htmlspecialchars($msg,0,"UTF-8");

  //URI編碼
  $msg = rawurlencode($msg); 

  //將輸出設定成UTF-8
  // mb_http_output ( 'UTF-8' );
  
  //輸出
  echo ($msg);

?>