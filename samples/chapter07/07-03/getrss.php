<?php


#=====================================================================
# 設定要接收的RSS
#
  $url = "http://www.openspc2.org/blog/atom.xml";
  
  

#=====================================================================
# 取得RSS資料
#
  
  #取得
  $nkf  = "/usr/bin/nkf";
  $data = `/usr/bin/wget -q -O - '$url' | $nkf -w ` ; 
  
  #不能使用wget的環境
  #$data = file_get_contents($url);

#=====================================================================
# 輸出
#


  //將收到的資料轉成UTF-8
  //$data = mb_convert_encoding($data,"UTF-8","Big5");
  //URI編碼
  //$data = rawurlencode($data); 
  //mb_http_output ( 'UTF-8' );
  header('Content-type: application/xml;charset=utf-8');

  print "$data";

?>

