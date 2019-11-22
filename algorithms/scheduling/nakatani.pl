##variable=========================================
#$mode = $ARGV[0];
#$culmode = $ARGV[1];
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

	#if ($culmode == 1){
		&read_sdfg;	##input data
		&label2;	##add label(label=>normal,label2=>quick)
		&proposalsc;	##Teian houhou
		if ($usetestcode == 1){
			&testcode;
		}
		&output;
	#}elsif($culmode == 2){
	#	&read_sdfg;
	#	&label2;
	#	listsc2;	##listscheduling
	#	&output2;
	#}elsif($culmode == 3){
	#	&inputdata;
	#	&createdfg;
	#}
	#&debugproposal;
	#&binding;
	#&outbinding;

##sub=============================================

sub happyset {
	my($n) = @_;
	my ($temp1,$temp2,$temp3,$temp4);
	my $count;
	my @temp_main = ();
	my @temp_sub = ();
	#print join( ',', @topcount_pair ), "\n";
	#print join( ',', @toppair_2 ), "\n";

	$temp1 = $#toppair_2;
	$temp2 = $#topcount_pair;
	#print "入力&combinatorial2( $temp2+1, $temp1+1, [] );\n";
	&combinatorial2( $temp2+1, $temp1+1, [] );
	#print join( ',', @temp_top_pair2 ), "出力\n";
	while (@temp_top_pair2) {
		#print join( ',', @temp_top_pair2), "残り出力\n";
		$count = 0;
		while ($count != $temp1+1){
			push @temp_main , $temp_top_pair2[0];
			shift (@temp_top_pair2);
			$count++;
		}
		shift (@temp_top_pair2);
		#print join( ',', @temp_main), "取り出し\n";
		$count = 0;
		while ($count != $temp1+1){
			$temp4 = $temp_main[$count];
			push @temp_sub , $topcount_pair[$temp4];
			$count++;
		}
		@temp_main = ();
		#print join( ',', @temp_sub), "組み合わせ計算\n";
		&permute([@temp_sub], []);
		@temp_sub = ();
	}
}
sub inputdata {
	my $inputdata;
	my $id_count = 0;
	print "\n==========Vertex==========\n";


	while(1){
		$inputdata = <STDIN>;
		if ($inputdata !~ /end/){
			my @list = split(/ /,$inputdata);
			if ($list[1]){
				push @vertex_id, $list[0];
				push @vertex_type, $list[1];
				print "入力されました";
			}else{
				print "値が不正です";
			}
		}else{
			last;
		}
	}

}
sub createdfg {
	my $file = 'create_dfg.dfg';
	open my $fh, '>', $file;
	print $fh "--vertex\n#vertex_ID	 type\n";
	foreach(0 .. $#vertex_id){
		print $fh "$vertex_id[$_]	$vertex_type[$_]\n";
	}
	print $fh "\n--edge\n#edge_ID	 edge(ver1	ver2)	 port\n";
	foreach(0 .. $#edge_id){
		print $fh "$edge_id[$_]	$edge_ver1[$_]	$edge_ver2[$_]	$edge_port[$_]\n";
	}
	print $fh "--exclusive block\n";
	close $fh;
	print "[Log]create_dfg=>Successful.\n";
}

