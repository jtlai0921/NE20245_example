<?php
#=====================================================================
#  SYSTEM      :  AjaSQL Gatewey for SQLS (MySQL,SQLite,,, )
#  PROGRAM     :  JavaScriptとSQLサーバーの仲介をします
#  FILE NAME   :  ajasql_gw.php
#  CALL FROM   :  Ajax クライアント
#  AUTHER      :  Toshirou Takahashi http://jsgt.org/mt/01/
#  SUPPORT URL :  http://jsgt.org/mt/archives/01/cat_ajasql.html
#  CREATE      :  2005.6.26
#  UPDATE      :  MySQLは現在とりあえず中断中、先にSQLiteを作業中です
#  UPDATE      :  2005.12.8 デフォルトで出力の<を&lt;
#  UPDATE      :  2005.10.8 error_reporting、magic_quotes_gpcを無効
#  UPDATE      :  2005.9.4 allowIP allow_DB_TABLE error_reporting
#  UPDATE      :  2005.7.4 ヘッダをJSON形式にする(ボディは無理)
#  UPDATE      :  2005.7.4 mysql_mysql_escape_string,sqlite_escape_string
#  UPDATE      :  2005.7.2 専用関数
#
#
# このソースは改変も商用利用も自由ですが、
# その自由を護るために著作権は放棄しません。
#---------------------------------------------------------------------
# 高橋登史朗 (Toshirou Takahashi http://jsgt.org/mt/01/) 2005.1.24


#=====================================================================
# 使用例
#
	// http://jsgt.org/ajasql/doc/samples/

#=====================================================================
# エラー出力を抑制
#  

//error_reporting(0);
error_reporting(E_ALL ^ E_NOTICE);


#=====================================================================
# アクセス権限を持たせるDBとテーブルを限定する
#    ./.ad/.allow_db_table

/* ///////////TEST中/////////// */

function allow_DB_TABLE($asql_useSQL,$asql_dbName,$asql_tableName){

	$targetData = "$asql_useSQL:$asql_dbName:$asql_tableName";
	$allow_db_table = './.ad/.allow_db_table' ;
	allow($allow_db_table,$targetData);

}

#=====================================================================
# アクセス権限を持たせるIPを許可/限定する
#    ./.ad/.allow_ipというドットファイルをパーミッション0604、所有者を
#    Webユーザー(nobodyやapacheなど)以外で作り、中に 許可したいIPを
#    半角空白や改行などで区切って羅列します。
#    「.allow_ip」という名前のファイルが無ければ何もしません。
#    IPを一つでも設定すれば、指定した以外のIPからはアクセスできません。
#

/* ///////////TEST中/////////// */

function allowIP(){

	$allow_ip = './.ad/.allow_ip' ;
	$remoteAddr = getenv("REMOTE_ADDR");
	allow($allow_ip,$remoteAddr);
}

	//////
	// アクセス許可処理
	//
	// @param $allow_file アクセス許可リストファイル名
	// @param $targetData アクセス者のデータ(IP、DB、TABLEなど)
	//

	// 192.168.1.2*などがマッチしてしまうので要修正

	function allow($allow_file,$targetData){

		//.allow_fileがあれば処理 なければ通過
		if(file_exists($allow_file)) {

			//read allow_file
			$allow_lists = file_get_contents($allow_file);

			//echo ("<br>".$allow_lists."[]".$targetData);

			//存在しなければfalse
			$is= strpos($allow_lists,$targetData);

			if($is===false){

				//存在しなければ終了
				echoToBrowser('error: not allow your <b>'.$targetData.'</b>');
				exit();
				
			} else {

				//存在すれば通過
				//echo ("<br>".$targetData.":あり");
			}
		}
	}

