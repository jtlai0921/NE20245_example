//--jslb----------------------------------------------------------------------------
// 最新資訊   : http://jsgt.org/mt/01/
// 不用標示著作權。商用、改造均自由。免連絡。

////
//Ajax快取機構
//  將讀入的檔案資料存入陣列，不重新載入資料，直接使用。
//  在進行Ajax讀取的部份設定成無視瀏覽器快取的強制載入，
//  則瀏覽器不會進行快取的動作，是否快取可自我掌控。
//
//@sample cacheAjaxOj = new cacheAjax('http://jsgt.org/ajax/newmon/tools/php/getfile.php','bodys');
//@param  url           HTTP請求對象
//@param  outputDivId   HTTP回應之輸入DIVid名
//@requires             jslb_ajax038.js 簡易Ajax函式庫http://jsgt.org/mt/archives/01/000409.html
//@requires             jslb_progressbar001.js 進度桿
//@see                  http://jsgt.org/ajax/
//
function cacheAjax(url,outputDivId){

  //
  //@sample cacheAjaxOj.getFile('chapter03.htm',callback)
  //@parem fileName 檔名
  //@parem callback 收訊時的回呼函式名
  this.getFile     = getFileSwt;

  this.cachenabled = true ;

  var pbarAry  = [];  //進度桿用陣列
  var pageAry  = [];  //頁面資料用陣列

  //目錄預載
  function preload(fileName,callback){

    //建立進度桿物件
    pbarAry[fileName] = new jsgt_progressBar();
    //啟動進度桿
    pbarAry[fileName].progress.prog_start();
    
    //發出請求
    sendRequest(onloaded_pre,'&file='+fileName,'POST',url,true,true);
    //回呼函式處理
    function onloaded_pre(oj){ 
      //接收
      pageAry[fileName] = decodeURIComponent(oj.responseText) ;
      //輸出
      writePage(pageAry[fileName],callback);
      //停止進度桿
      pbarAry[fileName].progress.prog_stop();
    }

  }

  //取得檔案切換
  //
  function getFileSwt(fileName,callback){
    if(!pageAry[fileName]||!this.cachenabled)preload(fileName,callback);
    else                  writePage(pageAry[fileName],callback);
  }
  
  //輸出頁面資料
  function writePage(pagedata,callback){
    if(!pagedata || !document.getElementById(outputDivId))return;
    document.getElementById(outputDivId).innerHTML='<pre>'+pagedata+'</pre>' ;
    if(callback)callback();
  }

}