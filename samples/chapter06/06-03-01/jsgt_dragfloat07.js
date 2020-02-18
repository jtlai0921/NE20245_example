//=====================================================================
//  SYSTEM      :  DragableFloat DIV
//  PROGRAM     :  能夠拖曳，並在畫面捲動時固定在畫面特別位置的DIV
//  FILE NAME   :  jsgt_dragfloat.js
//  CALL FROM   :  HTML
//  AUTHER      :  Toshirou Takahashi http://jsgt.org/mt/01/
//  SUPPORT URL :  http://jsgt.org/mt/archives/01/000419.html
//  CREATE      :  2005.7.8
//  UPDATE      :  2005.9.26  v07 新增floatEnabled boundEnabled setBounds chkBounds
//  UPDATE      :  2005.9.22  v06 將getTOP getLEFT getMouseX getMouseY加入div的屬性
//  UPDATE      :  2005.8.12  v05 將拖曳時ie會發生的select以onselectstart無效化
//  UPDATE      :  2005.8.10  v04 一定程度上解決拖曳時無法捕捉iframe上之事件的問題
//  UPDATE      :  2005.8.8   新增dbg_echo()
//  UPDATE      :  2005.8.8   沒有body標籤時輸出假的body
//  UPDATE      :  2005.7.8   支援 DOCTYPE 標準模式
//                   參考 http://otd8.jbbs.livedoor.jp/877597/bbs_tree?base=9322&range=1
//
//
// 您可自由修改本指令碼或用於商業用途
// 為了保持這些自由，作者並不放棄著作權。
//---------------------------------------------------------------------
// 高橋登史朗 (Toshirou Takahashi http://jsgt.org/mt/01/) 2005.7.8

/*
//=====================================================================
// 以下範例

<-- 程式庫  jsgt_dragfloat.js-->
<script type    = 'text/javascript'
        charset = 'UTF-8'
        src     = 'jsgt_dragfloat.js'></script>
<script type='text/javascript'>
<!--

////
// 運作開始
//
// 在頁面載入後開始運作
//
window.onload = function ()
{
    setDragableFloat() //設定
}

////
// 設定
//
// @syntax oj = dragableFloat("DIV的ID名",初始位置X,初始位置Y)
//
// @sample              div1 = dragableFloat("aaa",100,200) //建立
// @sample              div1.innerHTML="床前明月光"         //插入HTML
// @sample              div1.style.backgroundColor='orange' //以CSS修飾
// @sample              doDragableFloat()                   //開始
//    
function setDragableFloat()
{
    //建立可拖曳之浮動DIV
    div1 = dragableFloat("aaa",100,200)
    div2 = dragableFloat("fff",200,300)
    div3 = dragableFloat("ddd",250,300)
    
    //對各DIV插入HTML
    div1.innerHTML="aaaaaaaa"
    div2.innerHTML="fffffff"
    div3.innerHTML="xx"

    //以CSS修飾
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



// 範例到此為止
//=====================================================================
 */
 





////
// 全域變數
//
// @var    zcount             所有可拖曳DIV中，現在zindex的最大值
// @var    clickElement       現在正在拖曳的DIV之ID名
// @var    canvas             支援 document.body 的DOCTYPE標準模式
// @array  dragableFloatId    存放所有可拖曳DIV的ID名
//
var zcount = 0          ;
var clickElement = ""   ;
if(document.getElementsByTagName('BODY').length==0)document.write('<body>')//偽造body標籤
var canvas = document[ 'CSS1Compat' == document.compatMode ? 'documentElement' : 'body'];
var dragableFloatId=[]  ;
var recx1,recy1,recx2,recy2,recxOffset,recyOffset


