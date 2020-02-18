//--jslb----------------------------------------------------------------------------
// 最新資訊   : http://jsgt.org/mt/01/
// 無著作權標示義務。商用、改造均自由。無需連絡。

  ////
  // jsgt_progressBar 進度桿物件
  //
  // @author     Toshirou Takahashi http://jsgt.org/mt/archives/01/000543.html
  // @version    0.01 
  // @license    無著作權標示義務。商用、改造均自由。無需連絡。
  // @sample     oj = new jsgt_progressBar()           //自動建立DIV
  // @sample     oj = new jsgt_progressBar('nloading') //使用現有的DIV名
  // @param  id  プログレス用DIVのID名(デフォルト_progress)
  // @method     oj.prog_start()             開啟進度桿
  // @method     oj.prog_stop()              停止進度桿
  // @property   oj.progress.div             用來輸出進度桿的div物件
  // @property   oj.progress.div.style       樣式表物件
  // @property   oj.progress.prog_bar        進度桿的符號(預設是'|')
  // @property   oj.progress.prog_interval   進度間隔(預設是50 1/1000秒) 
  // @property   oj.progress.prog_count_max  進度桿最大值Max(預設是18)
  // @return     進度桿物件的實體
  // @see        http://jsgt.org/ajax/
  // 

  if(document.getElementsByTagName('BODY').length==0)document.write('<body>')//ダミーのbodyタグ

  function jsgt_progressBar(id)
  {
    this.progress =  setProgressBars(id) ;
    function setProgressBars(id)
    {
      // 用來輸出進度桿的div
      if(!id){
        id = "_progress";
        var creprgDIV = document.createElement("DIV") ;
        this.div = document.body.appendChild(creprgDIV)       ;
        this.div.setAttribute("id",id) ;
  
        this.div.style.position ="absolute";
        this.div.style.top ="0px";
        this.div.style.left ="0px";
        this.div.style.width ="0px";
        this.div.style.height ="0px";

      } else {
        this.div = document.getElementById(id)
      }

      // 進度桿用DIV的預設値 (可改寫物件實體更改之)
      this.div.style.color = 'red';   //顏色
      this.div.style.margin = '0px';  //外邊界
      this.div.style.padding = '4px'; //內邊界

      // 進度桿的預設值
      this.prog_bar= '|';             //使用文字
      this.prog_interval= 50;         //間隔
      this.prog_count =0;             //初始數
      this.prog_count_max =18;        //最大值

      var prog_array= [];             //存放計時器Timer ID用的陣列

      //進度桿開始
      this.prog_start = function ()
      {
        //指定大小並顯示
        this.div.style.height ="12px";
        this.div.style.width ="auto";
        prog_array.unshift(
          setInterval(
            //輸出進度桿
            function ()
            {
              if(this.prog_count >= this.prog_count_max){
                this.div.innerHTML = '' ; //初始化
                this.prog_count =0;
              }
              this.div.innerHTML += this.prog_bar ;
              this.prog_count++ ;
            }
            , this.prog_interval 
          )
        )
      }
  
      //進度桿停止
      this.prog_stop = function ()
      {
        clearInterval(prog_array[0])
        //刪除停止的計時器
        prog_array.shift()
        //刪除
        this.div.style.width ="0px";
        this.div.style.height ="0px";
        this.div.innerHTML  = '' ;
      }
  
      return this
    }
  
  }

