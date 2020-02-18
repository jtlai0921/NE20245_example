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
	
	# �a�}
	$address =~ s/ //g;

	# �������X��
	if ($flags =~ /\d/) {$range = "$flags$range"; $flags = "  ";}
	my $odd     = ($flags eq "��" || $flags eq "��" || $flags eq "�s") ? 1 : 0;
	my $even    = ($flags eq "��" || $flags eq "��" || $flags eq "�s") ? 1 : 0;

    #if ($flags !~ /��|��|��|�s|�@|  /) {   # ����
	#	print "$line\n     flags: '$flags'\n";
	#}
	
	# �d��
	my ($min, $max) = (1, 32767);
	my $ext = "";
	$range =~ s/ //g;
    $range =~ s/��/-/g;
    $range =~ s/�t����//g;
    if ($range =~ s/(\d+��\d+��)//) {$ext = "$1";};
    if ($range =~ s/(\d+��(�H�W|�H�U)?)//) {$ext = "$1";};
    $range =~ s/([0-9-]+)��(��|�H�W|�H�U)/$1��$2/;
    $range =~ s/([0-9-]+)����([0-9-]+)(��|��)/$1����$2��/;
    if ($range =~ s/^([0-9-]+��)//) { $address .= $1; }
    if ($range =~ s/��// ) { $odd = 1; }
    if ($range =~ s/��// ) { $even = 1; }
    if ($range =~ s/�s// ) { $odd = 1; $even = 1; }
    if ($range =~ s/([0-9-]+(?:��|�F)(?:(?:��.*$)|�H�W|�H�U))// ) { $ext = $1; }
    if ($range =~ s/^([0-9-]+��)//) { $address .= $1; }
    if ($range =~ s/^([0-9-]+�F)//) { $address .= $1; }
    
	if ($range eq "" || $range eq "��") {
		;
	} elsif ($range =~ /(\d+)-(\d+)��-(\d+)��/) {
		$min = "$1-$2";
		$max = "$1-$3";
	} elsif ($range =~ /([0-9-]+)����([0-9-]+)��/) {
		$min = $1;
		$max = $2;
	} elsif ($range =~ /([0-9-]+)���H�W/) {
		$min = $1;
	} elsif ($range =~ /([0-9-]+)���H�U/) {
		$max = $1;
	} elsif ($range =~ /^([0-9-]+)��$/) {
		$min = $max = $1;
    	if ($1%2 == 1) {$odd = 1;} else {$even = 1}
    } elsif ($range =~ /����/) {
    	$ext = $range;
 	}# else {   # ����
	#	print "$line\n     range: '$range'\n";
    #	print qq/     $zipcode, "$address", $odd, $even, $min, $max, "$ext"\n/;
	#}

	print CSV qq/$zipcode,$address,$odd,$even,$min,$max,$ext\n/;
}
close CSV;
close FILE;