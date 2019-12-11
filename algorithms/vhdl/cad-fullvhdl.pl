use warnings;
#perl <programname> <ARGV0> <ARGC1>
$sdfg_input = $ARGV[0];
$binding_input = $ARGV[1];
$cadformat_output = $ARGV[2];
$vhdl_output= $ARGV[3];
$version = "Version 1.2";
#sdfgdata
@vertex_id = ();
@vertex_type = ();
@lifetime = ();
@vertex_calculator_type = ();
@vertex_calculator_num = ();
@vertex_convert_after_id = ();
#edgedata
@edge_id = ();
@edge_ver1 = ();
@edge_ver2 = ();
@edge_port = ();
@edge_register = ();
@edge_convert_after_id = ();
#bindin@edge_register = ();g
@register_number = ();
@register_binding = ();

@operation_number = ();
@operation_type = ();
@operation_binding = ();
#cad_format
@cf_node_number = ();
@cf_node_type = ();
#@cf_line_number = ();
@cf_line_in = ();
@cf_line_out = ();
@cf_line_port = ();
@cf_line_array_num = ();

@register_id = ();

@tmp_route_search = ();

$register = 0;
$add = 0;
$sub = 0;
$mult = 0;
$div = 0;

#Config (True = 1 , Else = 0)
$Config_Debug_input = 1;
$Config_Debug_input_processing = 1;
$Config_Debug_work_vhdl = 0;
#main
&copy_rights;
&read_sdfg;
&read_binding;
&debug_input;
&create_cadformat;
&debug_cadformat;
&create_vhdl;
print ("\nThank you...\n");