sub outbinding {
	my ($temp1,$temp2);
	my $file = 'binding.dat';
	open my $fh, '>', $file;
	print $fh "Register.		$binding_data[0]\n";
	print $fh "add.		$binding_core[1]\n";
	print $fh "sub.		$binding_core[2]\n";
	print $fh "mult		$binding_core[3]\n";
	print $fh "comp 		$binding_core[4]\n";
	foreach(0 .. $#binding_data){
		$temp1 = $_ + 1;
		print $fh "$temp1	";
	}
	#書いているとちゅう
	close $fh;
	print "[Log]outbinding=>Successful.\n";
}
sub output {
	my $file = $outputfile;
	open my $fh, '>', $file;
	#print $fh "#adder=>$add	multiplier=>$multi sub=>$sub div=>$div\n";
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
	&debugoutput;
}
sub output2 {
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
	&debugoutput;
}
sub debugoutput {
	if ($mode == 1){
		print "\n[DebugOutput]\n";
		print "--vertex\n#vertex_ID	 type	lifetime\n";
		foreach(0 .. $#vertex_id){
			print "$vertex_id[$_]	$vertex_type[$_]	$lifetime[$_]\n";
		}
		print "\n--edge\n#edge_ID	 edge(ver1	ver2)	 port\n";
		foreach(0 .. $#edge_id){
			print "$edge_id[$_]	$edge_ver1[$_]	$edge_ver2[$_]	$edge_port[$_]\n";
		}
		print "--exclusive block\n";
		print "[END]\n";
	}
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
	& DebugOperationPair;
	print"[Log]SerchOperationPair=>Successful.\n";
}
sub proposalsc {
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

	#1=>cul 0=>not cul
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
		if ($temp6 != 0){
			#計算可能op=>u
			#その中で最大ラベル=>sをそれぞれリセット
			@target_op_u = ();
			@target_op_s = ();
			@target_op_u_amari = ();

			#計算可能なcoを入力タイプを参照しながらuに入れ込む
			#以後ライフタイムが変わるごとに$computable_mainを更新
			foreach(0 .. $#vertex_id){
				if($vertex_type[$_]!~ /I|O|F/){
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
				}else{
					push @target_op_u_amari,$temp5;
				}
			}
			#target_op_s ラベル最大行列
			#target_op_u_amari ラベル最大ではない行列
			#if (@target_op_u){
				print join( ',', @target_op_u ), "==Select Max Label==>";
				print join( ',', @target_op_s ), "\n";
			#}
			#制約より多かったら
			if ($#target_op_s+1 > $temp6){
				print "===================	more\n";
				@temp_top_count = @target_op_s;
				&new_top_count($cul_type_num,$temp6,$schedule);

				foreach(0 .. $#maxtop){
					if ($maxtop[$_] == -1){
						last;
					}
					$temp5 = $maxtop[$_];
					print "	LTset : $temp5\n";
					$lifetime[$temp5] = $schedule;
					$computable_sub[$temp5] = 1;
				}

			#同じだったら
			}elsif ($#target_op_s+1 == $temp6){
				print "===================	equal\n";
				foreach(0 .. $#target_op_s){
					$temp5 = $target_op_s[$_];
					print "	LTset : $temp5\n";
					$lifetime[$temp5] = $schedule;
					#print "デバッグ$temp5 = $schedule\n";
					$computable_sub[$temp5] = 1;
				}
			#少なかったら
			}else{
				print "===================	less\n";

				foreach(0 .. $#target_op_s){
					$temp5 = $target_op_s[$_];
					print "	LTset : $temp5\n";
					$lifetime[$temp5] = $schedule;
					#print "デバッグ$temp5 = $schedule\n";
					$computable_sub[$temp5] = 1;
					$temp6--;
				}
				@temp_top_count = @target_op_u_amari;
				&new_top_count($cul_type_num,$temp6,$schedule);

				foreach(0 .. $#maxtop){
					if ($maxtop[$_] == -1){
						last;
					}
					$temp5 = $maxtop[$_];
					print "	LTset : $temp5\n";
					$lifetime[$temp5] = $schedule;
					$computable_sub[$temp5] = 1;
					$temp6--;
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
		}elsif ($cul_type_num == 3){
			$cul_type_num = 4;
		}elsif ($cul_type_num == 4){
			$cul_type_num = 5;


		#タイプが6だったらライフタイム、$computable_mainを更新する
		}else{
			$cul_type_num = 1;
			$schedule++;
			@computable_main = @computable_sub;
			#print "    	ライフタイム更新[$schedule]\n";
			$temp5 = 0;
			#全てライフタイムが決定していたら
			foreach(0 .. $#lifetime){
				if ($vertex_type[$_]!~ /I|O|F/){
					if($lifetime[$_] == -1){
						#print "		$_のライフタイムが決定していません\n";
						$temp5++;
					}else{
						#print "		決定している$_のライフタイムは$lifetime[$_]です\n";
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
	print"[Log]proposalsc=>Successful\n";
}
sub new_top_count {
	my($n,$now_resource,$now_lt) = @_;
	my ($temp1,$temp2,$temp3,$temp4,$temp5,$temp6,$temp7,$temp8,$temp9);
	my $top_num = 0;
	my $top_num_max = 0;
	my @topmax_now = ();
	my @topmax_now2 = ();
	my @temp_pair1 = ();
	my @temp_pair2 = ();
	my @temp_pair1ds = ();
	my @temp_pair2ds = ();

	my @top_pair_pair;
	my @ad_beforelifetime = ();
	my $end;
	@maxtop = ();
	$temp2 = $#temp_top_count+1;
	if ($n == 1){
		$temp1 = $add;
	}elsif ($n == 2){
		$temp1 = $multi;
	}elsif ($n == 3){
		$temp1 = $sub;
	}elsif ($n == 4){
		$temp1 = $div;
	}else{
		$temp1 = $multi;
	}
	if ($temp2 == 0) {
		print "	Node zero\n";
		return;
	}

	@temp_top_pair = ();
	#(調べたい要素数,リソース制約)
	#組み合わせ計算
	if ($now_resource < $temp2){
		&combinatorial( $temp2, $now_resource, [] );
	}else{
		print "		$temp2, $now_resource\n";
		$now_resource = $temp2;
		my $temp12 = $now_resource;
		while ($temp12 > 0) {
			&combinatorial( $temp2, $temp12, [] );
			$temp12--;
		}
		push @temp_top_pair,-1;
		print join( ',', @temp_top_pair ), "	combinatorial\n";
	}

	foreach (0 .. $#vertex_id) {
		if ($lifetime[$_] == $now_lt - 1){
			push @ad_beforelifetime,$_;
		}
	}

	#生成した組み合わせを消費しきるまで
	while (@temp_top_pair) {
		if ($temp_top_pair[0] == -1) {
			print join( ',', @temp_pair1 ), "==Select=\n";
			#決定済みLTをリストに取り込む
			@temp_pair2 = @temp_top_count;
			@temp_pair1ds = ();
			@temp_pair2ds = ();

			foreach (0 .. $#temp_pair2) {
				my $tmp_flag1 = 0;
				my $temp_dbr = $temp_pair2[$_];
				foreach (0 .. $#temp_pair1) {
					if ($temp_dbr == $temp_pair1[$_]) {
						$tmp_flag1 = 1;
					}
				}
				if ($tmp_flag1 == 1) {
					push @temp_pair1ds,$temp_pair2[$_];
				}else{
					push @temp_pair2ds,$temp_pair2[$_];
				}
			}

			foreach (0 .. $#vertex_id) {
				if ($vertex_type[$_]!~ /I|O|F/){
					if ($lifetime[$_] == $now_lt){
						push @temp_pair1ds,$_;
						print "	temp_pair1ds add =>> $_\n";
					}elsif ($lifetime[$_] == $now_lt + 1){
						push @temp_pair2ds,$_;
						print "	temp_pair2ds add =>> $_\n";

					}
				}
			}
			print join( ',', @temp_pair1ds ), "	LSAT temp_pair1ds \n";
			print join( ',', @temp_pair2ds ), "	LSAT temp_pair2ds\n";

			foreach (0 .. $#temp_pair1ds) {
				$temp4 = $temp_pair1ds[$_];
				#下のLT計算
				foreach (0 .. $#temp_pair2ds) {
					if ($temp4 != $temp_pair2ds[$_]) {
						my $top_result = &top_analyze($temp4,$temp_pair2ds[$_]);
						if ($top_result == 1) {
							print ("INS	$temp4,$temp_pair2ds[$_]\n");
							$top_num++;
						}
					}
				}
				#上のLT
				foreach (0 .. $#ad_beforelifetime) {
					if ($temp4 != $ad_beforelifetime[$_]) {
						my $top_result = &top_analyze($temp4,$ad_beforelifetime[$_]);
						if ($top_result == 1) {
							$top_num++;
						}
					}
				}
			}
			print "TOP == $top_num\n";
			if ($top_num > $top_num_max) {
				@maxtop = ();
				$top_num_max = $top_num;
				foreach (0 .. $#temp_pair1) {
					#print "		演算TOP	$temp_pair1[$_]\n";
					push @maxtop,$temp_pair1[$_];
				}
				push @maxtop,-1;
				#print "		−１\n";

			}elsif ($top_num == $top_num_max) {
				foreach (0 .. $#temp_pair1) {
					#print "		演算TOP	$temp_pair1[$_]\n";
					push @maxtop,$temp_pair1[$_];
				}
				push @maxtop,-1;
				#print "		−１\n";
			}
			@temp_pair1 = ();
			@temp_pair2 = ();
			$top_num = 0;
		}else{
			$temp3 = $temp_top_pair[0];
			push @temp_pair1,$temp_top_count[$temp3];
		}
		shift(@temp_top_pair);
	}
	print "Return	$top_num_max\n";

}
sub top_count {
	my($n) = @_;
	my ($temp1,$temp2,$temp3,$temp4,$temp5,$temp6,$temp7,$temp8,$temp9);
	my @topmax_now = (0);
	my @topmax_now2 = (0);
	my @temp_pair1;
	my @temp_pair2;
	my @top_pair_pair;
	my @temp_pair1_notco;
	my @temp_pair2_notco;
	my @Beforelifetime_notco = ();
	my $end;
	$temp2 = $#temp_top_count+1;
	#print("$n\n");
	if ($n == 1){
		$temp1 = $add;
	}elsif ($n == 2){
		$temp1 = $multi;
	}elsif ($n == 3){
		$temp1 = $sub;
	}elsif ($n == 4){
		$temp1 = $div;
	}else{
		$temp1 = $multi;
	}
	@temp_top_pair = ();
	#(調べたい要素数,リソース制約)
	#組み合わせ計算
	if ($temp1 < $temp2){
		#print "お手本&combinatorial( $temp2, $temp1, [] );\n";

		&combinatorial( $temp2, $temp1, [] );
	}else{
		foreach (0 .. $#temp_top_count){
			push @temp_top_pair,$_;
		}
		push @temp_top_pair,-1;
	}

	#Beforelifetimeのco以外をなくす
	#print join( ',', @Beforelifetime ), "<==消滅前\n";
	foreach (0 .. $#Beforelifetime){
		$temp6 = $Beforelifetime[$_];
		if ($OperationPair[$temp6] >= 1) {
			push @Beforelifetime_notco,$Beforelifetime[$_];
		}
	}
	#print join( ',', @Beforelifetime ), "<==一つ前のライフタイム\n";
	if (@Beforelifetime){
		while (@temp_top_pair) {
			@temp_pair1 = ();
			@temp_pair2 = @temp_top_count;#初期化部分
			@temp_pair_del = ();
			@temp_pair1_notco = ();
			@temp_pair2_notco = ();
			$temp4 = 0;
			$temp8 = 0;
			$temp9 = -1;
			#print join( ',', @temp_top_count ), "<===組み合わせ元\n";
			#print join( ',', @temp_top_pair ), "<===組み合わせ計算結果\n";
			$temp5 = 0;

			while ($temp3 != -1){
				$temp4++;
				$temp3 = $temp_top_pair[$temp5];
				if ($temp3 != -1){
					push @temp_pair1,@temp_top_count[$temp3];
					push @temp_pair_del,$temp3;
				}
				$temp5++;
			}
			@temp_pair_del = sort {$a <=> $b} @temp_pair_del;
			#print join( ',', @temp_pair_del ), "削除対象\n";
			#print join( ',', @temp_pair2 ), "削除前";
			foreach (0 .. $#temp_pair_del){
				$temp9++;
				$temp8 = $temp_pair_del[$_];
				$temp8 = $temp8 - $temp9;
				splice(@temp_pair2, $temp8,1);
				#print join( ',', @temp_pair2 ), "==途中経過";
			}
			#print join( ',', @temp_pair2 ), "==>削除後\n";

			#TOPカウント

			foreach (0 .. $#temp_pair1){
				$temp6 = $temp_pair1[$_];
				if ($OperationPair[$temp6] >= 1) {
					push @temp_pair1_notco,$temp_pair1[$_];
				}
			}
			foreach (0 .. $#temp_pair2){
				$temp6 = $temp_pair2[$_];
				if ($OperationPair[$temp6] >= 1) {
					push @temp_pair2_notco,$temp_pair2[$_];
				}
			}
			#print join( ',', @temp_pair1 ), "==セレクト===>";
			#print join( ',', @temp_pair1_notco ), "\n";
			#print join( ',', @Beforelifetime ), "==決定済み===>";
			#print join( ',', @Beforelifetime_notco ), "\n";
			#print join( ',', @temp_pair2 ), "==決定していない===>";
			#print join( ',', @temp_pair2_notco ), "\n";

			if ($#temp_pair1_notco < $#Beforelifetime_notco){
				@topcount_pair = @Beforelifetime_notco;
				@toppair_2 = @temp_pair1_notco
			}else{
				@topcount_pair = @temp_pair1_notco;
				@toppair_2 = @Beforelifetime_notco;
			}
			$maxtop[0] = 0;
			&happyset();
			#print "決定済みとのtop関係は$maxtop[0]\n";
			$maxtop[1] = $maxtop[0];
			$maxtop[0] = 0;
			if ($#temp_pair1_notco < $#temp_pair2_notco){
				@topcount_pair = @temp_pair2_notco;
				@toppair_2 = @temp_pair1_notco
			}else{
				@topcount_pair = @temp_pair1_notco;
				@toppair_2 = @temp_pair2_notco;
			}
			&happyset();
			$maxtop[0] = $maxtop[0] + $maxtop[1];
			#@topmax_nowの0に最大ラベル,以下セレクトをコンマ区切りで入れていく
			#print "前にある場合maxラベル$maxtop[0]\n";

			if ($topmax_now[0] < $maxtop[0]){
				@topmax_now = ();
				$topmax_now[0] = $maxtop[0];
				foreach(0 .. $#temp_pair1){
					push @topmax_now,$temp_pair1[$_];
				}
				push @topmax_now,-1;
			}elsif($topmax_now[0] == $maxtop[0]){
				foreach(0 .. $#temp_pair1){
					push @topmax_now,$temp_pair1[$_];
				}
				push @topmax_now,-1;
			}
			while ($temp4 != 0){
				shift(@temp_top_pair);
	  		$temp4--;
			}
			if (@temp_top_pair) {
				$temp3 = @temp_top_pair;
			}
		}
		#print join( ',', @topmax_now ), "入ってきた場合の結果\n";
	#ライフタイムが１の場合
	}else{
		while (@temp_top_pair) {
			@temp_pair1 = ();
			@temp_pair2 = @temp_top_count;#初期化部分
			@temp_pair1_notco = ();
			@temp_pair2_notco = ();
			$temp4 = 0;
			@temp_pair_del = ();
			#print join( ',', @temp_top_pair ), "<===組み合わせ計算結果\n";
			$temp5 = 0;
			$temp8 = 0;
			$temp9 = -1;
			while ($temp3 != -1){
				$temp4++;
				$temp3 = $temp_top_pair[$temp5];
				if ($temp3 != -1){
					push @temp_pair1,@temp_top_count[$temp3];
					push @temp_pair_del,$temp3;
				}
				$temp5++;
			}
			@temp_pair_del = sort {$a <=> $b} @temp_pair_del;
			#print join( ',', @temp_pair_del ), "削除対象\n";
			#print join( ',', @temp_pair2 ), "削除前";
			foreach (0 .. $#temp_pair_del){
				$temp9++;
				$temp8 = $temp_pair_del[$_];
				$temp8 = $temp8 - $temp9;
				splice(@temp_pair2, $temp8,1);
				#print join( ',', @temp_pair2 ), "==途中経過";
			}
			#print join( ',', @temp_pair2 ), "==>削除後\n";

			#TOPカウント
			foreach (0 .. $#temp_pair1){
				$temp6 = $temp_pair1[$_];
				if ($OperationPair[$temp6] >= 1) {
					push @temp_pair1_notco,$temp_pair1[$_];
				}
			}
			foreach (0 .. $#temp_pair2){
				$temp6 = $temp_pair2[$_];
				if ($OperationPair[$temp6] >= 1) {
					push @temp_pair2_notco,$temp_pair2[$_];
				}
			}
			#print join( ',', @temp_pair1 ), "==セレクト===>";
			#print join( ',', @temp_pair1_notco ), "\n";
			#print join( ',', @temp_pair2 ), "==それ以2===>";
			#print join( ',', @temp_pair2_notco ), "\n";
			$maxtop[0] = 0;
			if ($#temp_pair1_notco < $#temp_pair2_notco){
				@topcount_pair = @temp_pair2_notco;
				@toppair_2 = @temp_pair1_notco
			}else{
				@topcount_pair = @temp_pair1_notco;
				@toppair_2 = @temp_pair2_notco;
			}
			#print join( ',', @topcount_pair ), "\n";
			#print join( ',', @toppair_2 ), "\n";

			&happyset();
			#@topmax_nowの0に最大ラベル,以下セレクトをコンマ区切りで入れていく
			#print "前にない場合maxラベル$maxtop[0]\n";

			if ($topmax_now[0] < $maxtop[0]){
				@topmax_now = ();
				$topmax_now[0] = $maxtop[0];
				foreach(0 .. $#temp_pair1){
					push @topmax_now,$temp_pair1[$_];
				}
				push @topmax_now,-1;
			}elsif($topmax_now[0] == $maxtop[0]){
				foreach(0 .. $#temp_pair1){
					push @topmax_now,$temp_pair1[$_];
				}
				push @topmax_now,-1;
			}
			while ($temp4 != 0){
				shift(@temp_top_pair);
	  		$temp4--;
			}
			if (@temp_top_pair) {
				$temp3 = @temp_top_pair;
			}
		}
	}
	#従来の方法
	#選ばれていない奴を生成する必要あり
	shift(@topmax_now);
	print join( ',', @topmax_now ), "計算結果\n";
	my $cul_top_max = 0;
	my $cul_top_now = 0;
	my $tmp_tc = -1;
	foreach (0 .. $#topmax_now) {
		$tmp_tc = $topmax_now[$_];
		if ($tmp_tc == -1){
			print("	NOW	$cul_top_now\n");
			if ($cul_top_now > $cul_top_max) {
				$cul_top_max = $cul_top_now;
			}
			$cul_top_now = 0;
		}else{
			foreach (0 .. $#temp_top_count) {
				if ($temp_top_count[$_] != $tmp_tc && $temp_top_count[$_] != -1 && $tmp_tc != -1) {
					my $top_result = &top_analyze($temp_top_count[$_],$tmp_tc);
					#print("	N$top_result	$temp_top_count[$_],$tmp_tc\n");
					if ($top_result == 1){
						$cul_top_now++;
					}
				}
			}
		}
	}
	print "$cul_top_max\n";
	if ($cul_top_max > 0) {
		print "$cul_top_max GO\n";
		foreach (0 .. $#topmax_now) {
			$tmp_tc = $topmax_now[$_];
			if ($tmp_tc == -1){
				print("	NOW	$cul_top_now	$cul_top_now < $cul_top_max\n");
				if ($cul_top_now < $cul_top_max) {
					my $tmp_count10 = $_ - 1;
					if ($tmp_count10 > 0){
						while ($topmax_now[$tmp_count10]!= -1) {
							$topmax_now[$tmp_count10] = -2;
							$tmp_count10--;
							if ($tmp_count10<0) {
								print "強制終了\n";
								last;
							}
						}
					}
				}
				$cul_top_now = 0;
			}else{
				foreach (0 .. $#temp_top_count) {
					if ($temp_top_count[$_] != $tmp_tc && $temp_top_count[$_] != -1 && $tmp_tc != -1) {
						my $top_result = &top_analyze($temp_top_count[$_],$tmp_tc);
						#print("	N$top_result	$temp_top_count[$_],$tmp_tc\n");
						if ($top_result == 1){
							$cul_top_now++;
						}
					}
				}
			}
		}
	}
	my @topmax_now2 = @topmax_now;
	print "$#topmax_now2\n";
	@topmax_now = ();
	foreach (0 .. $#topmax_now2){
		if ($topmax_now2[$_] != -2) {
			push @topmax_now,$topmax_now2[$_];
		}
	}
	print join( ',', @topmax_now ), "計算修正結果\n";

	@maxtop = ();
	$end = 1;
	while ($end == 1) {
		while(1){
			if ($topmax_now[0] != -1){
				push @maxtop,$topmax_now[$_];
				shift(@topmax_now);
			}else{
				shift(@topmax_now);
				last;
			}
		}
		if (@maxtop){
			$end = 0;
		}
	}
	print "top関数を終了ライフタイム送信@maxtop\n\n";
}
sub top_analyze {
	my( $n, $r ) = @_;
	#同じ種類か
	if ($vertex_type[$n] !~ $vertex_type[$r]) {
		return 0;
	}
	#2時刻連続か
	#if (abs($lifetime[$n] - $lifetime[$r]) != 1) {
	#	return 0;
	#}
	#依存関係
	$count = 0;
	my $tmp1 = 0;
	my @base = ();
	my @target = ();
	my @next = ();
	push @next,$n;
	push @next,$r;
	foreach (0 .. $#vertex_id) {
		push @base,1;
	}
	while ($count < 1000) {
		$count++;
		@target = @next;
		@next = ();
		foreach (0 .. $#target) {
			$tmp1 = $target[$_];
			foreach (0 .. $#edge_id) {
				if ($edge_ver2[$_] == $tmp1){
					push @next,$edge_ver1[$_];
					my $tmp2 = $edge_ver1[$_];
					$base[$tmp2]++;
					if ($base[$tmp2] >= 3) {
						return 0
					}
				}
			}
		}
	}
	return 1
}

sub permute {
	my $temp3 = $#_;
  my @items = @{ $_[0] };
  my @perms = @{ $_[1] };
	my ($temp1,$temp2);
  unless(@items){
		$temp2 = 0;
    foreach (0 .. $#toppair_2){
			#print "	top計算($toppair_2[$_],$perms[$_])==>";
			$temp1 = &top($toppair_2[$_],$perms[$_]);
			if ($temp1 == 1){
				#printf "		TOPです\n";
				$temp2++;
			}else{
				#printf "		TOPではありません\n";
			}
    }
		#print "==========================\n";
		if ($maxtop[0] < $temp2){
			$maxtop[0] = $temp2;
		}
		if ($maxtop[0] == $temp3){
			return 0;
		}
  } else {
    my(@newitems, @newperms, $i);
    foreach $i (0 .. $#items) {
      @newitems = @items;
      @newperms = @perms;
      unshift(@newperms, splice(@newitems, $i, 1));
      permute([@newitems], [@newperms]);
    }
  }
}
sub top {
	#modoriti 1=>top,0=>nottop
	#$n high label
	my( $n, $r ) = @_;
	my $temp1;
	my $temp2;
	my $temp3;
	my @hikaku = ();
	my @serch_top1 = ();
	my @serch_top2 = ();
	#print "$n と $r のTOP結果は...";
	$temp1 = 0;
	if (!$n){
		$temp1++;
	}
	if (!$r){
		$temp1++;
	}
	if ($temp1 == 0){
		push @serch_top2 , $r;
		while (@serch_top2) {
			@serch_top1 = @serch_top2;
			@serch_top2 = ();
			foreach (0 .. $#serch_top1){
				$temp2 = $serch_top1[$_];
				foreach(0 .. $#edge_ver2){
					if ($temp2 == $edge_ver2[$_]){
						push @serch_top2 , $edge_ver1[$_];
					}
				}
			}
		}
		push @serch_top1 , $r;
		#print join( ',', @serch_top1 ), "\n";
		@hikaku = @serch_top1;
		@serch_top2 = ();
		push @serch_top2 , $n;
		foreach (0 .. $#hikaku){
			if ($hikaku[$_] == $n){
				$temp1++;
				#print "無理です!!(無理やり)\n";
				return 0;
				last;
			}
		}
		while (@serch_top2) {
			@serch_top1 = @serch_top2;
			@serch_top2 = ();
			foreach (0 .. $#serch_top1){
				$temp2 = $serch_top1[$_];
				foreach(0 .. $#edge_ver2){
					if ($temp2 == $edge_ver2[$_]){
						push @serch_top2 , $edge_ver1[$_];
						$temp3 = $edge_ver1[$_];
						foreach (0 .. $#hikaku){
							#print "top依存関係計算$hikaku[$_] == $temp3\n";
							if ($hikaku[$_] == $temp3){
								#print "$hikaku[$_] == $edge_ver1[$temp3]でできないっぽい\n";
								$temp1++;
								#print "無理です!!(無理やり)\n";
								return 0;
								last;
							}
						}
					}
				}
			}
		}
	}
	if ($temp1 == 0){
		#print "組めます!!\n";
		return 1;
	}else{
		#print "無理です!!\n";
		return 0;
	}
}
sub combinatorial {
  my( $n, $r, $result_set ) = @_;

  if ( $r == 0 ){
		push @temp_top_pair,@$result_set;
		push @temp_top_pair,-1;
    return;
  }

  my $start = $result_set->[ $#$result_set ];
  $start += defined $start ? 1 : 0;
  my $end = $n - $r;
  for ( my $i = $start; $i <= $end; $i++ ){
    push @$result_set, $i;
    &combinatorial( $n, $r - 1, $result_set );
    pop @$result_set;
  }
}
sub combinatorial2 {
  my( $n, $r, $result_set ) = @_;

  if ( $r == 0 ){
		push @temp_top_pair2,@$result_set;
		push @temp_top_pair2,-1;
    return;
  }

  my $start = $result_set->[ $#$result_set ];
  $start += defined $start ? 1 : 0;
  my $end = $n - $r;
  for ( my $i = $start; $i <= $end; $i++ ){
    push @$result_set, $i;
    &combinatorial2( $n, $r - 1, $result_set );
    pop @$result_set;
  }
}
sub listsc2 {
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
sub listsc {
	my @backup_vertex_id = @vertex_id;
	my @backup_vertex_type = @vertex_type;
	my @backup_label = @label;
 	my @computable_main = ();
	my @computable_sub = ();
	my ($i,$j,$temp,$temp2,$temp3,$mulc,$addc,$finish_conditions);
	my $finish_listsc = 1;
	my $lifetime_count = 1;
	&inputresorce;
	foreach(0 .. $#label){
		if($vertex_type[$_]=~ /I|F/){
			push @computable_sub, 1;
		}else{
			push @computable_sub, 0;
		}
	}

	##maxlabel
	for($i = 0 ;$i < $#backup_label;$i++){
	  for($j = 0;$#backup_label > $j;$j++){
	    if ($backup_label[$j] < $backup_label[$j+1]) {
	         $temp = $backup_vertex_id[$j];
					 $temp2 = $backup_vertex_type[$j];
					 $temp3 = $backup_label[$j];
	         $backup_vertex_id[$j] = $backup_vertex_id[$j + 1];
					 $backup_vertex_type[$j] = $backup_vertex_type[$j + 1];
					 $backup_label[$j] = $backup_label[$j + 1];
					 $backup_vertex_id[$j + 1]= $temp;
	         $backup_vertex_type[$j + 1]= $temp2;
					 $backup_label[$j + 1]= $temp3;
	    }
	  }
	}
	$finish_conditions = 1;
	while ($finish_conditions != 0) {
		if ($lifetime_count > 100) {
			print "ERROR[004]lifetime_count is more than 100(infinite loop?)\n";
			exit;
		}
		$finish_conditions = 0;
		@computable_main = @computable_sub;
		$mulc = 0;
		$addc = 0;
		$subc = 0;
		$divc = 0;
		foreach (0 .. $#backup_label){
			$temp = $backup_vertex_id[$_];
			if ($computable_main[$temp] == 0){
				if($backup_vertex_type[$_] =~ /A/){
					if($addc < $add){
						$finish_conditions = 1;
						$temp = $backup_vertex_id[$_];
						$temp2 = 0;
						foreach (0 .. $#edge_id){
							if ($edge_ver2[$_] == $temp){
								$temp3 = $edge_ver1[$_];
								if ($computable_main[$temp3] == 1) {
									$temp2++;
								}else{
								}
							}
						}
						if ($temp2 == 2) {
							$addc++;
							$computable_sub[$temp] = 1;
							$lifetime[$temp] = $lifetime_count;
						}
					}
				}
				if($backup_vertex_type[$_] =~ /D/){
					if($divc < $div){
						$finish_conditions = 1;
						$temp = $backup_vertex_id[$_];
						$temp2 = 0;
						foreach (0 .. $#edge_id){
							if ($edge_ver2[$_] == $temp){
								$temp3 = $edge_ver1[$_];
								if ($computable_main[$temp3] == 1) {
									$temp2++;
								}else{
								}
							}
						}
						if ($temp2 == 2) {
							$divc++;
							$computable_sub[$temp] = 1;
							$lifetime[$temp] = $lifetime_count;
						}
					}
				}
				if($backup_vertex_type[$_] =~ /S/){
					if($subc < $sub){
						$finish_conditions = 1;
						$temp = $backup_vertex_id[$_];
						$temp2 = 0;
						foreach (0 .. $#edge_id){
							if ($edge_ver2[$_] == $temp){
								$temp3 = $edge_ver1[$_];
								if ($computable_main[$temp3] == 1) {
									$temp2++;
								}else{
								}
							}
						}
						if ($temp2 == 2) {
							$subc++;
							$computable_sub[$temp] = 1;
							$lifetime[$temp] = $lifetime_count;
						}
					}
				}
				if($backup_vertex_type[$_] =~ /M/){
					if($mulc < $multi){
						$finish_conditions = 1;
						$temp = $backup_vertex_id[$_];
						$temp2 = 0;
						foreach (0 .. $#edge_id){
							if ($edge_ver2[$_] == $temp){
								$temp3 = $edge_ver1[$_];
								if ($computable_main[$temp3] == 1) {
									$temp2++;
								}else{
								}
							}
						}
						if ($temp2 == 2) {
							$mulc++;
							$computable_sub[$temp] = 1;
							$lifetime[$temp] = $lifetime_count;
						}
					}
				}
			}
		}
		foreach(0 .. $#lifetime){
			if ($vertex_type[$_]!~ /I|O|F/){
				if($lifetime[$_] == -1){
					#print "		$_のライフタイムが決定していません\n";
					$temp5++;
				}
			}
		}
		#print "		$_のライフタイム更新\n";
		$lifetime_count++;
	}
	print"[Log]listsc=>Successful\n";
	&debuglists;
}
sub label {
	my $count;
	my $lock = 0;
	my $location;
	my @pass;
	my $temp;
	foreach(0 .. $#vertex_id){
		if($vertex_type[$_] =~ /O/){
			@array_location = ();
			$pass[0] = $_;
			$label[$_] = 0;
			for($count = 0;$count != -1;){
				$lock = 0;
				if(!$array_location[$count]){
				    $array_location[$count] = 0;
				}
				foreach($array_location[$count] .. $#edge_id){
					if($edge_ver2[$_] == $pass[$count]){
						$array_location[$count] = $_+1;
						$temp = $pass[$count];
						if($label[$temp] < $count){
							$label[$temp] = $count;
						}
						if(!$edge_id[$_+1]){
								$edge_id[$_+1] = $_+1;
								$edge_ver1[$_+1] = -1;
								$edge_ver2[$_+1] = -1;
						}
						$array_location[$count] = $edge_id[$_+1];
						$pass[$count+1] = $edge_ver1[$_];
						$lock = 1;
						last;
					}
				}
				if($lock == 0){
					if($count == 0){
						$count = $count-1;
					}else{
						$count = $count-1;
					}
				}else{
					$count++;
				}
			}
		}
	}
	foreach(0 .. $#label){
		if($label[$_] =~ /-1/){
			if($vertex_type[$_]!~ /I/){
				print "ERROR[002]:Input data is not right\n";
				exit;
			}
		}
	}
	print"[Log]label=>Successful.\n";
}
sub label2 {
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
	&debuglabel;
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
sub DebugOperationPair {
	if ($mode == 1){
		print "\n\n[DebugOperationPair]\n[vertex_id][input[2],co[1],NOTco[0]]\n";
		foreach (0 .. $#OperationPair) {
			print "[$_]$OperationPair[$_]\n";
		}
		print "[END]\n";
	}
}
sub debuglists {
	if ($mode == 1){
		print "\n[DebugLifeTime]\n[adder=$add,Multiplier=$multi]\n[vertex_id][lifetime]\n";
		foreach(0 .. $#vertex_id){
			print "[$_][$lifetime[$_]]\n";
		}
		print "[END]\n";
	}
}
sub debuglabel {
	if ($mode == 1){
		print "\n[DebugLabel]\n[vertex_id][Label]\n";
		foreach(0 .. $#vertex_id){
			print "[$_][$label[$_]]\n";
		}
		print "[END]\n";
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