////
// 將所有可拖曳DIV就緒
//
//
function doDragableFloat()
{ 

  for(i in dragableFloatId){ 
    var oj = document.getElementById(dragableFloatId[i]) ;
    if(oj.floatEnabled){

      if(!(is.safari || is.khtml))
      {
        // 拖曳時的動作
        window.onscroll = function(e){
            moveDiv(oj,oj.style.left,oj.style.top);
        }
      } else {
        aaa=setInterval(function(){
          moveDiv(oj,oj.style.left,oj.style.top);
        },100)
      }
    }
  }
}

// 開始所有可拖曳DIV的浮動
function startDragableFloat()
{
    for(i in dragableFloat ){
        var oj = document.getElementById(dragableFloat[i].id) ;
        moveDiv(oj,oj.style.left,oj.style.top);
    }
}

// 令DIV漂浮
function moveDiv (oj,ofx,ofy)
{
    if(oj.draging)return  ;//拖曳中則忽略
    if(oj.dragcnt == 0 ){ 
        ofx = parseInt(ofx,10) 
        ofy = parseInt(ofx,10) 
        oj.dragcnt++
    } else {//偏移拖曳之結束位置
        ofx = parseInt(oj.pageOffLeft,10) 
        ofy = parseInt(oj.pageOffTop,10) 
    }
    var l = parseInt(canvas.scrollLeft,10) 
    var t = parseInt(canvas.scrollTop,10) 
    oj.style.left = l + ofx+"px"
    oj.style.top  = t + ofy+"px"
}


////
//瀏覽器判定
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
// 建立可拖曳之浮動DIV
//
// @sample          div1 = dragableFloat("aaa",100,200)
//

