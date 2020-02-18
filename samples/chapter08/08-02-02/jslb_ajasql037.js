//=====================================================================
//  SYSTEM      :  AjaSQL Gatewey for SQLS (MySQL,SQLite,,, )
//  PROGRAM     :  SQLをAjaxライブラリへ仲介します
//  FILE NAME   :  ajasql_ajasqlxxx.js
//  CALL FROM   :  Ajax クライアント
//  AUTHER      :  Toshirou Takahashi http://jsgt.org/mt/01/
//  SUPPORT URL :  http://jsgt.org/mt/archives/01/cat_ajasql.html
//  CREATE      :  2005.6.26
//  UPDATE      :  2005.8.20 かなり変更(^^;
//  UPDATE      :  2005.7.2  リクエストIDをミリ秒からMD5生成し、Ajasqlの
//                 ヘッダに付けて送信。サーバーはそれを結果のヘッダでそ
//                 のまま戻す。クライアントは送信IDと受信IDを比較して処理する。
//
//
// このソースは改変も商用利用も自由ですが、
// その自由を護るために著作権は放棄しません。
//---------------------------------------------------------------------
// 高橋登史朗 (Toshirou Takahashi http://jsgt.org/mt/01/) 2005.1.24

/***
 * [初期設定]自体は、このライブラリ内では設定していません。
 * 各ページ内か、各ページへロードする.js、あるいはサーバーからの動的出力
 * などで別途行ってください。
 *


asql_sendSQLwkのprog_start()で加算生成するreq_idをMD5で作って
SQL個々のリクエストIDとし、サーバー往復中の改竄をチェックする。


 */


	//================================================================
	// 初期設定
	//  
	// @sample  ini[1] = new asql_Conf()
	//          alert(ini[1].useSQL)
	//
	// @object   oj.ini            初期設定オブジェクト
	// @property oj.ini.useSQL     サーバー側で使うSQL名 'mysql'|'sqlite'
	// @property oj.ini.dbName     データベース名
	// @property oj.ini.tblName    テーブル名
	// @event    oj.ini.callback   受信時の起動関数名
	// @property oj.ini.method     HTTPメソッド名 'GET'|'POST'
	// @property oj.ini.url        送信先URL
	// @property oj.ini.ascync     非同期通信 true|false
	// @object   oj.spliter        SQL別の微調整/セパレータオブジェクト
	// @property oj.spliter.rsep   SQLから出力される行間セパレータ(\n)
	// @property oj.spliter.csep   列間セパレータ(,や\t)
	// @property oj.head           レスポンス時にajasql用レスポンスヘッダを収めるオブジェクト
	// @property oj.body           レスポンス時にajasql用レスポンスボディを収めるオブジェクト
	// @property oj.progress       プログレスバーオブジェクト
	// 
	function asql_Conf(ini)
	{

		//初期設定オブジェクト
		this.ini  = ini ;

		this.ini.callback  = eval(ini.callback) ;

		//SQL別の微調整 セパレータ
		this.spliter  = asql_setSeparator(this.ini.useSQL) ;
		
		//ajasql用レスポンスヘッダオブジェクト
		this.head     = {} ;
		//ajasql用レスポンスボディオブジェクト
		this.body     = {} ;
		
				
		//プログレスバーオブジェクト
		this.progress = asql_setProgressBars(ini) ;
		
		//SQL送信
		this.asql_sendSQL = function (sql,option){
			asql_sendSQL(this,sql,option)
		} 
		
		//初期設定をAjax送信
		asql_sendSQLini(this.ini,this.ini.method,this.ini.url,this.ini.async ) ;
	}


	////
	// プログレスバー設定
	//  
	// 
	// @property oj.progress.div   プログレスバーを出力するdivオブジェクト
	// @property oj.progress.div.style スタイルオブジェクト(CSSを利用できます)
	// @property oj.progress.prog_bar  プログレスバーキャラクタ
	// @property oj.progress.prog_interval  プログレスインターバル
	// @property oj.progress.prog_count_max  プログレスバーカウンターMax
	//      
	// @return                     プログレスバーオブジェクト
	//
	function asql_setProgressBars(ini)
	{
		//プログレス用DIVが無いときのダミー
		if(!document.getElementById(ini.progressId)){
			var dmyelm = document.createElement("DIV") ;
			var dmydiv = document.body.appendChild(dmyelm)       ;
			    dmydiv.setAttribute("id",ini.progressId) ;
			ini.progress = 'none';
		}

		// プログレスバーを出力するdiv
		if(ini.progress == 'dragableFloat')
			 this.div = dragableFloat(ini.progressId,ini.progressX,ini.progressY)
		else this.div = document.getElementById(ini.progressId)

		// プログレスバーdivのスタイルCSS
		this.div.style.color = 'red'
		this.div.style.margin = '0px'
		this.div.style.padding = '4px'

		// プログレスバーキャラクタ
		this.prog_bar= 'o';
		// プログレスバー配列
		this.prog_array= [];
		// プログレスバータイマーID用塩
		this.req_id = 0;
		// プログレスインターバル
		this.prog_interval= 10;
		// プログレスバーカウンター
		this.prog_count =0;
		// プログレスバーカウンターMax
		this.prog_count_max =18;
		// プログレスバーセパレータ（受信時用）
		this.prog_sep   ="::";


		//スタート
		this.prog_start = function (sql)
		{
			if(ini.progress == 'none')return

			// リクエストID の種seed
			this.req_id_seed = (new Date()).getTime();

			//プログレスバータイマーID兼用のリクエストID生成
			this.req_id = MD5_hexhash(sql+this.req_id_seed)

			this.prog_array[""+this.req_id] = setInterval(
				//プログレスバー出力
				function ()
				{
					if(this.prog_count >= this.prog_count_max){
						this.div.innerHTML = '' ; //初期化
						this.prog_count =0;
					}
					this.div.innerHTML += this.prog_bar ;
					this.prog_count++ ;
				}
				, this.prog_interval 
			)
		}

		//ストップ
		this.prog_stop = function (id)
		{
			clearInterval(this.prog_array[id])
			//setTimeout("clearInterval('"+id+"')",1000)
			//this.div.innerHTML += ' ok' ;
			this.div.innerHTML  = '' ;
		}

/*
		this.prog_stop = function (len)
		{
			for(var i=len ; i >= 0 ;i--){
				clearInterval(this.prog_array[i])
			}
			this.div.innerHTML += ' ok' ;
		}
*/

		return this
	}

	////
	// SQL別の微調整/セパレータ設定
	//  
	// SQL毎に異なる結果データの行間列間のセパレータ文字列を設定します。
	// 
	// @param  useSQL          サーバー側で使うSQL名
	// @return                 SQL別の微調整 セパレータオブジェクト
	//
	function asql_setSeparator(useSQL)
	{
		//小文字化
		sqlName = useSQL.toLowerCase() ;

		// SQL別設定
		// @property  rsep    行セパレータ
		// @property  csep    列セパレータ
		//
		switch(sqlName)
		{
			case "mysql"  : 
				return { "rsep" : "\n" , "csep":"\t"  }; break ;
			case "sqlite" : 
				return { "rsep" : "\n" , "csep":","  }; break ;
		}
	}

	//================================================================
	// SQL送信関数
	//  
	// jsアプリからSQL文を受け取り、初期設定にしたがって加工して
	// AjaxライブラリのsendRequest()へ渡します。
	//
	// @sample           asql_sendSQL("select * from mt_category where msg = 'test2' ;")
	// @param req        リクエストの初期設定オブジェクト
	// @param sql        SQL文
	// @param option     オプション -t テーブル表示 -h ヘッダ表示
	//
	function asql_sendSQL(req,sql,option)
	{
		asql_sendSQLwk( req,sql );
	}

	//送信作業 
	function asql_sendSQLwk( req,sql )
	{
		var callback = req.ini.callback
		var method   = req.ini.method
		var url      = req.ini.url
		var async    = req.ini.async

		//プログレスバー開始
		req.progress.prog_start(sql)     ;

		//受信処理
		on_ajasql_loaded  = function (res){

			//dbg_echo(res.responseText)

			//::でつながっているレスポンスのヘッダとボディを分離
			var reses = res.responseText.split("::") ;

			//リクエストとレスポンスを整合させる
			//
			//レスポンスヘッダをリクエストしたオブジェクトへセット

			eval( "req.head ="+reses[0])  ;
			//ヘッダを削除したレスポンスボディをリクエストしたオブジェクトへセット

			if(reses[1].substr(0,6) == 'error:'){
				req.head.error='<font color="red">error</font>';
				req.head.msg=reses[1];
				
				//ドラッガブルフロートDIVを生成
				asql_head = dragableFloat("asql_headdata",100,200);
				fadeOpacity('asql_headdata',1,0.7)
				asql_head.innerHTML=outputResHeadTable(req) ;

			}

			reses.shift() 
			req.body =reses.join("::") ;

			//GWでエンコードしたブラウザだけデコード
			if((is.safari || is.khtml))
				req.body = decodeURIComponent(req.body)   ;
			
			req.body = req.body.split('%3E').join('>')
			req.body = req.body.split('%7C').join('|')
			req.body = req.body.split('%26').join('&')
			req.body = req.body.split('%60').join('`')

			
			//受信したIDのプログレスバー動作を停止
			req.progress.prog_stop(req.head.reqid) ;

			//コールバック関数呼び出し
			callback(res,req) ;
		}

		var superload =true             ;  //強制リロード

		//SQL文内の%(likeのワイルドカードなど)をエンコード
		sql = sql.split('%').join('%25');
		sql = sql.split('&').join('%26');
		sql = sql.split('=').join('%3D');
		sql = sql.split('<').join('%3C');
		sql = sql.split('>').join('%3E');
		
/*
		//セパレータのエンコード
		if(req.ini.useSQL=='sqlite'){
			sql = sql.split('\n').join('%0A');
			sql = sql.split(',').join('%2C');
		} else if(req.ini.useSQL == 'mysql'){
			sql = sql.split('\n').join('%0A');
			sql = sql.split('\t').join('%09');
		}
*/


		var data = "&q="+sql            ;
		
			data += "&us="+req.ini.useSQL
				 +  "&dn="+req.ini.dbName 
				 +  "&tn="+req.ini.tblName 
				 +  "&ss="+false
				 +  "&prog="+req.progress.req_id

		//Ajaxライブラリjslb_ajax0x.jsの送信関数へ
		sendRequest(on_ajasql_loaded,data,method,url,async,superload) ;

	}

	//================================================================
	// SQL初期設定の送信関数
	//  
	// jsアプリから初期設定を受け取り、
	// AjaxライブラリのsendRequest()経由でajasql_gw.phpへ渡します。
	//
	// @sample           asql_sendSQLini(ini)
	// @param sql        iniオブジェクト
	//
	function asql_sendSQLini(ini,method,url,async )
	{
		// 強制リロード
		var superload = true ;
		// 非同期
		var async     = true ;
		
		// 初期設定をURLクエリ化
		var data = "&us="+ini.useSQL
				 + "&dn="+ini.dbName 
				 + "&tn="+ini.tblName ;
				 
		//デバック
		//alert("////jslb_ajasqlxx.js//// \n data:"+data+" \n method:"+method+" \n url:"+url+" \n async:"+async+" \n superload:"+superload);

		//Ajaxライブラリjslb_ajax0x.jsの送信関数へ
		sendRequest(ajasql_callbackini,data,method,url,async,superload) ;
	}
	
	//初期設定送信に対するコールバック関数
	function ajasql_callbackini(oj)
	{
			//alert(oj.responseText)

		//デバック
		//alert("////jslb_ajasqlxx.js//// \n oj.responseText:"+oj.responseText) ;

		if( oj.responseText == 'ok' ){
		
			///////////////////// 何かフラグを立てる onreadyとか trueとか、、、;

			
		} else {
			///////////////////// nullとか;
		}
	}
	

	//================================================================
	// 受信時コールバック関数
	//  ( 受信時に起動するスクリプト )
	//

	

	
	
	//==============================================================--
	// 受信後 出力補助用関数
	//
	//
	
	//メッセージ出力
	function outputMsg(id,msg)
	{
		//出力
		document.getElementById(id).innerHTML = msg ;
	}


	//==============================================================--
	// 受信後 データ処理用関数
	//
	//

	//response出力
	function outputResHeadTable(res)
	{
		var list,head=res.head,i,j
				
		lists = "<table class='restable' style='font-size:0.85em;border:solid 1px #999999'>\n"
		
		lists += "<tr>\n" 
			lists += "<td colspan='2' style='width:100%;background-color:orange;color:#fff;border:solid 1px orange' >\n" 
			lists += "<a href='javascript:void(0)' onclick='asql_head.innerHTML=\"\"'>[ｘ]</a> AjaSQL "
			lists += "</td>\n" 
		lists += "</tr>\n" 
			
		for(i in head)
		{
			lists += "<tr>\n" 
				lists += "<td style='background-color:#ccc;border:solid 1px #888888' >\n" 
				lists += i
				lists += "</td>\n" 
				lists += "<td style='background-color:#fff;border:solid 1px #888888' >\n" 
				lists += head[i]
				lists += "</td>\n" 
			lists += "</tr>\n" 
		}
		lists += "</table>\n"
		
		//結果出力
		//document.getElementById(id).innerHTML += lists
		
		return lists
	}
	
	//response出力
	function outputResTable(res,option)
	{
		var lists='',i=0,j=0,rows=0
		var header=0,table=0
		if(outputResTable.arguments.length>=2){
			var options = option.split(',')
			for(i=0;i<options.length;i++){
				eval(options[i])
			}
		}

		//res = res.split('\n').join('<br>')
		
		//lists = "<table class='restable' style='font-size:0.85em' border=1>"

		if(table!=0)
		lists = "<table class='restable' style='font-size:0.85em'>"

		if(header){
		lists += "<tr>\n" 
			lists += "<td colspan='"+(res[1].length)+"' style='width:100%;' >\n" 
			lists += "<a href='javascript:void(0)' onclick='div2.innerHTML=\"\"'>[ｘ]</a>"
			lists += "</td><br>\n" 
		lists += "</tr>\n" 
		}
		if(header==0)rows=1

		for(i=rows ; i<res.length-1 ; i++)
		{
			lists += "<tr>" 
			for(j=0 ; j<res[i].length ; j++)
			{
				lists += "<td>" 
				lists += res[i][j].split('\\n').join('<br>').split('\\t').join('	')
				lists += "</td>" 
			}
			lists += "</tr><br>" 
		}
		
		lists += "</table>"
		
		return lists

	}
	
	function decodeSep(reqbody)
	{
		//セパレータのデコード
		if(req.ini.useSQL=='sqlite'){
			reqbody = reqbody.split('%0A').join('\n');
			reqbody = reqbody.split('%2C').join(',');
		} else if(req.ini.useSQL == 'mysql'){
			reqbody = reqbody.split('%0A').join('\n');
			reqbody = reqbody.split('%09').join('\t');
		}
		return reqbody
	}
	
	
	////
	// 結果を[行番号][列番号]の二次元配列で取得する
	//
	// SQL毎のセパレーターで分離してary[行][列]の二次元配列を作成
	//
	// @sample      ary = getRowColArray(oj) ; alert(ary[2][3])
	// @sample      alert("1行目3列目は : " + getRowColArray(oj)[1][2])
	// @param  res  結果データ 
	// @return      [行][列]の二次元配列 0行目はフィールド名
	// @see         asql_setSeparator()
	//
	function getRowColArray(res,req)
	{
		var result = req.body.split(req.spliter.rsep) ;
		var ary    = [] ;

		for(var i=0 ; i<result.length-1;i++)
		{
			
			ary[i] = result[i].split(req.spliter.csep) ;
		}
		return ary ;
	}

	////
	// 結果を[行番号][列番号]の二次元配列で取得する テスト中
	//
	// 行セパレーターがデータに含まれているときに二次元配列を作成
	// ヘッダlengthごとに1行とカウントする
	//
	// @sample      ary = getRowColArray2(oj) ; alert(ary[2][3])
	// @sample      alert("1行目3列目は : " + getRowColArray2(oj)[1][2])
	// @param  res  結果データ 
	// @return      [行][列]の二次元配列 0行目はフィールド名
	// @see         asql_setSeparator()
	//
	function getRowColArray2(res,req)
	{
		var resultwk = req.body.split(req.spliter.rsep) ;
		var collen   = resultwk[0].split(req.spliter.csep).length;
		var result   = req.body.split(req.spliter.csep) ;
		var rowlen   = result.length/collen


		var ary    = [] ;

		for(var i=0 ; i<rowlen;i++)
		{
			ary[i] = result.slice(0+collen*i,(collen+collen*i)-1) ; 
		}
		return ary ;
	}

	//
	// ★以下の関数は、上記 getRowColArray(res) の戻り値aryを
	// 引数として利用します。
	//

	////
	// rowNo行目colNo列目のデータ取得
	//
	// @sample           alert(getByRC(ary,1,2))
	// @param  ary       関数 getRowColArray(res) の戻り配列
	// @param  rowNo     行番号
	// @param  colNo     列番号
	// @return           値
	// @see              getRowColArray(oj)[row][col]と同じ
	//
	function getByRC(ary,rowNo,colNo)
	{
		return ary[row][col]
	}
	
	////
	// 行番号と列名(フィールド,カラム)から値を取得する
	//
	// @sample           alert(getByRCName(ary,8,"id"))
	// @param  ary       関数 getRowColArray(res) の戻り配列
	// @param  rowNo     行番号
	// @param  fildName  列名(フィールド,カラム)
	// @return           値
	//
	function getByRCName(ary,rowNo,fildName)
	{
		return ary[rowNo][getFildNo(ary,fildName)] ;
	}

	////
	// 行数取得
	//
	// @sample           alert(getRowLen(ary))
	// @param  ary       関数 getRowColArray(res) の戻り配列
	// @return           データの行数(フィールド行を除く)
	// @see              SQL関数 COUNT() で取得した方が転送量は少ない
	//
	function getRowLen(ary)
	{
		return ary.length-2
	}

	////
	// 列数(フィールド,カラム)取得
	//
	// @sample           alert(getColLen(ary))
	// @param  ary       関数 getRowColArray(res) の戻り配列
	// @return           列数
	//
	function getColLen(ary)
	{
		return ary[1].length
	}

	////
	// 列名(フィールド,カラム)を格納した配列を取得する
	//
	// @sample      filds = getFildNameArray(ary) ; alert(filds[0])
	// @sample      alert("3列目のカラムは : "+getFildNameArray(ary)[3])
	// @param  ary  関数 getRowColArray(res) の戻り配列
	// @return      フィールド名を格納した[列番号]配列
	//
	function getFildNameArray(ary)
	{
		return ary[0] ;
	}

	////
	// 列番号を格納した、列名の連想配列を取得する
	//
	// @sample      fildno = getFildNoArray(ary) ; alert(fildno["name"])
	// @sample      alert("idカラムは : "+getFildNoArray(ary)["id"]+"番目")
	// @param  ary  関数 getRowColArray(res) の戻り配列
	// @return      列番号を格納した、列名の連想配列
	//
	function getFildNoArray(ary)
	{
		var fa = [] ;
		
		for(var i=0 ; i<ary[0].length ; i++)
		{
			fa[ary[0][i]] = i ;
		}
		
		return fa ;
	}
	
	////
	// 列名(フィールド,カラム)から列番号を取得する
	//
	// @sample           alert(getFildNo(ary,"id"))
	// @param  ary       関数 getRowColArray(res) の戻り配列
	// @param  fildName  列名(フィールド,カラム)
	// @return           列番号
	//
	function getFildNo(ary,fildName)
	{
		return getFildNoArray(ary)[fildName] ;
	}

