//==============================================================================
//  SYSTEM      :  暫定版クロスブラウザAjax用ライブラリ
//  PROGRAM     :  XMLHttpRequestによる送受信を行います
//  FILE NAME   :  jslb_ajaxXXX.js
//  CALL FROM   :  Ajax クライアント
//  AUTHER      :  Toshirou Takahashi http://jsgt.org/mt/01/
//  SUPPORT URL :  http://jsgt.org/mt/archives/01/000409.html
//  CREATE      :  2005.6.26
//  UPDATE      :  v0.38  2005.10.18 chkAjaBrowser()を追加
//  UPDATE      :  v0.372 2005.10.14 uriEncodeを修正
//  UPDATE      :  v0.371 2005.10.7 GETとsload時の?の付け方を修正。
//  UPDATE      :  v0.37 2005.10.5.1 修正BSDライセンスやめました。
//                       著作権表示義務無し。商用利用、改造、自由。連絡不要です。
//  UPDATE      :  v0.37 2005.10.5 リクエストヘッダenctypeのセット方法等を変更
//                       setEncHeader、uriEncodeを追加
//                       @see http://jsgt.org/ajax/ref/test/enctype/test1.htm
//                       修正BSDライセンスにしました
//  UPDATE      :  v0.36 2005.7.20 (oj.setRequestHeader)がwinieでunknown
//                  を返すことが判明し修正（unknownなのに、動作はします）
//  UPDATE      :  v0.35 2005.7.19 POSTのContent-Type設定をOpera8.01対応
//  UPDATE      :  v0.34 2005.7.16 sendRequest()にuser,password引数を追加
//  UPDATE      :  v0.33 2005.7.3  Query Component(GET)の&と=以外を
//                                encodeURIComponentで完全エスケープ。
//  TEST-URL    :  ヘッダ http://jsgt.org/ajax/ref/lib/test_head.htm
//  TEST-URL    :  認証   http://jsgt.org/mt/archives/01/000428.html
//  TEST-URL    :  非同期 
//        http://allabout.co.jp/career/javascript/closeup/CU20050615A/index.htm
//  TEST-URL    :  SQL     http://jsgt.org/mt/archives/01/000392.html
//------------------------------------------------------------------------------
// 最新情報   : http://jsgt.org/mt/archives/01/000409.html 
// 著作権表示義務無し。商用利用、改造、自由。連絡不要。
//
//

	////
	// 動作可能なブラウザ判定
	//
	// @sample        if(chkAjaBrowser()){ location.href='nonajax.htm' }
	// @sample        oj = new chkAjaBrowser();if(oj.bw.safari){ /* Safari code */ }
	// @return        ライブラリが動作可能なブラウザだけtrue  true|false
	//
	//  Enable list (v038現在)
	//   WinIE 5.5+ 
	//   Konqueror 3.3+
	//   AppleWebKit系(Safari,OmniWeb,Shiira) 124+ 
	//   Mozilla系(Firefox,Netscape,Galeon,Epiphany,K-Meleon,Sylera) 20011128+ 
	//   Opera 8+ 
	//
	function chkAjaBrowser()
	{
		var a,ua = navigator.userAgent;
		this.bw= { 
		  safari    : ((a=ua.split('AppleWebKit/')[1])?a.split('(')[0]:0)>=124 ,
		  konqueror : ((a=ua.split('Konqueror/')[1])?a.split(';')[0]:0)>=3.3 ,
		  mozes     : ((a=ua.split('Gecko/')[1])?a.split(" ")[0]:0) >= 20011128 ,
		  opera     : (!!window.opera) && ((typeof XMLHttpRequest)=='function') ,
		  msie      : (!!window.ActiveXObject)?(!!createHttpRequest()):false 
		}
		return (this.bw.safari||this.bw.konqueror||this.bw.mozes||this.bw.opera||this.bw.msie)
	}
	

	////
	// XMLHttpRequestオブジェクト生成
	//
	// @sample        oj = createHttpRequest()
	// @return        XMLHttpRequestオブジェクト(インスタンス)
	//
	function createHttpRequest()
	{
		if(window.ActiveXObject){
			 //Win e4,e5,e6用
			try {
				return new ActiveXObject("Msxml2.XMLHTTP") ;
			} catch (e) {
				try {
					return new ActiveXObject("Microsoft.XMLHTTP") ;
				} catch (e2) {
					return null ;
	 			}
	 		}
		} else if(window.XMLHttpRequest){
			 //Win Mac Linux m1,f1,o8 Mac s1 Linux k3用
			return new XMLHttpRequest() ;
		} else {
			return null ;
		}
	}
	
	////
	// 送受信関数
	//
	// @sample         sendRequest(onloaded,'&prog=1','POST','./about2.php',true,true)
	// @param callback 受信時に起動する関数名
	// @param data	   送信するデータ (&名前1=値1&名前2=値2...)
	// @param method   "POST" or "GET"
	// @param url      リクエストするファイルのURL
	// @param async	   非同期ならtrue 同期ならfalse
	// @param sload	   スーパーロード trueで強制、省略またはfalseでデフォルト
	// @param user	   認証ページ用ユーザー名
	// @param password 認証ページ用パスワード
	//
	function sendRequest(callback,data,method,url,async,sload,user,password)
	{
		//XMLHttpRequestオブジェクト生成
		var oj = createHttpRequest();
		if( oj == null ) return null;
		
		//強制ロードの設定
		var sload = (!!sendRequest.arguments[5])?sload:false;
		if(sload || method.toUpperCase() == 'GET')url += "?";
		if(sload)url=url+"t="+(new Date()).getTime();
		
		//ブラウザ判定
		var bwoj = new chkAjaBrowser();
		var opera	  = bwoj.bw.opera;
		var safari	  = bwoj.bw.safari;
		var konqueror = bwoj.bw.konqueror;
		var mozes	  = bwoj.bw.mozes ;

		//受信処理
		//operaはonreadystatechangeに多重レスバグがあるのでonloadが安全
		//Moz,FireFoxはoj.readyState==3でも受信するので通常はonloadが安全
		//Win ieではonloadは動作しない
		//Konquerorはonloadが不安定
		//参考http://jsgt.org/ajax/ref/test/response/responsetext/try1.php
		if(opera || safari || mozes){
			oj.onload = function () { callback(oj); }
		} else {
		
			oj.onreadystatechange =function () 
			{
				if ( oj.readyState == 4 ){
					callback(oj);
				}
			}
		}

		//URLエンコード
		data = uriEncode(data)
		if(method.toUpperCase() == 'GET') {
			url += data
		}
		
		//open メソッド
		oj.open(method,url,async,user,password);

		//ヘッダapplication/x-www-form-urlencodedセット
		setEncHeader(oj)

		//デバック
		//alert("////jslb_ajaxxx.js//// \n data:"+data+" \n method:"+method+" \n url:"+url+" \n async:"+async);
		
		//send メソッド
		oj.send(data);

		//URIエンコードヘッダセット
		function setEncHeader(oj){
	
			//ヘッダapplication/x-www-form-urlencodedセット
			// @see  http://www.asahi-net.or.jp/~sd5a-ucd/rec-html401j/interact/forms.html#h-17.13.3
			// @see  #h-17.3
			//   ( enctype のデフォルト値は "application/x-www-form-urlencoded")
			//   h-17.3により、POST/GET問わず設定
			//   POSTで"multipart/form-data"を指定する必要がある場合はカスタマイズしてください。
			//
			//  このメソッドがWin Opera8.0でエラーになったので分岐(8.01はOK)
			var contentTypeUrlenc = 'application/x-www-form-urlencoded; charset=UTF-8';
			if(!window.opera){
				oj.setRequestHeader('Content-Type',contentTypeUrlenc);
			} else {
				if((typeof oj.setRequestHeader) == 'function')
					oj.setRequestHeader('Content-Type',contentTypeUrlenc);
			}	
			return oj
		}

		//URLエンコード
		function uriEncode(data){

			if(data!=""){
				//&と=で一旦分解しencode
				var encdata = '';
				var datas = data.split('&');
				for(i=1;i<datas.length;i++)
				{
					var dataq = datas[i].split('=');
					encdata += '&'+encodeURIComponent(dataq[0])+'='+encodeURIComponent(dataq[1]);
				}
			} else {
				encdata = "";
			}
			return encdata;
		}


		return oj
	}