#=====================================================================
# DBユーザー名とパスワード(MySQL用)
#
#  JavaScript側に埋め込むと、ネットワーク経由で危険なため、とりあえず
#  ここに書いてありますが、できれば、もっと安全な方法をご検討ください。
#  もっとも、selectなどREADな作業だけにパーミッションが限定されていれば、
#  心配は少ないかもしれません。
#  SQLiteならnullでも'hoge'でもかまいません。使わないので、、、。
#
	// 利用するMySQLDBのユーザー名
	function asql_userName(){ return    'ajasqluser' ;  }
	// パスワード
	function asql_pswd(){     return    'ajasql' ;  }
	
	
	// Webディレクトリ以外のディレクトリから読み込む場合
	//
	//include_once('/outOfWebDir/yourDBpassword.php') ;
	
	

#=====================================================================
# ブラウザチェック
#
# 'MSIE 6' # MSIE6    
# 'Opera'  # Opera    
# 'Gecko'  # Mozilla(N6,N7,F1...)
# 'Safari' # Safari
# @sample isBrowser('Safari')
# @return true | false

function isBrowser($browserName)
{
	$UsrAgent = $_SERVER['HTTP_USER_AGENT'] ;
	return ereg($browserName,$UsrAgent)   ;
}

	

#=====================================================================
# GET,POST取得
#
	//////
	// magic_quotes_gpcを実行時に無効
	// GETまたはPOSTされた値を取得
	//
	// @param $var URLクエリの変数名
	// @return     引数に対する値
	//
	
	if (get_magic_quotes_gpc()) {
		function stripslashes_deep($value)
		{
			$value = is_array($value) ?
					array_map('stripslashes_deep', $value) :
					stripslashes($value);

		return $value;
		}

		$_POST = array_map('stripslashes_deep', $_POST);
		$_GET = array_map('stripslashes_deep', $_GET);
		$_COOKIE = array_map('stripslashes_deep', $_COOKIE);
	}
	
	function getGETPOST( $var )
	{
		if($_POST[$var]!=''){
			return $_POST[$var] ;
		} else {
			return $_GET[$var] ;
		}
	}
	

	
#=====================================================================
# 起動
#=====================================================================
#
main();

function main()
{

	allowIP();

	//AjaSQL初期設定を取得
	$asql_useSQL  = getGETPOST('us') ;

	//AjaSQL初期設定を取得
	$asql_dbName  = getGETPOST('dn') ;
	$asql_tableName = getGETPOST('tn') ;
		
	//SQL文を取得
	$asql_sqlStr = getGETPOST('q') ;

	//php.ini内でmagic_quotes_gpc設定「On」の場合
	if(get_magic_quotes_gpc()){
		$asql_useSQL = stripslashes($asql_useSQL);
		$asql_dbName = stripslashes($asql_dbName);
		$asql_tableName = stripslashes($asql_tableName);
	}

	allow_DB_TABLE($asql_useSQL,$asql_dbName,$asql_tableName);


	$query_res =  asql_doQuery($asql_dbName ,$asql_tableName ,$asql_sqlStr);

	//	echoToBrowser("\n\n -1-asql_sqlStr--\n".$asql_sqlStr."\n\n -2-asql_sqlStr_esc_char--\n".$asql_sqlStr_esc_char."\n\n -3-asql_sqlStr_esc_char_sql--\n".$asql_sqlStr_esc_char_sql."\n\n -4-asql_sqlStr_esc_char_sql_os--\n".$asql_sqlStr_esc_char_sql_os);

	//ブラウザへ出力
	echoToBrowser($query_res);
}

#=====================================================================
# 出力
#

function echoToBrowser($query_res)
{

	$query_res = preg_replace('/</',"&lt;",$query_res);

	#mb_language('ja');
	//charsetをut-8に
	#mb_http_output ( 'UTF-8' );
	
	//プログレスタイマーIDのindex
	$progno = $_GET['prog'];

	if(isBrowser('Safari') || isBrowser('KHTML')){

		#$query_res = mb_convert_encoding ($query_res,'UTF-8',mb_detect_encoding($query_res));
		//URIエンコード
		$query_res = rawurlencode($query_res); 
	}
	
	//ヘッダとボディを「::」で結合。
	$data = "{reqid:'$progno',prog:'ajasql-036',version:'036',see:'<a href=\"http://ajasql.org/\">http://ajasql.org/</a>',error:'',msg:'' }::".$query_res;
	
	header("Cache-Control: no-cache");
	
	//出力 
	echo "".$data ;

	exit;
}