//=====================================================================
//  SYSTEM      :  DragableFloat DIV
//  PROGRAM     : ドラッグできて、スクロール時には画面の固定位置で停止するDIV
//  FILE NAME   :  jsgt_dragfloat.js
//  CALL FROM   :  HTML
//  AUTHER      :  Toshirou Takahashi http://jsgt.org/mt/01/
//  SUPPORT URL :  http://jsgt.org/mt/archives/01/000419.html
//  CREATE      :  2005.7.8
//  UPDATE      :  2005.8.30 firefoxでBBS書けなかったのでdiv.onmousedownのreturn false止め
//  UPDATE      :  2005.8.12 v05ドラッグ時にieで発生するselectをonselectstartでキャンセル
//  UPDATE      :  2005.8.10 v04ドラッグ時にiframe上でイベントを拾えないのを多少修正しました
//  UPDATE      :  2005.8.8  dbg_echo()追加
//  UPDATE      :  2005.8.8  bodyタグが無い時用ダミーbody出力を追加　
//  UPDATE      :  2005.7.8 DOCTYPE 標準モードに対応
//                   参考 http://otd8.jbbs.livedoor.jp/877597/bbs_tree?base=9322&range=1
//
//
// このソースは改変も商用利用も自由ですが、
// その自由を護るために著作権は放棄しません。
//---------------------------------------------------------------------
// 高橋登史朗 (Toshirou Takahashi http://jsgt.org/mt/01/) 2005.7.8

