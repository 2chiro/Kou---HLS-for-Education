##variable=========================================
$inputfile = $ARGV[0];
$outputfile = $ARGV[1];
$add = $ARGV[2];
$sub = $ARGV[3];
$multi = $ARGV[4];
$div = $ARGV[5];


@sdfg = ();
@vertex_id = ();
@vertex_x = ();
@vertex_y = ();
@vertex_type = ();
@edge_id = ();
@edge_ver1 = ();
@edge_ver2 = ();
@edge_port = ();
@label = ();
@array_location = ();
@lifetime = ();
@OperationPair = ();

#以下受け渡し用グローバル変数
@topcount_pair = ();
@temp_top_count = ();#候補を入れておく
@temp_top_pair = ();#選択結果が帰ってくる
@temp_top_pair2 = ();#臨時選択結果が帰ってくる
@toppair_2 = ();#topカウント用の送らない方
@maxtop = ();
@Beforelifetime = ();
@binding_core = ();
@binding_data = ();
$trans_num;

##config===============================================
#If you enter the information, you can be omitted input of information

##{$mode = 0;}Disable debugging	{$mode = 1;}Enable debugging
if (!$mode) {$mode = 0;}
##{$inputfile = "none";}Every time input	{$inputfile = "sample.dfg";}input file named sample.dfg
if (!$inputfile) {$inputfile = "none";}
##{$multi,add,,,ect = 0;}Every time input	if input number is more than 1=>It is input multiplier
if (!$add) {$add = 0;}
if (!$multi) {$multi = 0;}
if (!$sub) {$sub = 0;}
if (!$div) {$div = 0;}
if (!$other1) {$other1 = 0;}
if (!$other2) {$other2 = 0;}

##1=>proposalsc,2=>listsc,3=>support_create_dfg
if (!$culmode) {$culmode = 1;}
#Enable testmode =>1 ,Disable testmode =>0
if (!$usetestcode) {$usetestcode = 0;}
#Enable test=>1 ,Disable test=>0
if (!$usetestmode) {$usetestmode = 0;}


##testarea===============================================




##main===============================================

	&read_sdfg;
	&label;
	&listsc;	##listscheduling
	&output;