#=====================================================================
# AjaSQL 専用関数用処理
#
#  サーバー側で利用するSQLに関わらず、明示的に使えるAjaSQL専用の関数
#  を用意しました。 
#
#    ( クライアント側のDate()は、まったく信用できませんし、SQL標準の 
#    CURRENT_TIMESTAMP もSQLite2xでは実装されていません。また、MySQL、
#    PGSQL、Oracle等各SQL間でも微妙に書式が違います。そこで、ここでは、
#    サーバー側で利用するSQLにかかわらず#SERVER_DATE#は、YYYY-MM-DD 、
#    #SERVER_NOW#は、YYYY-MM-DD HH24:MI:SSという具合に、置き換えられる
#    よう統一します。 ) 
#

	function asql_function($asql_sqlStr)
	{

		//受信日付
		$CURRENT_DATE = date('Y-m-d',time());
		//受信時刻
		$SERVER_NOW   = date('Y-m-d H:i:s',time());
	
		//////
		// #CURRENT_DATE# サーバー受信日(サーバーベースの今日の日付) 
		//
		// SQL文内の #CURRENT_DATE# を受信日付 YYYY-MM-DD に置換える
		// @sample      2005-06-12
		//
		$asql_sqlStr = preg_replace('/#CURRENT_DATE#/',"$CURRENT_DATE",$asql_sqlStr);
	
		//////
		// #SERVER_DATE# サーバー受信日(サーバーベースの今日の日付) 
		//
		// SQL文内の #SERVER_DATE# を受信日付 YYYY-MM-DD に置換える
		// @sample      2005-06-12
		//
		$asql_sqlStr = preg_replace('/#SERVER_DATE#/',"$CURRENT_DATE",$asql_sqlStr);
		
		//////
		// #SERVER_NOW# サーバー受信日時(サーバーベースの現在日時) 
		//
		// SQL文内の #SERVER_NOW# を受信時刻 YYYY-MM-DD HH24:MI:SS に置換える
		// @sample      2005-06-13 01:35:45
		//
		$asql_sqlStr = preg_replace('/#SERVER_NOW#/',"$SERVER_NOW",$asql_sqlStr);
	
		return $asql_sqlStr ;
	}


#=====================================================================
# SQLクエリ実行
#
	function asql_doQuery($asql_dbName ,$asql_tableName ,$asql_sqlStr)
	{
		//AjaSQL初期設定を取得
		//$asql_dbName  = getGETPOST('dn') ;
		//$asql_tableName = getGETPOST('tn') ;
		
		//SQL文を取得
		//$asql_sqlStr = getGETPOST('q') ;


		if(isBrowser('Safari')){
	
			//受信したデータをUTF-8化
			//$asql_sqlStr = mb_convert_encoding($asql_sqlStr,"UTF-8");
			
			//$asql_sqlStr = rawurldecode($asql_sqlStr);
		}

		//echoToBrowser("\n 000".$asql_sqlStr." ". $asql_dbName);

		//SQL文内でエンコードされた%(likeのワイルドカードなど)をデコード
		$asql_sqlStr = preg_replace('/%25/',"%",$asql_sqlStr);
		$asql_sqlStr = preg_replace('/%26/',"&",$asql_sqlStr);
		$asql_sqlStr = preg_replace('/%3D/',"=",$asql_sqlStr);
		$asql_sqlStr = preg_replace('/%3C/',"<",$asql_sqlStr);
		$asql_sqlStr = preg_replace('/%3E/',">",$asql_sqlStr);

		//echoToBrowser("--\n".$asql_sqlStr."--");
	
		//デバック
		/*	
			$asql_dbName      = 'jsgtmt' ;
			$asql_tableName   = 'jsgtmt' ;
			$asql_sqlStr      = 'show tables;' ;
		*/
		//print( '//// ajasql_gw.php 1//// asql_sqlStr:'.$asql_sqlStr.'--');

		//専用関数セット
		$asql_sqlStr = asql_function($asql_sqlStr);

	
		//結果データ取得
		$asql_res = asql_doQueryWk($asql_dbName ,$asql_tableName ,$asql_sqlStr);

		//デバック
		//print($asql_res.$asql_sqlStr.'--');
		//print( '//// ajasql_gw.php 6//// asql_dbName:'.$asql_dbName.'--');
		//print( '//// ajasql_gw.php 6//// asql_res:'.$asql_res.'--');

		return $asql_res ;
		
	}