function dragableFloat(id,x,y)
{
    if(!!dragableFloatId[id]) return document.getElementById(id)
    
    ////
    // 建立DIV生成
    // @param  id             DIV的ID
    //
    this.mkDiv = function (id) 
    {
        var canvas = document[ 'CSS1Compat' == document.compatMode ? 'documentElement' : 'body'];
        var doc   = document                           ; // document物件
        var body  = doc.body                           ;
        var elem  = doc.createElement("DIV")           ; // 建立DIV元素
        var div   = body.appendChild(elem);
            div.setAttribute("id",id)                   ;
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
            div.getTOP         = getTOP               ;
            div.getLEFT        = getLEFT              ;
            div.getMouseX      = getMouseX            ;
            div.getMouseY      = getMouseY            ;
            recx1              = x
            recy1              = y
            div.floatEnabled   = true                 ; //可浮動 true|false
            div.boundEnabled   = false                ; //限制可拖曳範圍 true|false
            div.setBounds      = function (a,b,c,d){
                div.minX=a;div.minY=b;div.maxX=c;div.maxY=d;
                div.boundEnabled = true;
            }
            div.onmouseout     = function (e){ 

                if(!clickElement) return
                selLay=document.getElementById(clickElement);

                // 當xy錯誤時用來類推追跡用的xy值
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

                // 捕捉DIV的left,top直到游標位置之間的偏移值
                if (selLay){    
                    selLay.offLeft = getMouseX(e) - getLEFT(selLay.id)
                    selLay.offTop  = getMouseY(e) - getTOP(selLay.id)
                
                } 
                return false
            }

        dragableFloatId[div.id] = div.id;//對window登錄
        div.index++;
        return div;
    }

    // 滑鼠移動時的動作
    document.onmousemove  = function (e)
    {
        recTimeOffset(e) //rec
        follow(e)
        //return false
    }
    
    // 滑鼠釋放時的動作
    document.onmouseup  = function (e)
    {
        if(!clickElement) return
        selLay=document.getElementById(clickElement);
        
        // 在拖曳中途跳開時
        follow(e)
        
        // 停止拖曳
        selLay.draging   = false ;
        selLay.style.zIndex = zcount++

        // 捕捉畫面內left,top的偏移位置
        if (selLay){
            var sl = parseInt(canvas.scrollLeft,10)
            var st = parseInt(canvas.scrollTop,10)
            selLay.pageOffLeft = getLEFT(selLay.id)-sl
            selLay.pageOffTop  = getTOP(selLay.id)-st
        }
        return false
    }

    // 拖曳失敗時的類推追跡
    function follow(e)
    {
        if(!clickElement) return
        selLay=document.getElementById(clickElement);

        // 取得滑鼠位置
        var x = getMouseX(e)
        var y = getMouseY(e)

        // 當xy錯誤時用來類推追跡用的xy值
        x = (x == -1)? recx2+=recxOffset : x ;
        y = (y == -1)? recy2+=recyOffset : y ;
        if(x == -1 && y == -1)setTimeout('follow('+e+')',100)

        dofollow(x,y)
    }

    // 滑鼠追跡
    function dofollow(x,y)
    {
        if(!clickElement) return
        selLay=document.getElementById(clickElement);
        if(!chkBounds(selLay)){
          return
        } else {
          if(selLay.draging){
            // 減掉偏移值追蹤之
            movetoX = x - selLay.offLeft
            movetoY = y - selLay.offTop
            selLay.style.left = parseInt(movetoX,10) +"px"
            selLay.style.top  = parseInt(movetoY,10) +"px"
          }
        }
       // window.status = selLay.style.left
    }

    // 記錄滑鼠位置
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
    
    // 檢查是否在指定區域內
    function chkBounds(oj){

      var layName = oj.id
      if(oj.boundEnabled){
      
        // 取得現在位置
        var nowX = getLEFT(layName);
        var nowY = getTOP(layName);
        // 檢查
        if( 
          nowX >= oj.minX &&
          nowY >= oj.minY &&
          nowX <= oj.maxX &&
          nowY <= oj.maxY
        ){
          return true //若在指定區域內則true
        } else {
          returnPOS(nowX,nowY,oj)
          return false
        }
      } else {
        return true
      }
    }

    // 回到區域內
    function returnPOS(nowX,nowY,oj){
      if(nowX < oj.minX) oj.style.left = oj.minX +"px"
      if(nowY < oj.minY) oj.style.top  = oj.minY +"px"
      if(nowX > oj.maxX) oj.style.left = oj.maxX +"px"
      if(nowY > oj.maxY) oj.style.top  = oj.maxY +"px"
    }

    // 取得滑鼠X座標
    function getMouseX(e)
    {
        if(document.all)               //e4,e5,e6用
            return canvas.scrollLeft+event.clientX
        else if(document.getElementById)    //n6,n7,m1,o7,s1用
            return e.pageX
    }

    // 取得滑鼠Y座標
    function getMouseY(e)
    {
        if(document.all)               //e4,e5,e6用
            return canvas.scrollTop+event.clientY
        else if(document.getElementById)    //n6,n7,m1,o7,s1用
            return e.pageY
    }


    // 取得圖層左端X座標
    function getLEFT(layName){
        //偵錯
        //document.getElementById('aaa').innerHTML+=layName+'<BR>'
        
        if(document.all)                    //e4,e5,e6,o6,o7用
            return document.all(layName).style.pixelLeft
        else if(document.getElementById)    //n6,n7,m1,s1用
            return (document.getElementById(layName).style.left!="")
                ?parseInt(document.getElementById(layName).style.left):""
    }

    //取得圖層上端Y座標
    function getTOP(layName){
        if(document.all)                    //e4,e5,e6,o6,o7用
            return document.all(layName).style.pixelTop
        else if(document.getElementById)    //n6,n7,m1,s1用
            return (document.getElementById(layName).style.top!="")
                    ?parseInt(document.getElementById(layName).style.top):""
    }

    // 偵錯
    function dbg_echo(){
            ////////dbg.innerHTML += selLay.draging+"<br>"
            
        var debugDIV  = document.createElement("DIV")  ; //建立DIV元素
        var dbg   = document.body.appendChild(debugDIV);
            dbg.setAttribute("id","dbg")                   ;
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
		