#copy_rights;
sub copy_rights {
	#コピーライトを表示する、ただそれだけ。
	print ("\n			   $version\n");
	print ("	 Copyright (c) 2018 by Yoshikawa Laboratory\n");
	print ("			ALL RIGHTS RESERVED\n\n");
	#sleep (2);
}
#read_sdfg;
sub read_sdfg {
	#SDFG形式のファイルを読み込む
	chomp($sdfg_input);
	open(FH, "$sdfg_input") or die("ERROR[001] : Sdfg file is not found");
		@sdfg = <FH>;
	close(FH);

	foreach(@sdfg){
		$_ =~ s/#.+//;   ##remove comments
		$_ =~ s/^\s*$//;   ##remove empty lines
	}


	$row=0;
	foreach(0 .. $#sdfg){
		if( $sdfg[$_] =~ /--vertex/ ){
			$row = $_;
			last;
		}
	}
	#subdfg_inport
	foreach($row .. $#sdfg){
		if( $sdfg[$_] =~ /--edge/ ){
			$row = $_;
			last;
		}
		if( $sdfg[$_] !~ /(--vertex)|(^\s*$)/ ){
			$sdfg[$_] =~ s/\r//;
		 	$sdfg[$_] =~ s/\n//;
			$sdfg[$_] =~ s/\s+/,/g;   ##datainput
			my @list = split(/,/,$sdfg[$_]);
			push @vertex_id, $list[0];
			push @vertex_type, $list[1];
			push @lifetime, $list[2];
		}
	}
	#edge_inport
	foreach( $row .. $#sdfg ){
		if( $sdfg[$_] =~ /--exclusive block/ ){
			$row = $_;
			last;
		}

		if( $sdfg[$_] !~ /(--edge)|(^\s*$)/ ){
			$sdfg[$_] =~ s/\r//;
		 	$sdfg[$_] =~ s/\n//;
			$sdfg[$_] =~ s/\s+/,/g;   ##datainput
			my @list = split(/,/,$sdfg[$_]);
			push @edge_id, $list[0];
			push @edge_ver1, $list[1];
			push @edge_ver2, $list[2];
			push @edge_port, $list[3];

			push @register_id, -1;
		}
	}
	print"[Log]read_sdfg=>Successful.\n";
}
#read_binding;
sub read_binding {
	#DAT形式のファイルを読み込む
	chomp($binding_input);
	open(FH, "$binding_input") or die("ERROR[002] : Binding file is not found");;
		@dat = <FH>;
	close(FH);

	foreach(@dat){
		$_ =~ s/#.+//;   ##remove comments
		$_ =~ s/^\s*$//;   ##remove empty lines
	}


	$row=0;
	foreach(0 .. $#dat){
		if( $dat[$_] =~ /--register binding/ ){
			$row = $_;
			last;
		} elsif ($dat[$_] =~ /Register/) {
			$dat[$_] =~ s/Register.\s+//;
			$register = $dat[$_];
		} elsif ($dat[$_] =~ /add./) {
			$dat[$_] =~ s/add.\s+//;
			$add = $dat[$_];
		} elsif ($dat[$_] =~ /sub./) {
			$dat[$_] =~ s/sub.\s+//;
			$sub = $dat[$_];
		} elsif ($dat[$_] =~ /mult./) {
			$dat[$_] =~ s/mult.\s+//;
			$mult = $dat[$_];
		} elsif ($dat[$_] =~ /div./) {
			$dat[$_] =~ s/div.\s+//;
			$div = $dat[$_];
		}
	}
	my $line_count = 0;
	foreach($row .. $#sdfg){
		if( $dat[$_] =~ /--operation/ ){
			$row = $_;

			last;
		}
		if( $dat[$_] !~ /(--register)|(^\s*$)/ ){
			$dat[$_] =~ s/\r//;
		 	$dat[$_] =~ s/\n//;
			$dat[$_] =~ s/\s+/,/g;   ##datainput
			my @list = split(/,/,$dat[$_]);
			foreach(1 .. $#list){
				push @register_number, $list[0];
				push @register_binding, $list[$_];
			}
		}
		$line_count++;
	}

	$line_count = 0;
	foreach( $row .. $#dat ){
		if( $dat[$_] =~ /--exclusive/ ){
			$row = $_;
			last;
		}
		if( $dat[$_] !~ /(--operation)|(^\s*$)/ ){
			$dat[$_] =~ s/\r//;
		 	$dat[$_] =~ s/\n//;
			$dat[$_] =~ s/\s+/,/g;   ##datainput
			my @list = split(/,/,$dat[$_]);
			my $tmp_type = &conv_operation_type($list[0]);
			my $tmp_num = 	&conv_operation_num($list[0]);
			foreach(1 .. $#list){
				push @operation_number, $tmp_num;
				push @operation_type, $tmp_type;
				push @operation_binding, $list[$_];
			}
		}
		$line_count++;
	}
	print"[Log]read_binding=>Successful.\n";
}
sub conv_operation_num {
	my $operation_text = $_[0];
	$operation_text =~ s/^.*?(\d+).*$/$1/;
	return $operation_text;
}
sub conv_operation_type {
	my $operation_text = $_[0];
	if( $operation_text =~ /Add/ ){
		return 1;
	}elsif( $operation_text =~ /Sub/ ){
		return 2;
	}elsif( $operation_text =~ /Mul/ ){
		return 3;
	}elsif( $operation_text =~ /Div/ ){
		return 4;
	}
}
#create_cadformat;
sub create_cadformat{
	#この工程でSDFGとBaindingファイルを１つにした形式のファイルを生成する
	&input_vertex_calculator;
	&input_edge_register;
	&create_cf_node;
	&create_cf_line;
	&remove_duplicate_line;
	&add_multiplexer;
	&arrangement_line;
}
sub input_vertex_calculator {
	#SDFGのVertexデータに具体的な演算器情報を付与・保持する
	foreach(0 .. $#vertex_id){
		my $flag = 0;
		if( $vertex_type[$_] !~ /I|O|R/ ){
			my $tmp = $_;
			foreach (0 .. $#operation_number) {
				if ($operation_binding[$_] == $tmp) {
					push @vertex_calculator_type, $operation_type[$_];
					push @vertex_calculator_num, $operation_number[$_];
					push @vertex_convert_after_id, -1;
					$flag = 1;
					last;
				}
			}
		}
		if ($flag == 0){
			push @vertex_calculator_type, -1;
			push @vertex_calculator_num, -1;
			push @vertex_convert_after_id, -1;
		}
	}
}
sub input_edge_register {
	#SDFGのEdgeデータに対応するレジスタIDを検索して、その結果を保持する
	foreach (0 .. $#edge_id){
		push @edge_register, -1;
		push @edge_convert_after_id, -1;
	}
	foreach (0 .. $#register_number){
		my $tmp = $register_binding[$_];
		$edge_register[$tmp] = $register_number[$_];
	}
	my $count = 0;
	while($count < 500){
		my $flag = 0;
		foreach (0 .. $#edge_id){
			if ($edge_register[$_] == -1) {
				$flag = 1;
				my $tmp = $_;
				foreach (0 .. $#edge_id){
					if ($edge_ver1[$tmp] == $edge_ver1[$_]) {
						if ($edge_register[$_] != -1) {
							$edge_register[$tmp] = $edge_register[$_];
							$flag = 0;
						}
					}
				}
			}
		}
		if ($flag == 0){
			last;
		}
		$count++;
	}
}
sub create_cf_node {
	#RTL上の入力・出力・レジスタ・演算器を表すデータを作成する
	# 1 : input
	# 2 : outout
	# 3 : register
	# 4 : Add
	# 5 : sub
	# 6 : $mult
	# 7 : Div
	# 8 : multiprexer
	my $count = 0;
	foreach (0 .. $#vertex_id){
		if ($vertex_type[$_] =~ /I/) {
			$vertex_convert_after_id[$_] = $count;
			push @cf_node_number,$count;
			push @cf_node_type,1;
			$count++;
		}elsif ($vertex_type[$_] =~ /O|R/) {
			$vertex_convert_after_id[$_] = $count;
			push @cf_node_number,$count;
			push @cf_node_type,2;
			$count++;
		}
	}
	#register node
	foreach (1 .. $register){
		push @cf_node_number,$count;
		push @cf_node_type,3;
		my $tmp = $_;
		foreach (0 .. $#edge_id){
			if ($edge_register[$_] == $tmp) {
				$edge_convert_after_id[$_] = $count;
			}
		}
		$count++;
	}
	#culculator node
	my @tmplist = ();
	foreach (0 .. $#vertex_id){
		if ($vertex_type[$_] !~ /I|O|R/) {
			my $flag = 0;
			my $sum = $vertex_calculator_type[$_] * 10 + $vertex_calculator_num[$_];
			foreach (0 .. $#tmplist){
				if ($tmplist[$_] == $sum) {
					$flag = 1;
				}
			}
			if ($flag == 0){
				push @tmplist,$sum;
			}
		}
	}
	foreach (0 .. $#tmplist) {
		my $tmp = $_;
		my $type = -1;
		foreach (0 .. $#vertex_id){
			if ($vertex_type[$_] !~ /I|O|R/) {
				my $sum = $vertex_calculator_type[$_] * 10 + $vertex_calculator_num[$_];
				if ($tmplist[$tmp] == $sum) {
					$vertex_convert_after_id[$_] = $count;
					$type = $vertex_calculator_type[$_];
				}
			}
		}
		$type = $type + 3;
		push @cf_node_number,$count;
		push @cf_node_type,$type;
		$count++;
	}
	if ($Config_Debug_input_processing == 1){
		print ("[Debug]Input Sdfd Processing(Vertex)\n");
		foreach (0 .. $#vertex_id){
			print("$vertex_id[$_]	$vertex_type[$_]	$lifetime[$_]	$vertex_calculator_type[$_]	$vertex_calculator_num[$_]	$vertex_convert_after_id[$_]\n");
		}
		print ("[Debug]Input Edge Processing(Edge)\n");
		foreach (0 .. $#edge_id){
			print("$edge_id[$_]	$edge_ver1[$_]	$edge_ver2[$_]	$edge_port[$_]	$edge_register[$_]	$edge_convert_after_id[$_]\n");
		}
	}
}
sub create_cf_line {
	#RTL上の入力・出力・レジスタ・演算器の接続関係を表すデータを作成する
	#input to register
	foreach (0 .. $#vertex_id){
		if ($vertex_type[$_] =~ /I/) {
			my $tmp = $_;
			foreach (0 .. $#edge_id){
				if ($edge_ver1[$_] == $tmp) {
					push @cf_line_in,$vertex_convert_after_id[$tmp];
					push @cf_line_out,$edge_convert_after_id[$_];
					push @cf_line_port,3;
					last;
				}
			}
		}
	}
	#register to culculator
	foreach (0 .. $#vertex_id){
		my $tmp = $_;
		if ($vertex_type[$_] !~ /I|O|R/) {
			foreach (0 .. $#edge_id){
				if ($edge_ver2[$_] == $tmp) {
					push @cf_line_out,$vertex_convert_after_id[$tmp];
					push @cf_line_in,$edge_convert_after_id[$_];
					if ($edge_port[$_] =~ /r/){
						push @cf_line_port,1;
					}elsif ($edge_port[$_] =~ /l/){
						push @cf_line_port,2;
					}else{
						push @cf_line_port,3;
					}
				}
			}
		}
	}
	#culculator to register
	foreach (0 .. $#vertex_id){
		my $tmp = $_;
		if ($vertex_type[$_] !~ /I|O|R/) {
			foreach (0 .. $#edge_id){
				if ($edge_ver1[$_] == $tmp) {
					push @cf_line_in,$vertex_convert_after_id[$tmp];
					push @cf_line_out,$edge_convert_after_id[$_];
					push @cf_line_port,3;
				}
			}
		}
	}
	#register to output
	foreach (0 .. $#vertex_id){
		my $tmp = $_;
		if ($vertex_type[$_] =~ /O|R/) {
			foreach (0 .. $#edge_id){
				if ($edge_ver2[$_] == $tmp) {
					push @cf_line_out,$vertex_convert_after_id[$tmp];
					push @cf_line_in,$edge_convert_after_id[$_];
					push @cf_line_port,3;
				}
			}
		}
	}
}
sub remove_duplicate_line{
	#同じところから、同じ場所に接続されている接続線を削除する
	foreach (0 .. $#cf_line_in){
		my $tmp0 = $_;
		my $tmp1 = $cf_line_in[$_];
		my $tmp2 = $cf_line_out[$_];
		my $tmp3 = $cf_line_port[$_];
		foreach (0 .. $#cf_line_in){
			if ($tmp1 == $cf_line_in[$_] && $tmp2 == $cf_line_out[$_] && $tmp3 == $cf_line_port[$_] && $tmp0 != $_) {
				$cf_line_in[$_]= -1;
			}
		}
	}
	for (my $s = $#cf_line_in;$s >= 0;$s--){
		if ($cf_line_in[$s] == -1) {
			#print ("$s\n");
			splice(@cf_line_in, $s, 1);
			splice(@cf_line_out, $s, 1);
			splice(@cf_line_port, $s, 1);

		}
	}
}
sub add_multiplexer {
	#入力が重複している場所を検索・マルチプレクサを挿入する。また、CADFormatの接続関係も修正する
	print ("\n---------------[Debug]---------------\n");
	print ("[Debug]CF_Node\n");
	foreach (0 .. $#cf_node_number){
		print("$cf_node_number[$_]	$cf_node_type[$_]\n");
	}
	print ("\n[Debug]CF_Line\n");
	foreach (0 .. $#cf_line_in){
		print("$cf_line_in[$_]	$cf_line_out[$_]	$cf_line_port[$_]\n");
	}
	#全てのcfノードをループさせる
	foreach (0 .. $#cf_node_number) {
		my $tmp = $_;
		#それぞれのポートの場合
		foreach(1 .. 3) {
			my $port = $_;
			#からのリスト生成
			my @listtmp = ();
			#接続関係をループ
			foreach(0 .. $#cf_line_in) {
				#現在のcfノードに入る接続・ポートがループを満たす時
				if ($cf_line_out[$_] == $tmp && $cf_line_port[$_] == $port) {
					#そのラインを記憶する
					push @listtmp,$_;
				}
			}
			#２つ以上の入力があるときに
			if ($#listtmp >= 1) {
				print ("マルチプレクサ追加 $tmp $#listtmp\n");
				#add_multiplexer
				my $tmp_st_mulcount = $#cf_node_number + 1;
				foreach (0 .. $#listtmp - 1) {
					push @cf_node_number,$#cf_node_number + 1;
					push @cf_node_type,8;
					if ($_ == $#listtmp - 1){
						push @cf_line_in,$#cf_node_number;
						push @cf_line_out,$tmp;
						push @cf_line_port,$port;
					}else{
						push @cf_line_in,$#cf_node_number;
						push @cf_line_out,$#cf_node_number + 1;
						push @cf_line_port,2;
					}
				}
				#change_line
				my $count = 0;
				foreach(0 .. $#cf_line_out) {
					if ($cf_line_out[$_] == $tmp && $cf_line_port[$_] == $port && $_ != $#cf_line_out) {
						$cf_line_out[$_] = $tmp_st_mulcount;
						if ($count == 0) {
							$cf_line_port[$_] = 1;
						}elsif ($count == 1) {
							$cf_line_port[$_] = 2;
							$tmp_st_mulcount++;
						}else{
							$cf_line_port[$_] = 1;
							$tmp_st_mulcount++;
						}
						$count++;
					}
				}
			}
		}
	}
}
sub arrangement_line {
	#接続関係のみを表したCADFormatに実際の配線時のIDを振り分ける（LINEデータ）
	foreach(0 .. $#cf_line_in) {
		push @cf_line_array_num,$_;
	}
	foreach(0 .. $#cf_node_number) {
		my $tmp = $cf_node_number[$_];
		my $tmp2 = -1;
		foreach (0 .. $#cf_line_in) {
			if ($tmp == $cf_line_in[$_]) {
				if ($tmp2 == -1) {
					$tmp2 = $_;
				}else{
					$cf_line_array_num[$_] = $tmp2;
				}
			}
		}
	}
}
#create_vhdl;
sub create_vhdl{
	my $return_text = "";
	my $tmp_text = "";
	$return_text = &create_datapath;
	$tmp_text = "$tmp_text$return_text";

	$return_text = &create_controller;
	$tmp_text = "$return_text$tmp_text";

	$return_text = &create_circuit;
	$tmp_text = "$return_text$tmp_text";

	$return_text = &first_ieee_vhdl;
	$tmp_text = "$return_text$tmp_text";

	$return_text = $tmp_text;
	#output
	#my $outputfile = $sdfg_input;
	#$outputfile =~ s/\.sdfg/\.vhdl/;
	#print($outputfile);
	my $file = $vhdl_output;
	open my $fh, '>', $file;
	print $fh "$return_text";
	close $fh;
}
sub ieee_vhdl {
	my $return_text ="library ieee;\nuse ieee.std_logic_1164.all;\nuse ieee.std_logic_arith.all;\nuse work.datapathpack.all;\n";
	return $return_text;
}
sub first_ieee_vhdl {
	my $return_text ="library ieee;\nuse ieee.std_logic_1164.all;\nuse ieee.std_logic_arith.all;\n";
	$return_text = "$return_text\npackage datapathpack is\n	subtype BUS16 is signed( 15 downto 0 );\nend;\n\n";
	return $return_text;
}