#=====================================================================
# その他の関数
#


	//////
	// 結果データ取得
	//
	//		区切りをここで加工すると遅くなるのでいじらずに渡し、JS側で処理を基本とする。
	//		たとえば、改行を;に置き換えるだけでかなり遅くなる
	//		$asql_result = `sqlite -list -separator ","  ajasql1.db "$asql_sqlStr" |  tr '\n' ';' `;
	//		これが一番早い
	//
	// @param $asql_dbName DBファイル名
	// @param $asql_sqlStr SQL文
	//
	function asql_getResult($asql_dbName,$asql_sqlStr)
	{
		//AjaSQL初期設定を取得-->もっと前へ移動
		$asql_useSQL  = getGETPOST('us') ;
		
		//
		//$asql_useSQL = 'mysql';
		//echo( $asql_useSQL.'-----');

		
		//SQL別分岐
		switch($asql_useSQL)
		{
			case "sqlite" : 
				return asql_getResult_sqlite($asql_dbName,$asql_sqlStr) ;break;
			case "mysql" : 
				return asql_getResult_mysql($asql_dbName,$asql_sqlStr) ;break;
			default       : 
				break;
		}
	}


// for SQLite
function asql_getResult_sqlite($asql_dbName,$asql_sqlStr)
{

	//for test
	//$asql_sqlStr = "select * from mydb1 order by id desc limit 5";

		//バッククオート等とりあえずエスケープ、、、
		//SQL演算子が使えなくなるので、まじめにSQLパースしてみるべきか、、、
		// 2005.8.30
		// $asql_sqlStrにescapeshellarg()を適用後の
		//  'SELECT * FROM mydb1 LIMIT 5 ; > file2'
		// でfile2を作れないのを確認のうえ解除＜どうでしょうか？？
	/*
		$asql_dbName = str_replace('>', '%3E', $asql_dbName);
		$asql_sqlStr = str_replace('>', '%3E', $asql_sqlStr);
		$asql_dbName = str_replace('|', '%7C', $asql_dbName);
		$asql_sqlStr = str_replace('|', '%7C', $asql_sqlStr);
		$asql_dbName = str_replace('&', '%26', $asql_dbName);
		$asql_sqlStr = str_replace('&', '%26', $asql_sqlStr);
	*/
		$asql_dbName = str_replace('`', '%60', $asql_dbName);
		$asql_sqlStr = str_replace('`', '%60', $asql_sqlStr);

		//特殊文字除去 複文やOSインジェクション禁止(;以降に何があっても無視)
		$asql_sqlStr_esc_chars = split(";",$asql_sqlStr);
		$asql_sqlStr_esc_char = $asql_sqlStr_esc_chars[0]; 

		//SQLインジェクション用エスケープ 不要かも
		$asql_sqlStr_esc_char_sql = sqlite_escape_string($asql_sqlStr_esc_char);

		//OSインジェクション用エスケープ
		$asql_dbName_esc_os = escapeshellarg($asql_dbName); 
		$asql_dbName_esc_os = escapeshellcmd($asql_dbName_esc_os); 
		$asql_sqlStr_esc_char_sql_os = escapeshellarg($asql_sqlStr_esc_char_sql);
		//$asql_sqlStr_esc_char_sql_os = escapeshellcmd($asql_sqlStr_esc_char_sql_os);

		//echoToBrowser("\n\n -1-asql_sqlStr--\n".$asql_sqlStr."\n\n -2-asql_sqlStr_esc_char--\n".$asql_sqlStr_esc_char."\n\n -3-asql_sqlStr_esc_char_sql--\n".$asql_sqlStr_esc_char_sql."\n\n -4-asql_sqlStr_esc_char_sql_os--\n".$asql_sqlStr_esc_char_sql_os);
		return `sqlite -list -separator "," $asql_dbName_esc_os  $asql_sqlStr_esc_char_sql_os `;

}


	// for MySQL は、一旦中止
	function asql_getResult_mysql($asql_dbName,$asql_sqlStr)
	{
		$asql_userName = asql_userName(); 
		$asql_pswd     = asql_pswd() ;
		
		//エスケープ
		//$asql_sqlStr = mysql_escape_string($asql_sqlStr);
		
		//echo( "$asql_sqlStr"." | mysql -B -u $asql_userName --password=$asql_pswd $asql_dbName ".'-----');
	
		//return `echo "$asql_sqlStr " | mysql -B -u $asql_userName --password=$asql_pswd $asql_dbName  `;
	}

	//////
	// フィールド名取得 for SQLite (MySQLはフィールド名を1行目に出力する設定なので不要です)
	//
	// @param $asql_dbName         DB名
	// @param $asql_tableName      table名
	// @return                     カンマ(,)でつないだフィールド名リスト
	//
	function asql_getFildNames($asql_dbName,$asql_tableName)
	{

		$asql_schema = ` sqlite $asql_dbName ".schema $asql_tableName" | sed "s/create table $asql_tableName(//" |  sed "s/CREATE TABLE $asql_tableName(//" |  sed "s/);//" | tr -d '\n' `;
	
		//フィールド名成形
		$asql_lists=split(",",$asql_schema);
		$asql_listslen = count($asql_lists);
		for( $asql_j = 0 ; $asql_j < $asql_listslen ; $asql_j++ )
		{
			$asql_listswk =  ltrim($asql_lists[$asql_j]);
			$asql_filds   =  split(" ",$asql_listswk);
		$asql_res     .= "".$asql_filds[0]."," ;
		}
		$asql_res =  rtrim($asql_res,",");
		
		return $asql_res;
	}

	//////
	// SQL Syntaxタイプ(select insert等)を取得
	//
	// @param $asql_sqlStr SQL文
	//
	function asql_getSQLType($asql_sqlStr)
	{
		//左空白削除
		$asql_sqlStr   = ltrim($asql_sqlStr);

		//syntaxタイプ取得
		$asql_words  = split(" ",$asql_sqlStr);
		
		//小文字化
		$asql_words_lower = strtolower($asql_words[0]);
		
		return  $asql_words_lower;
	}

	//////
	// SQL文のタイプによる分岐と許可
	//
	// @param $asql_dbName     DBファイル名
	// @param $asql_tableName  table名
	// @param $asql_sqlStr     SQL文
	//
	function asql_doQueryWk($asql_dbName,$asql_tableName,$asql_sqlStr)
	{

		//allow
		//return asql_mkRes_for_select($asql_dbName,$asql_tableName,$asql_sqlStr) ;

		//SQLのSyntxタイプ取得
		$asql_type=asql_getSQLType($asql_sqlStr);
		
		switch($asql_type)
		{
			case "select" : 
				return asql_mkRes_for_select($asql_dbName,$asql_tableName,$asql_sqlStr) ;break;
			case "insert" : 
				return asql_mkRes_for_insert($asql_dbName,$asql_tableName,$asql_sqlStr) ;break;
			case "update" : 
				return asql_mkRes_for_update($asql_dbName,$asql_tableName,$asql_sqlStr) ;break;
			case "show" : 
				return asql_mkRes_for_getResTypes($asql_dbName,$asql_tableName,$asql_sqlStr) ;break;
			case "desc" : 
				return asql_mkRes_for_getResTypes($asql_dbName,$asql_tableName,$asql_sqlStr) ;break;
			default       : 
				return asql_mkRes_for_error($asql_dbName,$asql_tableName,$asql_sqlStr)  ;break;
		}

	}
	
	//////
	// SELECT文用結果作成
	//
	// @param $asql_dbName    DBファイル名
	// @param $asql_tableName table名
	// @param $asql_sqlStr    SQL文
	// @return                フィールド名と結果を\nで連結した文字列
	//
	function asql_mkRes_for_select($asql_dbName,$asql_tableName,$asql_sqlStr)
	{
	
		//フィールド名取得
		$asql_fildnames = asql_getFildNames($asql_dbName,$asql_tableName);
		//結果取得
		$asql_result = asql_getResult($asql_dbName,$asql_sqlStr);
		//フィールド名と結果を\nで連結
		$asql_res  = $asql_fildnames."\n".$asql_result  ;

		return $asql_res ;
	}

	//////
	// MySQL/ SHOW,DESC文等、結果を受け取るだけのタイプ用結果作成
	//
	// @param $asql_dbName    DBファイル名
	// @param $asql_tableName table名
	// @param $asql_sqlStr    SQL文
	// @return                結果
	//
	function asql_mkRes_for_getResTypes($asql_dbName,$asql_tableName,$asql_sqlStr)
	{
		//結果取得
		$asql_result = asql_getResult($asql_dbName,$asql_sqlStr);

		//デバック
		//print($asql_dbName.'--'.$asql_sqlStr.'--');


		//if ok--SQL毎に調整
		return $asql_result;
	}

	//////
	// INSERT文用結果作成
	//
	// @param $asql_dbName    DBファイル名
	// @param $asql_tableName table名
	// @param $asql_sqlStr    SQL文
	// @return                true|false
	//
	function asql_mkRes_for_insert($asql_dbName,$asql_tableName,$asql_sqlStr)
	{

		
		//結果取得
		$asql_result = asql_getResult($asql_dbName,$asql_sqlStr);
 
 //asql_mkRes_for_select($asql_dbName,$asql_tableName,$asql_sqlStr);
		//if ok--SQL毎に調整
		//return "true";
	}

	//////
	// UPDATE文用結果作成
	//
	// @param $asql_dbName    DBファイル名
	// @param $asql_tableName table名
	// @param $asql_sqlStr    SQL文
	// @return                true|false
	//
	function asql_mkRes_for_update($asql_dbName,$asql_tableName,$asql_sqlStr)
	{
		//結果取得
		$asql_result = asql_getResult($asql_dbName,$asql_sqlStr);

		//if ok--SQL毎に調整
		return "true";
	}
	
	//////
	// ERROR用結果作成
	//
	// @param $asql_dbName     DBファイル名
	// @param $asql_tableName  table名
	// @param $asql_sqlStr     SQL文
	//
	function asql_mkRes_for_error($asql_dbName,$asql_tableName,$asql_sqlStr)
	{
		//if ok
		//return "//error";
		echoToBrowser('error: not allow SQLType ');
	}
	
/***
 *
 *
	//デバック
	//print("\n//// ajasql_gw.php1-2 //// asql_useSQL:".$asql_useSQL." asql_dbName:".$asql_dbName." asql_tableName:".$asql_tableName."-- asql_sqlStr:".$asql_sqlStr);
	//print("\n//// ajasql_gw.php1-1 //// _GET['us']:".$_GET['us']."");
	//print("\n//// ajasql_gw.php1-3 //// asql_type:".$asql_type." asql_sqlStr:".$asql_sqlStr."");

 *
 *
**/

?>
