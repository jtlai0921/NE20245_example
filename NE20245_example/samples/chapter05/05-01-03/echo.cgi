#!/usr/bin/perl

# 接收GET的資料
($dmy, $data) = split(/data=/,  $ENV{'QUERY_STRING'});

# 跳脫標籤、引號與&符號
$data =~ s/&(?!(?:amp|quot|lt|gt);)/&amp;/g;
$data =~ s/"/&quot;/g;
$data =~ s/</&lt;/g;
$data =~ s/>/&gt;/g;

# URI解碼
$data =~ s/%([0-9a-fA-F][0-9a-fA-F])/chr(hex($1))/ego;

$data = "資料是$data";

# URI編碼
$data =~ s/([^a-zA-Z0-9'-_!~*.()])/'%' . unpack('H2', $1)/eg;

# Content-type 輸出 charset 是 UTF-8
print "Content-type: text/html;charset=utf-8\n\n"; 

# 輸出
print "$data\n";