#create_datapath
sub create_datapath {
	my $return_text = "";
	my $tmp_text = "";
	$tmp_text = &create_entity_datapath;
	$return_text = "$return_text\n$tmp_text";
	$tmp_text = &create_architecture_struct_datapath;
	$return_text = "$return_text\n$tmp_text";
	$tmp_text = &create_datapath_other;
	$return_text = "$return_text\n$tmp_text";
	$tmp_text = &ieee_vhdl;
	$return_text = "$tmp_text\nentity datapath is$return_text";
	print ("$return_text");
	return $return_text;
}
sub create_entity_datapath {
	my @tmp_import = ();
	my @tmp_mux = ();
	my @tmp_reg = ();
	my @tmp_output = ();

	foreach (0 .. $#cf_node_number) {
		if ($cf_node_type[$_] == 1) {
			push @tmp_import,$_;
		}elsif ($cf_node_type[$_] == 8) {
			push @tmp_mux,$_;
		}elsif ($cf_node_type[$_] == 3) {
			push @tmp_reg,$_;
		}elsif ($cf_node_type[$_] == 2) {
			push @tmp_output,$_;
		}
	}
	my $return_text = &ieee_vhdl;
	$return_text = "$return_text\nentity datapath is\n";
	my $tmp_port_tex = "	port(	\n";
	#import
	foreach(0 .. $#tmp_import){
		$tmp_port_tex = "$tmp_port_tex		inport$tmp_import[$_]	: in BUS16;\n";
	}
	#mux
	foreach(0 .. $#tmp_mux){
		$tmp_port_tex = "$tmp_port_tex		mux$tmp_mux[$_]	: in std_logic;\n";
	}
	#reg
	foreach(0 .. $#tmp_reg){
		$tmp_port_tex = "$tmp_port_tex		reg$tmp_reg[$_]	: in std_logic;\n";
	}
	#Clock
	$tmp_port_tex = "$tmp_port_tex		clk	: in std_logic;\n";
	#out
	foreach(0 .. $#tmp_output){
		if ($_ == $#tmp_output) {
			$tmp_port_tex = "$tmp_port_tex		outport$tmp_output[$_]	: out BUS16;\n	);\nend;\n";
		}else{
			$tmp_port_tex = "$tmp_port_tex		outport$tmp_output[$_]	: out BUS16;\n";
		}
	}
	#print ("$tmp_port_tex");
	return $tmp_port_tex
}
sub create_architecture_struct_datapath {
	my $tmp_add = 0;
	my $tmp_sub = 0;
	my $tmp_mul = 0;
	my $tmp_div = 0;
	my $tmp_reg = 0;
	my $tmp_mux = 0;

	foreach (0 .. $#cf_node_number) {
		if ($cf_node_type[$_] == 3) {
			$tmp_reg = 1;
		}elsif ($cf_node_type[$_] == 4) {
			$tmp_add = 1;
		}elsif ($cf_node_type[$_] == 5) {
			$tmp_sub = 1;
		}elsif ($cf_node_type[$_] == 6) {
			$tmp_mul = 1;
		}elsif ($cf_node_type[$_] == 7) {
			$tmp_div = 1;
		}elsif ($cf_node_type[$_] == 8) {
			$tmp_mux = 1;
		}
	}

	my $return_text = "architecture struct of datapath is";
	if ($tmp_reg == 1) {
		$return_text = "$return_text\ncomponent reg\n	port(	din : in BUS16;\n		dout : out BUS16;";
		$return_text = "$return_text\n		load : in std_logic;\n		clk : in std_logic );\nend component;\n";
	}
	if ($tmp_add == 1) {
		$return_text = "$return_text\ncomponent cm_add\n	port(	din0 : in BUS16;\n		din1 : in BUS16;";
		$return_text = "$return_text\n		dout : out BUS16 );\nend component;\n";
	}
	if ($tmp_sub == 1) {
		$return_text = "$return_text\ncomponent cm_sub\n	port(	din0 : in BUS16;\n		din1 : in BUS16;";
		$return_text = "$return_text\n		dout : out BUS16 );\nend component;\n";
	}
	if ($tmp_mul == 1) {
		$return_text = "$return_text\ncomponent cm_mult\n	port(	din0 : in BUS16;\n		din1 : in BUS16;";
		$return_text = "$return_text\n		dout : out BUS16 );\nend component;\n";
	}
	if ($tmp_div == 1) {
		$return_text = "$return_text\ncomponent cm_div\n	port(	din0 : in BUS16;\n		din1 : in BUS16;";
		$return_text = "$return_text\n		dout : out BUS16 );\nend component;\n";
	}
	if ($tmp_mux == 1) {
		$return_text = "$return_text\ncomponent mux\n	port(	din0 : in BUS16;\n		din1 : in BUS16;";
		$return_text = "$return_text\n		dout : out BUS16;\n		a : in std_logic );\nend component;\n";
	}
	#signal
	$return_text = "$return_text\nsignal  ";
	my $tmp3 = $#cf_line_in;
	my $tmp_last = $#cf_line_in;
	foreach (0 .. $#cf_line_in) {
		my $tmp2 = $cf_line_in[$tmp3];
		if ($cf_node_type[$tmp2] != 1) {
			$tmp_last = $tmp3;
			last;
		}
		$tmp3--;
	}
	my @tmp_list2 = ();
	foreach(0 .. $#cf_line_in){
		my $tmp = $cf_line_array_num[$_];
		my $tmp_flag = 1;
		my $tmp3 = $cf_line_in[$_];
		if ($cf_node_type[$tmp3] == 1 ) {
			$tmp_flag = 0;
		}
		foreach(0 .. $#tmp_list2){
			if ($tmp_list2[$_] == $tmp) {
				$tmp_flag = 0;
			}
		}
		if ($tmp_flag == 1) {
			push @tmp_list2,$tmp;
		}
	}
	foreach(0 .. $#tmp_list2){
		if ($_ != $#tmp_list2) {
			$return_text = "$return_text line$tmp_list2[$_],";
		}else{
			$return_text = "$return_text line$tmp_list2[$_] : BUS16;\nbegin\n";
		}
	}

	foreach (0 .. $#cf_node_number) {
		if ($cf_node_type[$_] == 3) {
			my $tmp = $_;
			my $lin = "";
			my $rin = "";
			my $out = "";
			my $load = "reg$_";
			foreach (0 .. $#cf_line_in){
				if ($cf_line_in[$_] == $tmp) {
					#$out = "line$_";
					$out = "line$cf_line_array_num[$_]";
				}
				if ($cf_line_out[$_] == $tmp) {
					my $tmp2 = $cf_line_in[$_];
					if ($cf_node_type[$tmp2] == 1) {
						$in = "inport$tmp2";
					}else{
						#$in = "line$_";
						$in = "line$cf_line_array_num[$_]";
					}
				}
			}
			$return_text = "$return_text\npm_reg$tmp : reg	port map( $in, $out, $load, clk );";

		}elsif ($cf_node_type[$_] == 4 || $cf_node_type[$_] == 5 || $cf_node_type[$_] == 6 || $cf_node_type[$_] == 7) {
			my $tmp = $_;
			my $in = "";
			my $out = "";
			foreach (0 .. $#cf_line_in){
				if ($cf_line_in[$_] == $tmp) {
					#$out = "line$_";
					$out = "line$cf_line_array_num[$_]";
				}
				if ($cf_line_out[$_] == $tmp) {
					my $tmp2 = $cf_line_in[$_];
					if ($cf_line_port[$_] == 1) {
						if ($cf_node_type[$tmp2] == 1) {
							$lin = "inport$tmp2";
						}else{
							#$lin = "line$_";
							$lin = "line$cf_line_array_num[$_]";
						}
					}elsif ($cf_line_port[$_] == 2) {
						if ($cf_node_type[$tmp2] == 1) {
							$rin = "inport$tmp2";
						}else{
							#$rin = "line$_";
							$rin = "line$cf_line_array_num[$_]";
						}
					}
				}
			}
			if ($cf_node_type[$_] == 4){
				$return_text = "$return_text\npm_add$tmp : cm_add	port map( $lin, $rin, $out);";
			}elsif ($cf_node_type[$_] == 5){
				$return_text = "$return_text\npm_sub$tmp : cm_sub	port map( $lin, $rin, $out);";
			}elsif ($cf_node_type[$_] == 6){
				$return_text = "$return_text\npm_mult$tmp : cm_mult	port map( $lin, $rin, $out);";
			}elsif ($cf_node_type[$_] == 7){
				$return_text = "$return_text\npm_div$tmp : cm_div	port map( $lin, $rin, $out);";
			}

		}elsif ($cf_node_type[$_] == 8) {
			my $tmp = $_;
			my $lin = "";
			my $rin = "";
			my $out = "";
			my $load = "mux$_";
			#接続線ループ
			foreach (0 .. $#cf_line_in){
				#ターゲットノードの出力先を見つける
				if ($cf_line_in[$_] == $tmp) {
					$out = "line$cf_line_array_num[$_]";
					#$out = "line$_";
				}
				#ターゲットノードの入力元を見つける
				if ($cf_line_out[$_] == $tmp) {
					#入力元のノードを記憶
					my $tmp2 = $cf_line_in[$_];

					if ($cf_line_port[$_] == 1) {
						if ($cf_node_type[$tmp2] == 1) {
							$lin = "inport$tmp2";
						}else{
							$lin = "line$cf_line_array_num[$_]";
							#$lin = "line$_";
						}
					}elsif ($cf_line_port[$_] == 2) {
						if ($cf_node_type[$tmp2] == 1) {
							$rin = "inport$tmp2";
						}else{
							$rin = "line$cf_line_array_num[$_]";
							#$rin = "line$_";
						}
					}
				}
			}
			$return_text = "$return_text\npm_mux$tmp : mux	port map( $lin, $rin, $out, $load);";
		}
	}
	#$output
	foreach (0 .. $#cf_node_type) {
		if ($cf_node_type[$_] == 2) {
			my $tmp10 = $_;
			my $tmp_line = -1;
			foreach(0 .. $#cf_line_out){
				if ($cf_line_out[$_] == $tmp10) {
					$tmp_line = $cf_line_array_num[$_];
				}
			}
			$return_text = "$return_text\noutport$_ <= line$tmp_line;";
		}
	}
	$return_text = "$return_text\nend;\n";
	#print ("$return_text");
	return $return_text;
}
sub create_datapath_other {
	my $return_text = "";
	my $tmp_text = "";
	my $tmp_add = 0;
	my $tmp_sub = 0;
	my $tmp_mul = 0;
	my $tmp_div = 0;
	my $tmp_reg = 0;
	my $tmp_mux = 0;

	foreach (0 .. $#cf_node_number) {
		if ($cf_node_type[$_] == 3) {
			$tmp_reg = 1;
		}elsif ($cf_node_type[$_] == 4) {
			$tmp_add = 1;
		}elsif ($cf_node_type[$_] == 5) {
			$tmp_sub = 1;
		}elsif ($cf_node_type[$_] == 6) {
			$tmp_mul = 1;
		}elsif ($cf_node_type[$_] == 7) {
			$tmp_div = 1;
		}elsif ($cf_node_type[$_] == 8) {
			$tmp_mux = 1;
		}
	}

	if ($tmp_reg == 1) {
		$tmp_text = &reg_vhdl;
		$return_text = "$return_text\n$tmp_text";
	}
	if ($tmp_add == 1) {
		$tmp_text = &add_vhdl;
		$return_text = "$return_text\n$tmp_text";
	}
	if ($tmp_sub == 1) {
		$tmp_text = &sub_vhdl;
		$return_text = "$return_text\n$tmp_text";
	}
	if ($tmp_mul == 1) {
		$tmp_text = &mult_vhdl;
		$return_text = "$return_text\n$tmp_text";
	}
	if ($tmp_div == 1) {
		$tmp_text = &div_vhdl;
		$return_text = "$return_text\n$tmp_text";
	}
	if ($tmp_mux == 1) {
		$tmp_text = &mux_vhdl;
		$return_text = "$return_text\n$tmp_text";
	}
	return $return_text;
}
sub mux_vhdl {
	my $return_text = &ieee_vhdl;
	$return_text = "$return_text\nentity mux is";
	$return_text = "$return_text\n	port(	din0	: in BUS16;";
	$return_text = "$return_text\n		din1	: in BUS16;";
	$return_text = "$return_text\n		dout	: out BUS16;";
	$return_text = "$return_text\n		a	: in std_logic);";
	$return_text = "$return_text\nend mux;\n";
	$return_text = "$return_text\narchitecture module of mux is";
	$return_text = "$return_text\nbegin";
	$return_text = "$return_text\n	dout <= din0 when a = '0' else";
	$return_text = "$return_text\n		din1;";
	$return_text = "$return_text\nend module;\n";
	return $return_text;
}
sub reg_vhdl {
	my $return_text = &ieee_vhdl;
	$return_text = "$return_text\nentity reg is";
	$return_text = "$return_text\n	port(	din	: in BUS16;";
	$return_text = "$return_text\n		dout	: out BUS16;";
	$return_text = "$return_text\n		load	: in std_logic;";
	$return_text = "$return_text\n		clk	: in std_logic);";
	$return_text = "$return_text\nend;\n";
	$return_text = "$return_text\narchitecture module of reg is";
	$return_text = "$return_text\nbegin\n	process\n	begin";
	$return_text = "$return_text\n		wait until clk'event and clk = '1';";
	$return_text = "$return_text\n		if load = '1' then";
	$return_text = "$return_text\n			dout <= din;";
	$return_text = "$return_text\n		end if;";
	$return_text = "$return_text\n	end process;";
	$return_text = "$return_text\nend module;";
	return $return_text;
}
sub add_vhdl {
	my $return_text = &ieee_vhdl;
	$return_text = "$return_text\nentity cm_add is";
	$return_text = "$return_text\n	port(	din0	: in BUS16;";
	$return_text = "$return_text\n		din1	: in BUS16;";
	$return_text = "$return_text\n		dout	: out BUS16);";
	$return_text = "$return_text\nend;\n";
	$return_text = "$return_text\narchitecture module of cm_add is";
	$return_text = "$return_text\nbegin";
	$return_text = "$return_text\n	dout <= din0 + din1;";
	$return_text = "$return_text\nend module;\n";
	return $return_text;
}
sub sub_vhdl {
	my $return_text = &ieee_vhdl;
	$return_text = "$return_text\nentity cm_sub is";
	$return_text = "$return_text\n	port(	din0	: in BUS16;";
	$return_text = "$return_text\n		din1	: in BUS16;";
	$return_text = "$return_text\n		dout	: out BUS16);";
	$return_text = "$return_text\nend;\n";
	$return_text = "$return_text\narchitecture module of cm_sub is";
	$return_text = "$return_text\nbegin";
	$return_text = "$return_text\n	dout <= din0 - din1;";
	$return_text = "$return_text\nend module;\n";
	return $return_text;
}
sub mult_vhdl {
	my $return_text = &ieee_vhdl;
	$return_text = "$return_text\nentity cm_mult is";
	$return_text = "$return_text\n	port(	din0	: in BUS16;";
	$return_text = "$return_text\n		din1	: in BUS16;";
	$return_text = "$return_text\n		dout	: out BUS16);";
	$return_text = "$return_text\nend;\n";
	$return_text = "$return_text\narchitecture module of cm_mult is\n	signal tmp : signed(31 downto 0);";
	$return_text = "$return_text\nbegin";
	$return_text = "$return_text\n	tmp <= din0 * din1;";
	$return_text = "$return_text\n	dout <= tmp(15 downto 0);";
	$return_text = "$return_text\nend module;\n";
	return $return_text;
}
sub div_vhdl {
	my $return_text = &ieee_vhdl;
	$return_text = "$return_text\nentity cm_div is";
	$return_text = "$return_text\n	port(	din0	: in BUS16;";
	$return_text = "$return_text\n		din1	: in BUS16;";
	$return_text = "$return_text\n		dout	: out BUS16);";
	$return_text = "$return_text\nend;\n";
	$return_text = "$return_text\narchitecture module of cm_div is\n	signal tmp : signed(31 downto 0);";
	$return_text = "$return_text\nbegin";
	$return_text = "$return_text\n	tmp <= din0 / din1;";
	$return_text = "$return_text\n	dout <= tmp(15 downto 0);";
	$return_text = "$return_text\nend module;\n";
	return $return_text;
}