/*
//=====================================================================
// 以下 サンプル

<-- ライブラリ  jsgt_dragfloat.js-->
<script type    = 'text/javascript'
        charset = 'UTF-8'
        src     = 'jsgt_dragfloat.js'></script>
<script type='text/javascript'>
<!--

////
// 動作開始
//
// ページ読込み時に動作開始
//
window.onload = function ()
{
	setDragableFloat() //設定
}

////
// 設定
//
// @syntax oj = dragableFloat("DIVのID名",初期位置X,初期位置Y)
//
// @sample              div1 = dragableFloat("aaa",100,200) //生成
// @sample              div1.innerHTML="あいうえお"         //HTMLを挿入
// @sample              div1.style.backgroundColor='orange' //CSSで修飾
// @sample              doDragableFloat()                   //開始
//	
function setDragableFloat()
{
	//ドラッガブルフロートDIVを生成
	div1 = dragableFloat("aaa",100,200)
	div2 = dragableFloat("fff",200,300)
	div3 = dragableFloat("ddd",250,300)
	
	//各DIVへHTMLを挿入
	div1.innerHTML="aaaaaaaa"
	div2.innerHTML="fffffff"
	div3.innerHTML="xx"

	//CSSで修飾
	div1.style.backgroundColor ="orange"
	div2.style.fontSize  ="18px"

	//開始
	doDragableFloat()
	
}

//-->
</script>
<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>



// サンプルここまで
//=====================================================================
 */
 





