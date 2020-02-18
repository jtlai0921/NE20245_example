#!/usr/bin/perl


#=====================================================================
# 設定要接收的RSS
#
  
  $url = "http://www.openspc2.org/blog/atom.xml";

#=====================================================================
# 取得RSS資料
#
  

  #取得
  $nkf  = "/usr/bin/nkf";
  $wget = `/usr/bin/wget -q -O - '$url' | $nkf -w ` ; 

#=====================================================================
# 輸出
#

  print "Content-type: application/xml;charset=utf-8\n\n"; 
  print "$wget";