#create_controller
sub create_controller {
	my $return_text = "";
	my $tmp_text = "";
	$tmp_text = &create_controller_port;
	$return_text = $tmp_text;
	$tmp_text = &architecture_rtl_of_controller;
	$return_text = "$return_text$tmp_text";
	return $return_text;
}
sub create_controller_port {
	my $return_text = "";
	my $tmp_text = "";
	$tmp_text = &ieee_vhdl;
	$return_text = "$return_text\n$tmp_text\nentity controller is\n	port(\n		clk		: in std_logic;\n		rst		: in std_logic;";
	foreach (0 .. $#cf_node_type) {
		if ($cf_node_type[$_] == 3) {
			$return_text = "$return_text\n		reg$_		: out std_logic;";
		}elsif ($cf_node_type[$_] == 8) {
			$return_text = "$return_text\n		mux$_		: out std_logic;";
		}
	}
	$return_text = "$return_text\n	);\nend controller;\n";
	return $return_text;
}
sub architecture_rtl_of_controller {
	my $tmp_text = "\narchitecture rtl of controller is\n	type state_type is (";
	my $tmp = -1;
	foreach (0 .. $#vertex_id) {
		if ($tmp < $lifetime[$_]){
			$tmp = $lifetime[$_];
		}
	}
	$tmp--;
	$tmp--;
	foreach (0 .. $tmp) {
		$tmp_text = "$tmp_text s$_,";
	}
	$tmp++;
	$tmp_text = "$tmp_text s$tmp);\n	signal ps, ns	: state_type;\nbegin\n	combinational: process(ps, rst)\n	begin\n";
	$tmp_text = "$tmp_text		if rst = '1' then\n			ns <= s0;";
	foreach (0 .. $#cf_node_type) {
		if ($cf_node_type[$_] == 3) {
			$tmp_text = "$tmp_text\n			reg$_ <= \'0\';";
		}elsif ($cf_node_type[$_] == 8) {
			$tmp_text = "$tmp_text\n			mux$_ <= \'0\';";
		}
	}
	$tmp_text = "$tmp_text\n		else \n			case ps is";
	foreach (0 .. $tmp) {
		my $tmp2 = $_ + 1;
		if ($_ != $tmp) {
			$tmp_text = "$tmp_text\n			when s$_ =>\n				ns <= s$tmp2;";
			my $r_tex = "";
			$r_tex = &getpath_rtl_of_controller($_);
			$tmp_text = "$tmp_text$r_tex\n";
		}else{
			$tmp_text = "$tmp_text\n			when s$_ =>\n				ns <= s0;";
			my $r_tex = "";
			$r_tex = &getpath_rtl_of_controller($_);
			$tmp_text = "$tmp_text$r_tex\n";
		}
	}

	$tmp_text = "$tmp_text\n			end case;\n		end if;\n	end process;\n";
	$tmp_text = "$tmp_text\n	synchronous: process\n	begin\n		wait until clk'event and clk = '1';\n		ps <= ns;\n	end process;\nend rtl;\n";

	$tmp_text = "$tmp_text\n";
	return $tmp_text;
}
sub getpath_rtl_of_controller {
	my $target_lifetime = $_[0];
	my $r_tex = "";
	my @tmp_ioin = ();
	foreach (0 .. $#cf_node_type) {
		#ここを 0 -1 で変えることでデバッグしてる。。
		if ($cf_node_type[$_] == 3) {
			push @tmp_ioin,0;
		}elsif ($cf_node_type[$_] == 8) {
			push @tmp_ioin,0;
		}
	}
	$target_lifetime++;
	my @target_cul_node = ();
	foreach (0 .. $#lifetime) {
		if ($target_lifetime == $lifetime[$_]) {
			push @target_cul_node,$_;
		}
	}
	print ("$target_lifetime\n");
	foreach (0 .. $#target_cul_node) {
		my $target_cul_input_reght_reg = -1;
		my $target_cul_input_left_reg = -1;
		my $target_cul_out_reg = -1;
		my $tmp = $target_cul_node[$_];
		foreach ( 0 .. $#edge_id){
			if ($edge_ver2[$_] == $tmp && $target_cul_input_left_reg == -1){
				$target_cul_input_left_reg = $edge_convert_after_id[$_];
				print ("target_cul_input_left_reg	$target_cul_input_left_reg\n");
			}elsif ($edge_ver2[$_] == $tmp && $target_cul_input_reght_reg == -1){
				$target_cul_input_reght_reg = $edge_convert_after_id[$_];
				print ("target_cul_input_reght_reg	$target_cul_input_reght_reg\n");
			}elsif ($edge_ver1[$_] == $tmp){
				$target_cul_out_reg = $edge_convert_after_id[$_];
				print ("target_cul_out_reg	$target_cul_out_reg\n");
			}
		}
		my $tmp3 = $vertex_convert_after_id[$tmp];
		foreach (0 .. 2) {
			my $st = 0;
			my $en = 0;
			if ($_ == 0) {
				$st = $target_cul_input_left_reg;
				$en = $tmp3;
			}elsif ($_ == 1){
				$st = $target_cul_input_reght_reg;
				$en = $tmp3;
			}elsif ($_ == 2){
				$st = $tmp3;
				$en = $target_cul_out_reg;
			}
			if ($st != -1 && $en != -1) {
				&route_search($st,$en);
				foreach (0 .. $#tmp_route_search) {
					my $tmp2 = $tmp_route_search[$_];
					#print ("$cf_line_in[$tmp2]	$cf_line_out[$tmp2]	$cf_line_port[$tmp2]\n");
					my $tmp3 = $cf_line_out[$tmp2];
					my $tmp_flag = 0;
					if ($cf_node_type[$tmp3] == 3) {
						$tmp_flag = 1;
					}elsif($cf_node_type[$tmp3] == 8) {
						if ($cf_line_port[$tmp2] == 2) {
							$tmp_flag = 1;
						}
					}
					my $tmp_count = 0;
					foreach (0 .. $#cf_node_type) {
						if ($_ == $tmp3) {
							$tmp_ioin[$tmp_count] = $tmp_flag;
							print ("制御必要	$tmp_count\n");
							last;
						}
						if ($cf_node_type[$_] == 3) {
							$tmp_count++;
						}elsif ($cf_node_type[$_] == 8) {
							$tmp_count++;
						}
					}
				}
			}
		}
	}

	my $tmp_count = 0;
	foreach (0 .. $#cf_node_type) {
		if ($cf_node_type[$_] == 3) {
			print("reg$_ <= $tmp_ioin[$tmp_count]\n");
			$r_tex = "$r_tex\n				reg$_ <= \'$tmp_ioin[$tmp_count]\';";
			$tmp_count++;
		}elsif ($cf_node_type[$_] == 8) {
			print("mux$_ <= $tmp_ioin[$tmp_count]\n");
			$r_tex = "$r_tex\n				mux$_ <= \'$tmp_ioin[$tmp_count]\';";
			$tmp_count++;
		}
	}
	return $r_tex;
}
sub route_search {
	@tmp_route_search = ();
	my $start = $_[0];
	my $goal = $_[1];
	my @serch2 = ();
	my @level = ();
	my $tmp_levelcheck = 0;
	print("経路検索	$start => $goal\n");
	foreach (0 .. $#cf_line_in) {
		push @level,-1;
		push @serch2,-1;
	}

	foreach (0 .. $#cf_line_in) {
		if ($cf_line_in[$_] == $start) {
			$serch2[$_] = 1;
			$level[$_] = 1;
		}
	}
	my $tmp_flag = 0;
	my $tmp_loop = 0;
	#start から goal までに
	foreach (2 .. 500) {
		$tmp_flag = 0;
		#ターゲットにする深度
		my $tmp_phase = $_;
		foreach (0 .. $#cf_line_in) {
			#該当する深度とおなじものを見つける
			if ($level[$_] == $tmp_phase - 1) {
				#そのout側の要素を取得
				my $tmp4 = $cf_line_out[$_];
				#out側を入力とする要素の取得
				foreach (0 .. $#cf_line_in) {
					#print("LOOOP			$_\n");
					if ($cf_line_in[$_] == $tmp4) {
						$serch2[$_] = 1;
						$level[$_] = $tmp_phase;
						$tmp_flag = 1;
						if ($cf_line_out[$_] == $goal){
							$serch2[$_] = 1;
							$level[$_] = $tmp_phase;
							$tmp_flag = 3;
							$tmp_levelcheck = $tmp_phase;
							last;
						}
					}
				}
				if($tmp_flag == 3){
					last;
				}
			}
		}
		if ($tmp_flag == 0 || $tmp_flag == 3) {
			$tmp_loop = $tmp_phase;
			last;
		}
	}
	foreach (0 .. $#cf_line_in) {
		#print ("	[LEVEL] $_	$level[$_]	$serch2[$_]	I:0	$cf_line_in[$_]	$cf_line_out[$_]\n");
	}

	#余剰分削除 ゴールと同じレベルの奴を消し去る
	foreach (0 .. $#cf_line_in) {
		if ($level[$_] == $tmp_loop) {
			if ($cf_line_out[$_] != $goal){
				$serch2[$_] = -1;
				$level[$_] = -1;
			}else{
				$tma_s_node = $cf_line_out[$_];
			}
		}
	}
	#foreach (0 .. $#cf_line_in) {
	#	if ($cf_line_out[$_] == $goal) {
	#		$tma_s_node = $cf_line_out[$_];
	#		last
	#	}
	#}
	my $flag_finish = 0;
	my $tmp_next = -1;
	foreach (0 .. 500) {
		foreach (0 .. $#cf_line_in) {
			if ($tma_s_node == $cf_line_out[$_] && $level[$_] == $tmp_levelcheck) {
				$tmp_next = $cf_line_in[$_];
			}elsif ($tma_s_node != $cf_line_out[$_] && $level[$_] == $tmp_levelcheck) {
				$level[$_] = -1;
				$serch2[$_] = -1;
			}
		}
		$tma_s_node = $tmp_next;
		if ($tmp_next == -1) {
			last;
		}
		$tmp_levelcheck--;
		$tmp_next = -1;
	}

	foreach (0 .. $#cf_line_in) {
		#print ("[LEVEL] $_	$level[$_]	$serch2[$_]	I:0	$cf_line_in[$_]	$cf_line_out[$_]\n");
	}
	$tmp_loop--;
	foreach (1 .. $tmp_loop) {
		my $tmp6 = $_;
		foreach (0 .. $#cf_line_in) {
			if ($tmp6 == $serch2[$_]){
				push @tmp_route_search , $_;
				print ("$_\n");
			}
		}
	}
}

