#!/usr/bin/perl

use DBI;

# 以GET接收資料並做URL解碼後進行SQL跳脫
($dmy, $code) = split(/code=/,  $ENV{'QUERY_STRING'});
$data =~ s/%([0-9a-fA-F][0-9a-fA-F])/chr(hex($1))/ego;
$code =~ s/'/''/g;
$code =~ s/\\/\\\\/g;

# 連接MySQL
$db = DBI->connect('DBI:mysql:ajaxdb:localhost', 'ajaxuser', 'ajaxpwd');

# 建立SQL敘述
$sth = $db->prepare("select * from todoufuken where todoufuken_code = '$code';");
$sth->execute;

# 輸出Content-type charset是UTF-8
print "Content-type: text/html;charset=utf-8\n\n"; 

# 依序輸出結果集合中之都道府縣欄位的值
while(@data = $sth -> fetchrow_array){
   # URI編碼
   $data[1] =~ s/([^a-zA-Z0-9'-_!~*.()])/'%' . unpack('H2', $1)/eg;
   # 輸出
   print "code:$data[0] 是 $data[1]\n";
}
# 結束
$sth->finish;
$db->disconnect;
