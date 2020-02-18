#!/usr/bin/perl

# 以GET接收資料
($dmy, $data) = split(/data=/,  $ENV{'QUERY_STRING'});

# URL解碼
$data =~ s/%([0-9a-fA-F][0-9a-fA-F])/chr(hex($1))/ego;

# 建立要回應的字串
$msg = "伺服器的Perl程式收到資料 --".$data."-- 。\n";

# URI編碼
$msg =~ s/([^a-zA-Z0-9'-_!~*.()])/'%' . unpack('H2', $1)/eg;

# 將 Content-type 的 charset 設定為以 UTF-8 輸出
print "Content-type: text/html;charset=utf-8\n\n"; 

# 輸出
print "$msg \n";