////
// グローバル変数
//
// @var    zcount             全ドラッガブルDIV中で現在のzindex最前面
// @var    clickElement       現在ドラッグ中のDIVのID名
// @var    canvas             document.body のDOCTYPE標準モード対応
// @array  dragableFloatId    全ドラッガブルDIVのID名を格納
//
var zcount = 0          ;
var clickElement = ""   ;
if(document.getElementsByTagName('BODY').length==0)document.write('<body>')//ダミーのbodyタグ
var canvas = document[ 'CSS1Compat' == document.compatMode ? 'documentElement' : 'body'];
var dragableFloatId=[]  ;
var recx1,recy1,recx2,recy2,recxOffset,recyOffset


////
// 設定された全ドラッガブルDIVを開始
//
//
function doDragableFloat()
{ 

	if(!(is.safari || is.khtml))
	{
		//スクロール時の動作
		window.onscroll = function(e){
			startDragableFloat()
		}
	} else {
		aaa=setInterval("startDragableFloat()",100)
	}
}

	//全ドラッガブルDIVのフロートをスタート
	function startDragableFloat()
	{
		for(i in dragableFloatId ){
			var oj = document.getElementById(dragableFloatId[i]) ;
			moveDiv(oj,oj.style.left,oj.style.top);
		}
	}
	
	//DIVを浮かす	
	function moveDiv (oj,ofx,ofy)
	{
		if(oj.draging)return  ;//ドラッグ中は無視
		if(oj.dragcnt == 0 ){ 
			ofx = parseInt(ofx,10) 
			ofy = parseInt(ofx,10) 
			oj.dragcnt++
		} else {//ドラッグ終了位置がオフセット
			ofx = parseInt(oj.pageOffLeft,10) 
			ofy = parseInt(oj.pageOffTop,10) 
		}
		var l = parseInt(canvas.scrollLeft,10) 
		var t = parseInt(canvas.scrollTop,10) 
		oj.style.left = l + ofx+"px"
		oj.style.top  = t + ofy+"px"
	}


