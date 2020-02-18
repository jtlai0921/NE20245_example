# Ke Zhi-Jie  2006/2
no utf8;

open FILE, "zip_32_9409.txt";
open CSV, ">zip_32.txt";
while (my $line = <FILE>) {
	chomp $line;
	my $zipcode = substr $line, 0, 5;
	my $address = substr $line, 5, 34;
	my $flags   = substr $line, 39, 2;
	my $range   = substr $line, 41;
	
	# 地址
	$address =~ s/ //g;

	# 單雙號旗標
	if ($flags =~ /\d/) {$range = "$flags$range"; $flags = "  ";}
	my $odd     = ($flags eq "單" || $flags eq "全" || $flags eq "連") ? 1 : 0;
	my $even    = ($flags eq "雙" || $flags eq "全" || $flags eq "連") ? 1 : 0;

    #if ($flags !~ /單|雙|全|連|　|  /) {   # 偵錯
	#	print "$line\n     flags: '$flags'\n";
	#}
	
	# 範圍
	my ($min, $max) = (1, 32767);
	my $ext = "";
	$range =~ s/ //g;
    $range =~ s/之/-/g;
    $range =~ s/含附號//g;
    if ($range =~ s/(\d+至\d+樓)//) {$ext = "$1";};
    if ($range =~ s/(\d+樓(以上|以下)?)//) {$ext = "$1";};
    $range =~ s/([0-9-]+)巷(至|以上|以下)/$1號$2/;
    $range =~ s/([0-9-]+)號至([0-9-]+)(巷|弄)/$1號至$2號/;
    if ($range =~ s/^([0-9-]+巷)//) { $address .= $1; }
    if ($range =~ s/單// ) { $odd = 1; }
    if ($range =~ s/雙// ) { $even = 1; }
    if ($range =~ s/連// ) { $odd = 1; $even = 1; }
    if ($range =~ s/([0-9-]+(?:弄|鄰)(?:(?:至.*$)|以上|以下))// ) { $ext = $1; }
    if ($range =~ s/^([0-9-]+弄)//) { $address .= $1; }
    if ($range =~ s/^([0-9-]+鄰)//) { $address .= $1; }
    
	if ($range eq "" || $range eq "全") {
		;
	} elsif ($range =~ /(\d+)-(\d+)至-(\d+)號/) {
		$min = "$1-$2";
		$max = "$1-$3";
	} elsif ($range =~ /([0-9-]+)號至([0-9-]+)號/) {
		$min = $1;
		$max = $2;
	} elsif ($range =~ /([0-9-]+)號以上/) {
		$min = $1;
	} elsif ($range =~ /([0-9-]+)號以下/) {
		$max = $1;
	} elsif ($range =~ /^([0-9-]+)號$/) {
		$min = $max = $1;
    	if ($1%2 == 1) {$odd = 1;} else {$even = 1}
    } elsif ($range =~ /附號/) {
    	$ext = $range;
 	}# else {   # 偵錯
	#	print "$line\n     range: '$range'\n";
    #	print qq/     $zipcode, "$address", $odd, $even, $min, $max, "$ext"\n/;
	#}

	print CSV qq/$zipcode,$address,$odd,$even,$min,$max,$ext\n/;
}
close CSV;
close FILE;