#create_circuit
sub create_circuit {
	my $return_text = "";
	my $tmp_text = "";

	$return_text = &create_circuit_port;
	$tmp_text = "$return_text$tmp_text";

	$return_text = &create_circuit_architecture;
	$tmp_text = "$tmp_text$return_text";

	return $tmp_text;
}
sub create_circuit_port {
	my $return_text = "";
	my $tmp_text = "";
	$tmp_text = &ieee_vhdl;
	$tmp_text = "$tmp_text\nentity circuit is\n	port(\n		clk		: in std_logic;\n		rst		: in std_logic;";
	foreach (0 .. $#cf_node_type) {
		if ($cf_node_type[$_] == 1){
			$tmp_text = "$tmp_text\n		inport$_		: in BUS16;";
		}elsif ($cf_node_type[$_] == 2) {
			$tmp_text = "$tmp_text\n		outport$_		: out BUS16;";
		}
	}
	$tmp_text = "$tmp_text\n	);\nend;\n";
	return $tmp_text;
}
sub create_circuit_architecture {
	my $return_text = "";
	my $tmp_text = "";
	$return_text = "\narchitecture struct of circuit is\n	component datapath\n		port(";
	foreach (0 .. $#cf_node_type) {
		if($cf_node_type[$_] == 1){
			$return_text = "$return_text\n		inport$_		: in BUS16;";
		}
	}
	foreach (0 .. $#cf_node_type) {
		if ($cf_node_type[$_] == 3){
			$return_text = "$return_text\n		reg$_		: in std_logic;";
		}
	}
	foreach (0 .. $#cf_node_type) {
		if ($cf_node_type[$_] == 8){
			$return_text = "$return_text\n		mux$_		: in std_logic;";
		}
	}
	$return_text = "$return_text\n		clk		: in std_logic;";
	foreach (0 .. $#cf_node_type) {
		if ($cf_node_type[$_] == 2){
			$return_text = "$return_text\n		outport$_		: out BUS16;";
		}
	}
	$return_text = "$return_text\n		);\n	end component;\n";

	$return_text = "$return_text\n	component controller\n		port(\n		clk		: in std_logic;\n		rst		: in std_logic;";
	foreach (0 .. $#cf_node_type) {
		if ($cf_node_type[$_] == 3) {
			$return_text = "$return_text\n		reg$_		: out std_logic;";
		}elsif ($cf_node_type[$_] == 8) {
			$return_text = "$return_text\n		mux$_		: out std_logic;";
		}
	}

	$return_text = "$return_text\n		);\n	end component;\n";

	#load signal
	foreach (0 .. $#cf_node_type) {
		if ($cf_node_type[$_] == 3) {
			$return_text = "$return_text\n	signal reg$_		: std_logic;";
		}
	}
	#mul
	foreach (0 .. $#cf_node_type) {
		if ($cf_node_type[$_] == 8) {
			$return_text = "$return_text\n	signal mux$_		: std_logic;";
		}
	}
	$return_text = "$return_text\nbegin\n	datapath1 : datapath\n		port map(\n";
	foreach (0 .. $#cf_node_type) {
		if($cf_node_type[$_] == 1){
			$return_text = "$return_text			inport$_,\n";
		}
	}
	foreach (0 .. $#cf_node_type) {
		if($cf_node_type[$_] == 8){
			$return_text = "$return_text			mux$_,\n";
		}
	}
	foreach (0 .. $#cf_node_type) {
		if($cf_node_type[$_] == 3){
			$return_text = "$return_text			reg$_,\n";
		}
	}
	$return_text = "$return_text			clk,\n";
	my $tmp_out_last = -1;
	foreach (0 .. $#cf_node_type) {
		if($cf_node_type[$_] == 2){
			$tmp_out_last = $_;
		}
	}
	foreach (0 .. $#cf_node_type) {
		if($cf_node_type[$_] == 2){
			if ($_ == $tmp_out_last){
				$return_text = "$return_text			outport$_\n		);\n";
			}else{
				$return_text = "$return_text			outport$_,\n";
			}
		}
	}

	$return_text = "$return_text	controller1 : controller\n		port map(\n			clk,\n			rst,\n";
	foreach (0 .. $#cf_node_type) {
		if($cf_node_type[$_] == 3){
			$return_text = "$return_text			reg$_,\n";
		}
	}
	my $tmp_mux_maxs;
	foreach (0 .. $#cf_node_type) {
		if($cf_node_type[$_] == 8){
			$tmp_mux_maxs = $_;
		}
	}
	foreach (0 .. $#cf_node_type) {
		if($cf_node_type[$_] == 8){
			if ($tmp_mux_maxs == $_) {
				$return_text = "$return_text			mux$_\n		);\nend struct;\n";
			}else{
				$return_text = "$return_text			mux$_,\n";
			}
		}
	}
	return $return_text
}