////
//ブラウザ判定
//
// @sample               alert(is.ie)
//
var is = 
{
	ie     : !!document.all ,
	mac45  : navigator.userAgent.indexOf('MSIE 4.5; Mac_PowerPC') != -1 ,
	opera  : !!window.opera ,
	safari : navigator.userAgent.indexOf('Safari') != -1 ,
	khtml  : navigator.userAgent.indexOf('Konqueror') != -1 
}

////
// ドラッガブルフロートDIV生成
//
// @sample          div1 = dragableFloat("aaa",100,200)
//

function dragableFloat(id,x,y)
{
	if(!!dragableFloatId[id]) return document.getElementById(id)
	
	////
	// DIV生成
	// @param  id             DIVのID名
	//
	this.mkDiv = function (id) 
	{
		var canvas = document[ 'CSS1Compat' == document.compatMode ? 'documentElement' : 'body'];
		var doc   = document                           ; // documentオブジェクト
		var body  = doc.body                           ;
		var elem  = doc.createElement("DIV")           ; //DIV要素を生成
		var div   = body.appendChild(elem);
			div.setAttribute("id",id)	               ;
			div.style.position = "absolute"           ;
			div.style.left     = x + "px"             ;
			div.style.top      = y + "px"             ;
			div.innerHTML      = ""                   ;
			div.offLeft        = 0                    ;
			div.offTop         = 0                    ;
			div.pageOffLeft    = x-parseInt(canvas.scrollLeft,10)+ "px";
			div.pageOffTop     = y-parseInt(canvas.scrollTop,10) + "px";
			div.dragcnt        = 0                    ;
			div.draging        = false                ;
			recx1              = x
			recy1              = y
			div.onmouseout   = function (e){ 

				if(!clickElement) return
				selLay=document.getElementById(clickElement);

				//xyエラー時の類推追跡用xyセット
				x =  recx2+=recxOffset  
				y =  recy2+=recyOffset  
				dofollow(x,y)
				x =  recx2+=recxOffset  
				y =  recy2+=recyOffset  
				setTimeout('"dofollow('+x+','+y+')"',10)

				//follow(e)
				//dbg.innerHTML += getMouseX(e)+"--"+getMouseY(e)+"<br>"
				div.style.zIndex = zcount++
				return false 
			}
			div.onselectstart  = function (e){ return false }
			div.onmouseover    = function (e){ return false }
			div.onmousedown    = function (e)
			{
				div.draging    = true  ;
				div.dragcnt ++         ;
				selLay=div
				clickElement = selLay.id

				//DIVのleft,topからカーソル位置までのオフセットをキャプチャ
				if (selLay){	
					selLay.offLeft = getMouseX(e) - getLEFT(selLay.id)
					selLay.offTop  = getMouseY(e) - getTOP(selLay.id)
				
				} 
			//	return false
			}

		dragableFloatId[div.id] = div.id;//windowへ登録
		div.index++;
		return div;
	}

	//マウス移動時の動作
	document.onmousemove  = function (e)
	{
		recTimeOffset(e) //rec
		follow(e)
		return false
	}
	
	//マウスアップ時の動作
	document.onmouseup  = function (e)
	{
		if(!clickElement) return
		selLay=document.getElementById(clickElement);
		
		//ドラッグ中なのにはずれちゃった場合
		if(!is.safari)follow(e)
		
		//ドラッグ中止
		selLay.draging   = false ;
		selLay.style.zIndex = zcount++

		//画面内のオフセットleft,top位置をキャプチャ
		if (selLay){
			var sl = parseInt(canvas.scrollLeft,10)
			var st = parseInt(canvas.scrollTop,10)
			selLay.pageOffLeft = getLEFT(selLay.id)-sl
			selLay.pageOffTop  = getTOP(selLay.id)-st
		}
		return false
	}

	function follow(e)
	{
		if(!clickElement) return
		selLay=document.getElementById(clickElement);

		//マウス位置取得
		var x = getMouseX(e)
		var y = getMouseY(e)

		//xyエラー時の類推追跡用xyセット
		x = (x == -1)? recx2+=recxOffset : x ;
		y = (y == -1)? recy2+=recyOffset : y ;
		if(x == -1 && y == -1)setTimeout('follow('+e+')',100)

		dofollow(x,y)
	}


	function dofollow(x,y)
	{
		if(!clickElement) return
		selLay=document.getElementById(clickElement);
		if(selLay.draging){
			//オフセットを引いて追随
			movetoX = x - selLay.offLeft
			movetoY = y - selLay.offTop
			selLay.style.left = parseInt(movetoX,10) +"px"
			selLay.style.top  = parseInt(movetoY,10) +"px"
		}
	}

	function recTimeOffset(e)
	{
		if(x == -1 || y == -1)return 
		recx2= recx1
		recy2= recy1
		recx1= getMouseX(e)
		recy1= getMouseY(e)
		recxOffset= recx1 - recx2
		recyOffset= recy1 - recy2
		
	}


	//--マウスX座標get 
	function getMouseX(e)
	{
		if(document.all)               //e4,e5,e6用
			return canvas.scrollLeft+event.clientX
		else if(document.getElementById)    //n6,n7,m1,o7,s1用
			return e.pageX
	}

	//--マウスY座標get 
	function getMouseY(e)
	{
		if(document.all)               //e4,e5,e6用
			return canvas.scrollTop+event.clientY
		else if(document.getElementById)    //n6,n7,m1,o7,s1用
			return e.pageY
	}


	//--レイヤ－左辺X座標get 
	function getLEFT(layName){
		//デバック
		//document.getElementById('aaa').innerHTML+=layName+'<BR>'
		
		if(document.all)                    //e4,e5,e6,o6,o7用
			return document.all(layName).style.pixelLeft
		else if(document.getElementById)    //n6,n7,m1,s1用
			return (document.getElementById(layName).style.left!="")
				?parseInt(document.getElementById(layName).style.left):""
	}

	//--レイヤ－上辺Y座標get 
	function getTOP(layName){
		if(document.all)                    //e4,e5,e6,o6,o7用
			return document.all(layName).style.pixelTop
		else if(document.getElementById)    //n6,n7,m1,s1用
			return (document.getElementById(layName).style.top!="")
			        ?parseInt(document.getElementById(layName).style.top):""
	}

	function dbg_echo(){
			////////dbg.innerHTML += selLay.draging+"<br>"
			
		var debugDIV  = document.createElement("DIV")           ; //DIV要素を生成
		var dbg   = document.body.appendChild(debugDIV);
			dbg.setAttribute("id","dbg")	               ;
			dbg.style.position = "absolute"           ;
			dbg.style.left     =  "400px"             ;
			dbg.style.top      = "0px"             ;
			dbg.innerHTML      = "dbg"                   ;
			return dbg;
	}  //dbg = dbg_echo()

	function db1(e)
	{
		dbg.innerHTML += getMouseX(e)+"-1000-"+getMouseY(e)+"<br>"
	}
	
	
	return this.mkDiv(id) ;
		
}