##sub=============================================
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
sub SerchOperationPair {
	#0=>not co,1=>co,2=>input
	my @s_array_loc = ();
	my @s_array_loc2 = ();
	my @cul_operation = ();
	my $temporary_1;
	my $temporary_2;
	my $finish_conditions;

	foreach(0 .. $#vertex_id){
		@cul_operation = ();
		#inputserch & init
		if($vertex_type[$_] =~ /I|F/){
			foreach(0 .. $#vertex_id){
				push @cul_operation, -1;
			}
			$finish_conditions = 1;
			push @s_array_loc,$vertex_id[$_];
			if($vertex_type[$_] =~ /F/){
				push @s_array_loc,$vertex_id[$_];
			}
			while ($finish_conditions != 0) {
				@s_array_loc2 = ();
				foreach(0 .. $#s_array_loc){
					$temporary_1 = $s_array_loc[$_];
					foreach(0 .. $#edge_id){
						if ($edge_ver1[$_] == $temporary_1){
							push @s_array_loc2,$edge_ver2[$_];
							$temporary_2 = $edge_ver2[$_];
							if($vertex_type[$temporary_2] !~ /I/){
								$cul_operation[$temporary_2]++;
							}
						}
					}
				}
				@s_array_loc = @s_array_loc2;
				if (!@s_array_loc){
					$finish_conditions = 0;

					foreach(0 .. $#cul_operation){
						#1 CO 0 notCO
						if ($cul_operation[$_] >= 1){
							$OperationPair[$_] = 0;
						}elsif ($cul_operation[$_] == 0) {
							if ($OperationPair[$_] != 0) {
								$OperationPair[$_] = 1;
							}
						}
					}
				}
				@s_array_loc2 = ();
			}
		}
	}
	#input&output pair
	foreach(0 .. $#vertex_id){
		if($vertex_type[$_] =~ /I/){
			$OperationPair[$_] = 2;
		}elsif($vertex_type[$_] =~ /F/){
			$OperationPair[$_] = 0;
		}elsif($vertex_type[$_] =~ /O/){
			$temp1 = $_;
			foreach(0 .. $#edge_id){
				if ($temp1 == $edge_ver2[$_]){
					$temp2 = $edge_ver1[$_];
					$OperationPair[$temp1] = $OperationPair[$temp2];
				}
			}
		}
	}
	print"[Log]SerchOperationPair=>Successful.\n";
}
sub listsc {
	&SerchOperationPair;
	&inputresorce;
	my $schedule = 1;
	my @temp_pair_del;
	my $cul_type_num = 1;
	my $loop_finish = 1;
	my $cul_type = "none";
	my @computable_main = ();
	my @computable_sub = ();
	my @temp_pair1;
	my @temp_pair2;
	my @temp_pair1_notco;
	my @temp_pair2_notco;
	my @target_op_u = ();
	my @target_op_s = ();
	my @target_op_u_amari = ();
	my @target_op_u_amari_s = ();
	my ($temp1,$temp2,$temp3,$temp4,$temp5,$temp6,$temp7,$temp8,$temp9,$temp10);

	#入力情報とその他情報を入れ込む
	foreach(0 .. $#label){
		if($vertex_type[$_]=~ /I|F/){
			push @computable_main, 1;
			push @computable_sub, 1;
		}else{
			push @computable_main, 0;
			push @computable_sub, 0;
		}
	}

	while ($loop_finish != 0) {
		if ($schedule > 100) {
			print "ERROR[006]schedule  is more than 100(infinite loop?)\n";
			exit;
		}
		#入力タイプ
		if ($cul_type_num == 1){
			$cul_type = "A";
			$temp6 = $add;
		}elsif ($cul_type_num == 2){
			$cul_type = "M";
			$temp6 = $multi;
		}elsif ($cul_type_num == 3){
			$cul_type = "S";
			$temp6 = $sub;
		}elsif ($cul_type_num == 4){
			$cul_type = "D";
			$temp6 = $div;
		}elsif ($cul_type_num == 5){
			$cul_type = "X";
			$temp6 = $other1;
		}elsif ($cul_type_num == 6){
			$cul_type = "Y";
			$temp6 = $other2;
		}
		@target_op_u = ();
		@target_op_s = ();
		@target_op_u_amari = ();

		#以後ライフタイムが変わるごとに$computable_mainを更新
		foreach(0 .. $#vertex_id){
			if($vertex_type[$_]!~ /I/){
				if ($vertex_type[$_] =~ $cul_type){
					$temp1 = $_;
					$temp2 = 0;
					foreach(0 .. $#edge_id){
						if ($temp1 == $edge_ver2[$_]){
							$temp3 = $edge_ver1[$_];
							if ($computable_main[$temp3] == 0){
								$temp2++;
							}
						}
					}
					if ($temp2 == 0){
						if ($lifetime[$_] == -1){
							push @target_op_u, $_;
						}
					}
				}
			}
		}
		#選んだものからさらにラベル最大を取り出す
		$temp4 = 0;
		foreach(0 .. $#target_op_u){
			$temp5 = $target_op_u[$_];
			if ($temp4 < $label[$temp5]){
				$temp4 = $label[$temp5];
			}
		}
		foreach(0 .. $#target_op_u){
			$temp5 = $target_op_u[$_];
			if ($temp4 == $label[$temp5]){
				push @target_op_s,$temp5;
			}
		}
		#print join( ',', @target_op_u ), "==計算可能な奴のmaxラベル選択==>";
		#print join( ',', @target_op_s ), "\n";
		if (@target_op_s){
			if ($#target_op_s+1 >= $temp6){
				#print "同じか多い\n";
				$temp7 = 0;
				while (1) {
					$temp8 = $target_op_s[$temp7];
					#print "デバッグ5 $temp8 = $schedule\n";
					$lifetime[$temp8] = $schedule;
					$computable_sub[$temp8] = 1;
					$temp7++;
					if ($temp7 == $temp6){
						last;
					}
				}
			}else{
				#print "少ない\n";
				$temp8 = 0;
				while (1) {
					foreach (0 .. $#target_op_u){
						$temp7 = $target_op_u[$_];
						if ($label[$temp7] == $temp4){
							#print "デバッグ5 $temp7 = $schedule\n";
							$lifetime[$temp7] = $schedule;
							$computable_sub[$temp7] = 1;
							$temp8++;
							if ($temp8 == $temp6){
								last;
							}
						}
					}
					if ($temp8 == $temp6){
						last;
					}
					$temp4--;
					if ($temp4 == 0){
						last;
					}
				}
			}
		}
		#入力タイプ更新
		if ($cul_type_num == 1){
			$cul_type_num = 2;
		}elsif ($cul_type_num == 2){
			$cul_type_num = 3;
		}elsif ($cul_type_num == 3){
			$cul_type_num = 4;
		}elsif ($cul_type_num == 4){
			$cul_type_num = 5;
		}else{
			$cul_type_num = 1;
			$schedule++;
			@computable_main = @computable_sub;
			$temp5 = 0;
			foreach(0 .. $#lifetime){
				if ($vertex_type[$_]!~ /I|O|F/){
					if($lifetime[$_] == -1){
						#print "		$_のライフタイムが決定していません\n";
						$temp5++;
					}
				}
			}
			#メインループを終了
			if ($temp5 == 0){
				$loop_finish = 0;
			}else{
				#print "		ループを継続します\n";
			}
		}
	}
	print"[Log]listsc=>Successful\n";
}
sub label {
	my @array_loc = ();
	my @array_loc2 = ();
	my $count = 0;
	my $cul;
	foreach(0 .. $#vertex_id){
		if($vertex_type[$_] =~ /O/){
			push @array_loc2, $vertex_id[$_];
		}
	}
	while (@array_loc2) {
		@array_loc = @array_loc2;
		@array_loc2 = ();
		foreach(0 .. $#array_loc){
			$cul = $array_loc[$_];
			if ($label[$cul] < $count) {
				$label[$cul] = $count
			}
			foreach(0 .. $#edge_id){
				if($edge_ver2[$_] == $cul){
					push @array_loc2, $edge_ver1[$_];
				}
			}
		}
		$count++;
	}
	foreach(0 .. $#label){
		if($vertex_type[$_]=~ /I|F/){
			$label[$_] = -1;
		}
	}
	print"[Log]label=>Successful.\n";
}
sub inputresorce {
	my ($temp_add,$temp_multi,$temp_sub,$temp_div) = 0;
	foreach (0 .. $#vertex_type) {
		if ($vertex_type[$_] =~ "A"){
			$temp_add = 1;
		}elsif ($vertex_type[$_] =~ "M"){
			$temp_multi = 1;
		}elsif ($vertex_type[$_] =~ "S"){
			$temp_sub = 1;
		}elsif ($vertex_type[$_] =~ "D"){
			$temp_div = 1;
		}elsif ($vertex_type[$_] =~ "X"){
			$temp_oth1 = 1;
		}elsif ($vertex_type[$_] =~ "Y"){
			$temp_oth2 = 1;
		}
	}
	if ($add == 0){
		while ($add < $temp_add){
			print "Please input Adder number==>";
			$add = <STDIN>;
			chomp($add);
			if ($add >= $temp_add){
				last;
			}else{
				print "[ERROR]Please input more than $temp_add\n";
			}
		}
	}
	if ($multi == 0){
		while ($multi < $temp_multi){
			print "Please input Multiplier number==>";
			$multi = <STDIN>;
			chomp($multi);
			if ($multi >= $temp_multi){
				last;
			}else{
				print "[ERROR]Please input more than $temp_multi\n";
			}
		}
	}
	if ($sub == 0){
		while ($sub < $temp_sub){
			print "Please input Subtract number==>";
			$sub = <STDIN>;
			chomp($sub);
			if ($sub >= $temp_sub){
				last;
			}else{
				print "[ERROR]Please input more than $temp_sub\n";
			}
		}
	}
	if ($div == 0){
		while ($div < $temp_div){
			print "Please input Division number==>";
			$div = <STDIN>;
			chomp($div);
			if ($div >= $temp_div){
				last;
			}else{
				print "[ERROR]Please input more than $temp_div\n";
			}
		}
	}
	if ($other1 == 0){
		while ($other1 < $temp_oth1){
			print "Please input X number==>";
			$other1 = <STDIN>;
			chomp($other1);
			if ($other1 >= $temp_oth1){
				last;
			}else{
				print "[ERROR]Please input more than $temp_oth1\n";
			}
		}
	}
	if ($other2 == 0){
		while ($other2 < $temp_oth2){
			print "Please input Y number==>";
			$other2 = <STDIN>;
			chomp($other2);
			if ($other2 >= $temp_oth2){
				last;
			}else{
				print "[ERROR]Please input more than $temp_oth2\n";
			}
		}
	}
}