#debug
sub debug_input {
	if ($Config_Debug_input == 1) {
		print ("\n---------------[Debug]---------------\n");
		print ("[Debug]Input Sdfd (Vertex)\n");
		foreach (0 .. $#vertex_id){
			print("$vertex_id[$_]	$vertex_type[$_]	$lifetime[$_]\n");
		}
		print ("\n[Debug]Input Sdfd (Edge)\n");
		foreach (0 .. $#edge_id){
			print("$edge_id[$_]	$edge_ver1[$_]	$edge_ver2[$_]	$edge_port[$_]\n");
		}
		print ("\n[Debug]Input Binding (Register)\n");
		foreach (0 .. $#register_number){
			print("$register_number[$_]	$register_binding[$_]\n");
		}
		print ("\n[Debug]Input Binding (Operation)\n");
		foreach (0 .. $#operation_number){
			print("$operation_type[$_]	$operation_number[$_]	$operation_binding[$_]\n");
		}
		print"\n[Log]debug_input=>Successful.\n";
	}
}
sub debug_cadformat {

		my $mult_count = 0;
		my $resister_count = 0;

		##my $outputfile = $sdfg_input;
		##$outputfile =~ s/\.sdfg/\.cf/;
		my $file = $cadformat_output;
		open my $fh, '>', $file;

		print ("\n---------------[Debug]---------------\n");
		print ("[Debug]CF_Node\n");
		print $fh "--cadformat-node\n";
		foreach (0 .. $#cf_node_number){
			if ($cf_node_type [$_] == 8){
				$mult_count++;
			}
			if ($cf_node_type[$_] == 3){
				$resister_count++;
			}
			print $fh "$cf_node_number[$_]	$cf_node_type[$_]\n";
			print("$cf_node_number[$_]	$cf_node_type[$_]\n");
		}
		print ("\n[Debug]CF_Line\n");
		print $fh "--cadformat-line\n";
		foreach (0 .. $#cf_line_in){
			print $fh "$cf_line_in[$_]	$cf_line_out[$_]	$cf_line_port[$_]	$cf_line_array_num[$_]\n";
			print("$cf_line_in[$_]	$cf_line_out[$_]	$cf_line_port[$_]	$cf_line_array_num[$_]\n");
		}
		close $fh;

		my $outputfile2 = $sdfg_input;
		$outputfile2 =~ s/\.sdfg/\.report/;
		my $file2 = $outputfile2;
		open my $fh2, '>', $file2;
		print $fh2 "マルチプレクサ		$mult_count\n";
		print $fh2 "レジスタ		$resister_count\n";
		close $fh2;
}
