//==============================================================================
//  SYSTEM      :  暫定版跨瀏覽器Ajax用程式庫
//  PROGRAM     :  以XMLHttpRequest進行資料來回傳輸
//                 採用請求表頭進行認證，取代open()之認證功能的分支版本。
//                 希望藉此讓讀者們試用高階JavaScript技巧之base64編碼
//                 http://www.onicos.com/staff/iz/amuse/javascript/expert/
//  FILE NAME   :  ajasql_ajaxXXX_auth2.js
//  CALL FROM   :  Ajax 客戶端
//  AUTHER      :  Toshirou Takahashi http://jsgt.org/mt/01/
//  SUPPORT URL :  http://jsgt.org/mt/archives/01/000409.html
//  CREATE      :  2005.6.26
//  UPDATE      :  v0.36_auth2 2005.7.25 以請求表頭Authorization
//  UPDATE      :  v0.36 2005.7.20 發現(oj.setRequestHeader)在winie會傳回unknown
//                                 問題已修正（雖是unknown但能動）
//  UPDATE      :  v0.35 2005.7.19 調整POST的Content-Type設定以支援Opera8.01
//  UPDATE      :  v0.34 2005.7.16 在sendRequest_auth2()新增user,password引數
//  UPDATE      :  v0.33 2005.7.3  將Query Component(GET)的&與=以外字元
//                                 全以encodeURIComponent完全跳脫之。
//  TEST-URL    :  表頭 http://jsgt.org/ajax/ref/lib/test_head.htm 之
//  TEST-URL    :  認證 http://jsgt.org/mt/archives/01/000428.html
//  TEST-URL    :  非同步 
//        http://allabout.co.jp/career/javascript/closeup/CU20050615A/index.htm
//  TEST-URL    :  SQL     http://jsgt.org/mt/archives/01/000392.html
//------------------------------------------------------------------------------
// 最新情報 http://jsgt.org/mt/archives/01/000409.html 
// 上述資訊不得刪除。商業使用、改造自由。不需連絡。
// 改造版本資訊請追加在下面。
//
//   2006.2  註解譯為繁體中文 (DrMaster)
//

	////
	// 建立XMLHttpRequest物件
	//
	// @sample           oj = createHttpRequest()
	// @return           XMLHttpRequest物件(實體)
	//
	function createHttpRequest()
	{
		if(window.ActiveXObject){
			 //Win e4,e5,e6
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
			 //Win Mac Linux m1,f1,o8 Mac s1 Linux k3
			return new XMLHttpRequest() ;
		} else {
			return null ;
		}
	}
	
	////
	// 收發訊函式
	//
	// @sample           sendRequest_auth2(onloaded,'&prog=1','POST','./about2.php',true,true)
	// @param callback   收到訊息時要執行的函式名（回呼函式）
	// @param data	      要送出的資料
	// @param method     "POST" or "GET"
	// @param url        要請求之URL
	// @param async	   true:非同步 / false:同步
	// @param sload	   強制載入 true:強制 / 省略或false:預設值
	// @param user	      認證頁面用使用者名稱
	// @param password   認證頁面用密碼
	//
	function sendRequest_auth2(callback,data,method,url,async,sload,user,password)
	{
		// 建立XMLHttpRequest物件
		var oj = createHttpRequest();
		if( oj == null ) return null;
		
		// 設定強制載入
		var sload = (!!sendRequest_auth2.arguments[5])?sload:false;
		if(sload)url=url+"?t="+(new Date()).getTime();
		
		// 瀏覽器判定
		var ua = navigator.userAgent;
		var safari	= ua.indexOf("Safari")!=-1;
		var konqueror = ua.indexOf("Konqueror")!=-1;
		var mozes	 = ((a=navigator.userAgent.split("Gecko/")[1] )
				?a.split(" ")[0]:0) >= 20011128 ;
		
		// 收訊處理
		// opera會有onreadystatechange重複發生錯誤，改用onload較安全
		// Moz,FireFox在oj.readyState==3也能讀取資料，故採onload也比較安全
		// Win ie下onload不能跑
		// Konqueror的onload不太穩
		// 參考http://jsgt.org/ajax/ref/test/response/responsetext/try1.php
		if(window.opera || safari || mozes){
			oj.onload = function () { callback(oj); }
		} else {
		
			oj.onreadystatechange =function () 
			{
				if ( oj.readyState == 4 ){
					callback(oj);
				}
			}
		}

		// URL編碼
		if(method == 'GET') {
			if(data!=""){
				// 以&與=先分解再編碼
				var encdata = '';
				var datas = data.split('&');
				//
				for(i=0;i<datas.length;i++)
				{
					var dataq = datas[i].split('=');
					encdata += '&'+encodeURIComponent(dataq[0])+'='+encodeURIComponent(dataq[1]);
				}
				url=url + encdata;
			}
		}
		
		// open 方法
		oj.open(method,url,async);


		// base64 Basic認證
		var b64 = base64encode(user+':'+password)
		oj.setRequestHeader('Authorization','Basic '+b64);
		
		
		// 設定表頭
		if(method == 'POST') {
		
			// 這個函式在Win Opera8.0無法正常執行，故獨立處理(8.01則OK)
			if(!window.opera){
				oj.setRequestHeader('Content-Type','application/x-www-form-urlencoded; charset=UTF-8');
			} else {
				if((typeof oj.setRequestHeader) == 'function')
					oj.setRequestHeader('Content-Type','application/x-www-form-urlencoded; charset=UTF-8');
			}
		} 

		// 偵錯
		//alert("////jslb_ajaxxx.js//// \n data:"+data+" \n method:"+method+" \n url:"+url+" \n async:"+async);
		
		// send 方法
		oj.send(data);
		

	}