sub read_sdfg {
	print "\n==========ProgramRunning==========\n";
	if($inputfile =~ /none/){
		print "Please input target datapass==>";
		$inputfile = <STDIN>;
	}else{
		print "\nconfig is enabled\n\n";
	}
	chomp($inputfile);
	open(FH, "$inputfile") or &error("$inputfile");
		@sdfg = <FH>;
	close(FH);

	foreach(@sdfg){
		$_ =~ s/#.+//;   ##remove comments
		$_ =~ s/^\s*$//;   ##remove empty lines
	}
	$row=0;
	#foreach(0 .. $#sdfg){
	foreach(0 .. $#sdfg){

		if( $sdfg[$_] =~ /--edge/ ){
			$row = $_;
			last;
		}

		if( $sdfg[$_] =~ /(--vertex)|(^\s*$)|(add)|(sub)|(mult)|(div)/ ){
		}else{
			$sdfg[$_] =~ s/\r//;
		 	$sdfg[$_] =~ s/\n//;
			$sdfg[$_] =~ s/ /,/g;   ##datainput
			$sdfg[$_] =~ s/	/,/g;   ##datainput
			my @list = split(/,/,$sdfg[$_]);
			push @vertex_id, $list[0];
			push @vertex_type, $list[1];

			push @vertex_x, $list[2];
			push @vertex_y, $list[3];

			push @label, -1;	#used Label
			push @lifetime, -1;	#used lifetime
			push @OperationPair, -1;	#used SerchOperationPair
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
sub error {
	my ($file) = @_;
	print "ERROR[001] : $file is not found\n";
	exit;
}
