
	//================================================================
	// 初始設定物件
	//  (  請設定好必要項目 )
	//

	var sqlite01 = {
		
		//伺服器使用的SQL類型
		useSQL     : 'sqlite',           // 'mysql' or 'sqlite'

		//SQL初始設定
		dbName     : '',                 // DB名(SQLite則寫DB檔案路徑)
		tblName    : '',                 // 資料表名稱

		//Ajax初始設定
		url        : '' ,                // AjaSQL閘道使用的URL
		callback   : 'onloaded1',        // 收訊時呼叫的回呼函式名
		method     : 'GET',              // GET | POST
		ascync     : true ,              // 非同步通訊 true|false
		
		//進度桿初始設定
		progress   : 'div',    // 'dragableFloat' or 'div' or 'status' or 'none'
		progressX  : '300',              // 進度桿初始位置left像素
		progressY  : '300',              // 進度桿初始位置top像素
		progressId : 'progressBarId'     // 進度桿ID名
	}

	//
	//   [初始設定] 到此為止
	//----------------------------------------------------------------
	

	//
	//SQL查詢--從郵遞區號查詢地址
	//
	function zip2addr(zip)
	{
		//輸入檢查
		if(!checkCode(zip))return
		q_num = -1;

		//送出SELECT敘述  輸入「郵遞區號」查詢地址時
		//  (從「zip」資料表的「zipcode」欄位搜尋「zip%」，列出符合項目前25筆)
		//
		asql_sendSQL(sqlite,'select * from zip where zipcode like "'+zip+'%" order by zipcode limit 25 ;')
	}

	//SQL查詢
	var q_num = 0;
	function addr2zipaddr(e, adrr)
	{
		//忽略Enter以外的請求
		if(getKEYCODE(e)!=13)return

		//送出SELECT敘述  輸入「地址的一部份」模糊搜尋郵遞區號、地址
		//  (從「zip」資料表的「address」欄位進行模糊搜尋，列出符合的前25筆)
		//
		adrr = adrr.replace(/([0-9]+)[號巷].*$/, "");
		q_num = RegExp.$1;
		if (adrr.indexOf("號") < 0 && adrr.indexOf("巷") < 0 && adrr.match(/[0-9]$/)) {
			adrr = adrr.replace(/([0-9]+)$/, "");
			q_num = RegExp.$1;
		}
		adrr = "%" + adrr + "%"
		adrr = adrr.replace(/ /, "%");
		adrr = adrr.replace(/([縣鄉鎮市區街路])/, "$1%");
		adrr = adrr.replace(/\%+/, "%");
		asql_sendSQL(sqlite,'select * from zip where address like "'+adrr+'" order by address limit 25 ;')
	}

	//回呼函式 (收到伺服器回復時執行)
	function onloaded1(resoj,reqoj)
	{
		//將回應的資料轉換成陣列 ( 以 array[行][欄] 取得 )
		var ary = getRowColArray(resoj,reqoj)

      // 過濾住址"號"的部份
      if (q_num > 0) {
			for(i=ary.length-1 ; i>=1; i--)
			{
				var f = false;
				if (ary[i][2] == 1 && (q_num % 2 == 0)) {ary.splice(i, 1); continue;}
				if (ary[i][3] == 1 && (q_num % 2 == 1)) {ary.splice(i, 1); continue;}
				if (q_num < ary[i][4].replace(/-.+$/, "") || 
				    q_num > ary[i][5].replace(/-.+$/, "")) {ary.splice(i, 1); continue;}
			}
		}

		// 包括表頭只有兩筆時表示地址確定，否則輸出候補
		if( ary.length > 2 ){
			// 將資料輸出於候補DIV
			selzip.innerHTML=outputZipLink(ary)
		} else if( ary.length == 2 ){
			// 將已確定的郵遞區號與住址複製到欄位裡
			copyadr( ary[1][0] , ((q_num > 0) ? ary[1][1] + ""+ q_num + "號" : ary[1][1]) )
			// 清除住址候補DIV
			selzip.innerHTML=''
		}
	}

	// 建立候補DIV的超連結
	function outputZipLink(resArray)
	{

		var lists =''
		for(i=1 ; i<resArray.length ; i++)
		{
			var zip  = resArray[i][0]
			var adrr = zip+' '+resArray[i][1]
			var des = ""
			if (resArray[i][4] == resArray[i][5]) {
				des += (resArray[i][4] +"號" );
			} else {
				if (resArray[i][4].replace(/-.+$/, "") > 1 && resArray[i][5].replace(/-.+$/, "") < 32767) {
					des += (resArray[i][4] +"號到" + resArray[i][5] + "號之間" );
		 		} else if (resArray[i][4] != 1) {
					des += (resArray[i][4] +"號以上");
				} else if (resArray[i][5] != 32767) {
					des += (resArray[i][5] +"號以下");
				}
				if (resArray[i][2] != resArray[i][3]) {
					des += ((des.length > 0) ? "的" : "") + (resArray[i][2]==1 ? "單號" : "雙號");
				}
			}
			if (resArray[i][6].length > 0) {
				des += ((des.length > 0) ? " " : "") + resArray[i][6];
			}
			lists += "<a href='javascript:copyadr(\""+zip+"\",\""+resArray[i][1]+"\")' >" 
			lists += adrr + "</a>"
			if (des.length > 0) lists += "<span class=\"des\">（" + des + "）</span>";
			lists += "<br>" 
		}
		return lists
	}


	// 將已確定的郵遞區號與地址複製到欄位裡
	function copyadr(zip,address)
	{
		zipfild.value=zip
		addrfild.value=address
		//清除候補DIV
		selzip.innerHTML=''
	}
	
	// 檢查郵遞區號是否正確
	function checkCode(zip){
		// 6字元或非數值時刪掉尾端字元
		if(zip.length>5 || !zip.match(/^([0-9]*)$/) || zip.charAt(zip.length-1)=='-'){ 
			zipfild.value=zip.substr(0,zip.length-1) ; return false
		} else {
			return true
		}
	}

	// 取得鍵盤碼
	function getKEYCODE(e){
		if(document.all)               //e4,e5,e6,o7用
			return  event.keyCode
		else if(document.getElementById)    //n6,n7,moz,s1,k3用
			return  e.which
	}