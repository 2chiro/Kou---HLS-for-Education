##variable=========================================
$inputfile = $ARGV[0];
$outputfile = $ARGV[1];
$add = $ARGV[2];
$sub = $ARGV[3];
$multi = $ARGV[4];
$div = $ARGV[5];


@vertex_id = ();
@vertex_x = ();
@vertex_y = ();
@vertex_type = ();
@edge_id = ();
@edge_ver1 = ();
@edge_ver2 = ();
@edge_port = ();
@lifetime = ();


##config===============================================
if (!$inputfile) {$inputfile = "none";}
if (!$add) {$add = 0;}
if (!$multi) {$multi = 0;}
if (!$sub) {$sub = 0;}
if (!$div) {$div = 0;}
if (!$other1) {$other1 = 0;}
if (!$other2) {$other2 = 0;}


##main===============================================
print "\n== Running ==\n\n";
&read_dfg;
&asap;
&output;
print "\n== END ==\n\n";


##sub=============================================
sub asap {
	my @array_loc = ();
	my @array_loc2 = ();
	my $count = 0;
	my $cul;
	my $max_lt = -1;

	foreach(0 .. $#vertex_id){
		if($vertex_type[$_] =~ /I|F/){
			push @array_loc2, $vertex_id[$_];
		}
	}
	while (@array_loc2) {
		@array_loc = @array_loc2;
		@array_loc2 = ();
		foreach(0 .. $#array_loc){
			$cul = $array_loc[$_];
			if ($lifetime[$cul] < $count) {
				$lifetime[$cul] = $count
			}
			foreach(0 .. $#edge_id){
				if($edge_ver1[$_] == $cul){
					push @array_loc2, $edge_ver2[$_];
				}
			}
		}
		$count++;
	}
	foreach(0 .. $#lifetime){
		if($vertex_type[$_]=~ /I|F|O/){
			$lifetime[$_] = -1;
		}
		if ($lifetime[$_] > $max_lt){
			$max_lt = $lifetime[$_];
		}
	}
	foreach(0 .. 3){
		my $cul_type_num = $_ + 1;
		my $cul_type;
		if ($cul_type_num == 1){
			$cul_type = "A";
		}elsif ($cul_type_num == 2){
			$cul_type = "S";
		}elsif ($cul_type_num == 3){
			$cul_type = "M";
		}elsif ($cul_type_num == 4){
			$cul_type = "D";
		}
		my $max_resource = 0;
		my $tmp_resource = 0;
		foreach (1 .. $max_lt) {
			$tmp_resource = 0;
			my $now_lifetime = $_;
			foreach (0 .. $#vertex_id) {
				if ($vertex_type[$_] =~ $cul_type) {
					if ($lifetime[$_] == $now_lifetime){
						$tmp_resource++;
					}
				}
			}
			if ($tmp_resource > $max_resource) {
				$max_resource = $tmp_resource;
			}
		}
		if ($cul_type_num == 1){
			$add = $max_resource;
		}elsif ($cul_type_num == 2){
			$sub = $max_resource;
		}elsif ($cul_type_num == 3){
			$multi = $max_resource;
		}elsif ($cul_type_num == 4){
			$div = $max_resource;
		}
	}

	print"[Log]ASAP=>Successful.\n";
}

##base sub=============================================
sub read_dfg {
	my @sdfg = ();
	chomp($inputfile);
	open(FH, "$inputfile") or die("ERROR[001] : Sdfg file is not found");
		@sdfg = <FH>;
	close(FH);

	foreach(@sdfg){
		$_ =~ s/#.+//;   ##remove comments
		$_ =~ s/^\s*$//;   ##remove empty lines
	}
	$row=0;
	foreach(0 .. $#sdfg){
		if( $sdfg[$_] =~ /--edge/ ){
			$row = $_;
			last;
		}
		if( $sdfg[$_] !~ /(--vertex)|(^\s*$)|(add)|(sub)|(mult)|(div)/ ){
			$sdfg[$_] =~ s/\r//;
		 	$sdfg[$_] =~ s/\n//;
			$sdfg[$_] =~ s/ /,/g;   ##datainput
			$sdfg[$_] =~ s/	/,/g;   ##datainput
			my @list = split(/,/,$sdfg[$_]);
			push @vertex_id, $list[0];
			push @vertex_type, $list[1];
			push @vertex_x, $list[2];
			push @vertex_y, $list[3];
			push @lifetime, -1;	#used lifetime
		}
	}

	foreach( $row .. $#sdfg ){
		if( $sdfg[$_] =~ /--exclusive block/ ){
			$row = $_;
			last;
		}
		if( $sdfg[$_] =~ /(--edge)|(^\s*$)/ ){
		}else{
			$sdfg[$_] =~ s/\r//;
		 	$sdfg[$_] =~ s/\n//;
			$sdfg[$_] =~ s/ /,/g;   ##datainput
			$sdfg[$_] =~ s/	/,/g;   ##datainput
			my @list = split(/,/,$sdfg[$_]);
			push @edge_id, $list[0];
			push @edge_ver1, $list[1];
			push @edge_ver2, $list[2];
			push @edge_port, $list[3];
		}
	}
	print"[Log]read_sdfg=>Successful.\n";
}
sub output {
	my $file = $outputfile;
	open my $fh, '>', $file;
	print $fh "add.         $add\n";
	print $fh "sub.         $sub\n";
	print $fh "mult.        $multi\n";
	print $fh "div.         $div\n";
	print $fh "--vertex\n";
	foreach(0 .. $#vertex_id){
		print $fh "$vertex_id[$_]	$vertex_type[$_]	$lifetime[$_]	$vertex_x[$_]	$vertex_y[$_]\n";
	}
	print $fh "--edge\n";
	foreach(0 .. $#edge_id){
		print $fh "$edge_id[$_]	$edge_ver1[$_]	$edge_ver2[$_]	$edge_port[$_]\n";
	}
	print $fh "--exclusive block\n";
	close $fh;
	print "[Log]output=>Successful.\n";
}