////
// フェイド関数
//
// @sample          fadeOpacity('drgbbs',1,0.7)
//
// 	
function fadeOpacity(layName,swt,stopOpacity){
	
	if(!window.fadeOpacity[layName]) //カウンター初期化
	  fadeOpacity[layName] =0 

	//フェイドスイッチ引数省略時初期値(不透明から透明へ)
	if(!arguments[1]) swt = -1
  
	//引数swtが -1 なら不透明から透明へ
	//           1 なら透明から不透明へフェイドする
	if(swt==-1)        var f  = "9876543210"
	else if(swt==1)    var f  = "0123456789"
	else               var f  = "9876543210"
  
	//停止不透明度引数省略時初期値
	if(!arguments[2] && swt==-1)	 stopOpacity = 0
	else if(!arguments[2] && swt==1) stopOpacity = 10

	//フェイド処理	
	if( fadeOpacity[layName] < f.length-1 ){
  
	  //カウンター番目の文字列を取り出す
	  var opa = f.charAt(fadeOpacity[layName])/10

	  //終了時不透明度なら終了
	  if( opa == stopOpacity ){
	    setOpacity(layName,stopOpacity)  //終了
	    fadeOpacity[layName] = 0     //リセット
	    return
	  }
	  // 不透明度変更を実行する
	  setOpacity(layName,opa)
	  // カウンターを加算
	  fadeOpacity[layName]++
	  //--50/1000秒後にfadeOpacityを再実行
	  setTimeout('fadeOpacity("'+layName+'","'+swt+'","'+stopOpacity+'")',50)
	} else {
	  //終了
	  setOpacity(layName,stopOpacity)
	  //--リセット
	  fadeOpacity[layName] = 0
	}
}
  function setOpacity(layName,arg) {
    var ua = navigator.userAgent,oj = document.getElementById(layName)
    if(window.opera){//o9bpr2+
       if((typeof oj.style.opacity)=='string') oj.style.opacity = arg
       else return
    } else if(ua.indexOf('Safari') !=-1 || ua.indexOf('KHTML') !=-1 || 
       (typeof oj.style.opacity)=='string') { //s,k,new m
        oj.style.opacity = arg
    } else if(document.all) {          //win-e4,win-e5,win-e6
        document.all(layName).style.filter="alpha(opacity=0)"
        document.all(layName).filters.alpha.Opacity  = (arg * 100)
    } else if(ua.indexOf('Gecko')!=-1) //n6,n7,m1
        oj.style.MozOpacity = arg
  }


	function dbg_oj(){
			
		var debugDIV  = document.createElement("DIV")           ; //DIV要素を生成
		var dbg   = document.body.appendChild(debugDIV);
			dbg.setAttribute("id","dbg")	               ;
			dbg.style.position = "absolute"           ;
			dbg.style.left     =  "200px"             ;
			dbg.style.top      = "0px"             ;
			dbg.style.zIndex   = 100
			return dbg
	}  dbg = dbg_oj()

	function dbg_echo(text){
			dbg.innerHTML      += "<hr>"+text                   ;
	}  

