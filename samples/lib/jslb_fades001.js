// @license    無標是著作權義務。商用、改造均自由。無需連絡。

////
//BG淡化
//@parem id 要做BG淡化的DIV之ID名
//@sample oj = new fadeBgclGry('contents')
//@requires             jslb_ajax038.js        簡易Ajax函式庫
//@requires             jslb_progressbar001.js 進度桿
//@requires             jslb_cacheajax001.js   Ajax快取機制
function fadeBgclGry(id){
  
  var div    = "document.getElementById('"+id+"')";
  var count  = 0;
  var tid    = 0;

  //@sample oj.doBgFade('3456789abcde')
  this.doBgFade   = function (f){
    count  = 0;
    clearInterval(tid);
    tid = setInterval( function(){fade(f)} ,30);
  }
   
  function fade(f){ 
    if(!f)var f = "3456789abcdef";
    if(count < f.length){ 
      var b = f.charAt(count);
      setBgcolor( '#'+b+b+b+b+b+b );
      count++;
    } else {
      clearInterval(tid);
    }
  } 
  
  function setBgcolor(color){
    if(document.getElementById)         //e5,e6,n6,n7,m1,o6,o7,s1用
      eval(div).style.backgroundColor =color
  }
}




////
// 跨瀏覽器淡出淡入函式
//
// @sample          fadeOpacity('drgbbs',1,0.7)
//
//   
function fadeOpacity(layName,swt,stopOpacity){
  
  if(!window.fadeOpacity[layName]) //初始化計數器
    fadeOpacity[layName] =0 

  //沒有指定方式時採用的初始值(從不透明到透明)
  if(!arguments[1]) swt = -1
  
  //引數swt為 -1 表示不透明到透明
  //           1 表示透明到不透明
  if(swt==-1)        var f  = "9876543210"
  else if(swt==1)    var f  = "0123456789"
  else               var f  = "9876543210"
  
  //沒有指定不透明度時採用的初期値
  if(!arguments[2] && swt==-1)   stopOpacity = 0
  else if(!arguments[2] && swt==1) stopOpacity = 10

  //淡化效果
  if( fadeOpacity[layName] < f.length-1 ){
  
    //從字串取出計數器值所指向的字元
    var opa = f.charAt(fadeOpacity[layName])/10

    //若達到目標不透明度則程式結束
    if( opa == stopOpacity ){
      setOpacity(layName,stopOpacity)  //結束
      fadeOpacity[layName] = 0     //清除
      return
    }
    // 修改不透明度
    setOpacity(layName,opa)
    // 累計計數器
    fadeOpacity[layName]++
    // 在50/1000秒後再次執行fadeOpacity
    setTimeout('fadeOpacity("'+layName+'","'+swt+'","'+stopOpacity+'")',50)
  } else {
    // 結束
    setOpacity(layName,stopOpacity)
    // 清除
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