//=====================================================================
//  PROGRAM     :  MD5 Message-Digest
//  以下MD5スクリプトのオリジナルは
//  http://www.onicos.com/staff/iz/amuse/javascript/expert/
//  にあります。
//  

/* md5.js - MD5 Message-Digest
 * Copyright (C) 1999,2002 Masanao Izumo <iz@onicos.co.jp>
 * Version: 2.0.0
 * LastModified: May 13 2002
 *
 * This program is free software.  You can redistribute it and/or modify
 * it without any warranty.  This library calculates the MD5 based on RFC1321.
 * See RFC1321 for more information and algorism.
 */

/* Interface:
 * md5_128bits = MD5_hash(data);
 * md5_hexstr = MD5_hexhash(data);
 */

/* ChangeLog
 * 2002/05/13: Version 2.0.0 released
 * NOTICE: API is changed.
 * 2002/04/15: Bug fix about MD5 length.
 */


//    md5_T[i] = parseInt(Math.abs(Math.sin(i)) * 4294967296.0);
var MD5_T = new Array(0x00000000, 0xd76aa478, 0xe8c7b756, 0x242070db,
		      0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613,
		      0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1,
		      0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e,
		      0x49b40821, 0xf61e2562, 0xc040b340, 0x265e5a51,
		      0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681,
		      0xe7d3fbc8, 0x21e1cde6, 0xc33707d6, 0xf4d50d87,
		      0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9,
		      0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122,
		      0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60,
		      0xbebfbc70, 0x289b7ec6, 0xeaa127fa, 0xd4ef3085,
		      0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8,
		      0xc4ac5665, 0xf4292244, 0x432aff97, 0xab9423a7,
		      0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d,
		      0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314,
		      0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb,
		      0xeb86d391);

var MD5_round1 = new Array(new Array( 0, 7, 1), new Array( 1,12, 2),
			   new Array( 2,17, 3), new Array( 3,22, 4),
			   new Array( 4, 7, 5), new Array( 5,12, 6),
			   new Array( 6,17, 7), new Array( 7,22, 8),
			   new Array( 8, 7, 9), new Array( 9,12,10),
			   new Array(10,17,11), new Array(11,22,12),
			   new Array(12, 7,13), new Array(13,12,14),
			   new Array(14,17,15), new Array(15,22,16));

var MD5_round2 = new Array(new Array( 1, 5,17), new Array( 6, 9,18),
			   new Array(11,14,19), new Array( 0,20,20),
			   new Array( 5, 5,21), new Array(10, 9,22),
			   new Array(15,14,23), new Array( 4,20,24),
			   new Array( 9, 5,25), new Array(14, 9,26),
			   new Array( 3,14,27), new Array( 8,20,28),
			   new Array(13, 5,29), new Array( 2, 9,30),
			   new Array( 7,14,31), new Array(12,20,32));

var MD5_round3 = new Array(new Array( 5, 4,33), new Array( 8,11,34),
			   new Array(11,16,35), new Array(14,23,36),
			   new Array( 1, 4,37), new Array( 4,11,38),
			   new Array( 7,16,39), new Array(10,23,40),
			   new Array(13, 4,41), new Array( 0,11,42),
			   new Array( 3,16,43), new Array( 6,23,44),
			   new Array( 9, 4,45), new Array(12,11,46),
			   new Array(15,16,47), new Array( 2,23,48));

var MD5_round4 = new Array(new Array( 0, 6,49), new Array( 7,10,50),
			   new Array(14,15,51), new Array( 5,21,52),
			   new Array(12, 6,53), new Array( 3,10,54),
			   new Array(10,15,55), new Array( 1,21,56),
			   new Array( 8, 6,57), new Array(15,10,58),
			   new Array( 6,15,59), new Array(13,21,60),
			   new Array( 4, 6,61), new Array(11,10,62),
			   new Array( 2,15,63), new Array( 9,21,64));

function MD5_F(x, y, z) { return (x & y) | (~x & z); }
function MD5_G(x, y, z) { return (x & z) | (y & ~z); }
function MD5_H(x, y, z) { return x ^ y ^ z;          }
function MD5_I(x, y, z) { return y ^ (x | ~z);       }

var MD5_round = new Array(new Array(MD5_F, MD5_round1),
			  new Array(MD5_G, MD5_round2),
			  new Array(MD5_H, MD5_round3),
			  new Array(MD5_I, MD5_round4));

function MD5_pack(n32) {
  return String.fromCharCode(n32 & 0xff) +
	 String.fromCharCode((n32 >>> 8) & 0xff) +
	 String.fromCharCode((n32 >>> 16) & 0xff) +
	 String.fromCharCode((n32 >>> 24) & 0xff);
}

function MD5_unpack(s4) {
  return  s4.charCodeAt(0)        |
	 (s4.charCodeAt(1) <<  8) |
	 (s4.charCodeAt(2) << 16) |
	 (s4.charCodeAt(3) << 24);
}

function MD5_number(n) {
  while (n < 0)
    n += 4294967296;
  while (n > 4294967295)
    n -= 4294967296;
  return n;
}

function MD5_apply_round(x, s, f, abcd, r) {
  var a, b, c, d;
  var kk, ss, ii;
  var t, u;

  a = abcd[0];
  b = abcd[1];
  c = abcd[2];
  d = abcd[3];
  kk = r[0];
  ss = r[1];
  ii = r[2];

  u = f(s[b], s[c], s[d]);
  t = s[a] + u + x[kk] + MD5_T[ii];
  t = MD5_number(t);
  t = ((t<<ss) | (t>>>(32-ss)));
  t += s[b];
  s[a] = MD5_number(t);
}

function MD5_hash(data) {
  var abcd, x, state, s;
  var len, index, padLen, f, r;
  var i, j, k;
  var tmp;

  state = new Array(0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476);
  len = data.length;
  index = len & 0x3f;
  padLen = (index < 56) ? (56 - index) : (120 - index);
  if(padLen > 0) {
    data += "\x80";
    for(i = 0; i < padLen - 1; i++)
      data += "\x00";
  }
  data += MD5_pack(len * 8);
  data += MD5_pack(0);
  len  += padLen + 8;
  abcd = new Array(0, 1, 2, 3);
  x    = new Array(16);
  s    = new Array(4);

  for(k = 0; k < len; k += 64) {
    for(i = 0, j = k; i < 16; i++, j += 4) {
      x[i] = data.charCodeAt(j) |
	    (data.charCodeAt(j + 1) <<  8) |
	    (data.charCodeAt(j + 2) << 16) |
	    (data.charCodeAt(j + 3) << 24);
    }
    for(i = 0; i < 4; i++)
      s[i] = state[i];
    for(i = 0; i < 4; i++) {
      f = MD5_round[i][0];
      r = MD5_round[i][1];
      for(j = 0; j < 16; j++) {
	MD5_apply_round(x, s, f, abcd, r[j]);
	tmp = abcd[0];
	abcd[0] = abcd[3];
	abcd[3] = abcd[2];
	abcd[2] = abcd[1];
	abcd[1] = tmp;
      }
    }

    for(i = 0; i < 4; i++) {
      state[i] += s[i];
      state[i] = MD5_number(state[i]);
    }
  }

  return MD5_pack(state[0]) +
	 MD5_pack(state[1]) +
	 MD5_pack(state[2]) +
	 MD5_pack(state[3]);
}

function MD5_hexhash(data) {
    var i, out, c;
    var bit128;

    bit128 = MD5_hash(data);
    out = "";
    for(i = 0; i < 16; i++) {
	c = bit128.charCodeAt(i);
	out += "0123456789abcdef".charAt((c>>4) & 0xf);
	out += "0123456789abcdef".charAt(c & 0xf);
    }
    return out;
}




