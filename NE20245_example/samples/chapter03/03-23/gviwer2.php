<?php 
  // 設定以UTF-8輸出
  #mb_http_output ( 'UTF-8' );
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" 
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <head><title>for Ajax</title>
    <style type="text/css">
    v\:* {
      behavior:url(#default#VML);
    }
    </style>
    <!-- 下面的 API Key 請務必改成自己從 http://www.google.com/apis/maps/ 取得的值 -->
    <script src="http://maps.google.com/maps?file=api&v=1&key=ABQ****(請換成自己的API Key)****DMdcg" type="text/javascript"></script>
  </head>   
 <body>
<?php 

  // 開啟資料庫
  $db = sqlite_open('./db/mydb.db');
  $tableName = 'blog_bbs_2';

  $data = "";

  if ( !$db ) {
    echo "無法連接資料庫";
  } else {
    $sql = "SELECT * FROM $tableName WHERE id >= 14 AND id <= 30 ORDER BY id DESC";
    $result = sqlite_query($db, $sql);
    $cnt = 0;
    $data = "";

    ?>
    <script type="text/javascript">
    //<![CDATA[

    var latlontime = []

    <?php
    while ($data = sqlite_fetch_array($result)){

      // 切割欄位
      $ichi_lists = split(":::",$data[2]);
      $lons  =  trim($ichi_lists[4]);
      $lats  =  trim($ichi_lists[3]);
      $times =  trim($ichi_lists[6]);
      $lon   = split(",",$lons);
      $lat   = split(",",$lats);
      $time  = split(",",$times);
      
      // 將座標、時間資料輸出成JSON形式
      $newichi = "{ lon:".$lon[1]." ,lat:".$lat[1]." ,time:".$time[1]." }" ;

      ?>
      
      // 傳遞給JavaScript
      latlontime[<?php echo($cnt); ?>] = <?php echo($newichi); ?> ;
      <?php

      $cnt++ ;
    }

    ?>
    //]]>
    </script>
    <?php

    sqlite_close($db);
  }

  ?>

  <div id="map" style="width: 500px; height: 400px"></div>
  <script type="text/javascript">
  //<![CDATA[
    // 配合2005.12.1 GoogleMaps改採世界座標系(wgs84)的修改
    // 2005.12.1之後還想沿用2005.11.30之前的日本座標系資料時
    // 在使用前請將GPoint類別覆寫如下。
    // 要改用世界座標系(wgs84)則不要這一段
    // ※譯注: 這是兩個座標系概略的換算公式 離島誤差很大
    // http://jsgt.org/mt/archives/01/000646.html
    //
    GPoint = function (a,b){
        this.y = b - b * 0.00010695  + a * 0.000017464 + 0.0046017;
        this.x = a - b * 0.000046038 - a * 0.000083043 + 0.010040;
    }
 
 
  var center = Math.floor(latlontime.length/2);
  
  var map = new GMap(document.getElementById("map"));
  map.addControl(new GLargeMapControl());
  map.centerAndZoom(new GPoint(latlontime[center-1].lon, 
                               latlontime[center-1].lat), 4);

  var points = [];
  for (i=0 ; i < latlontime.length ; i++){
    lat100 =  latlontime[i].lat
    lon100 =  latlontime[i].lon
    points.push(new GPoint(lon100,lat100));
  }
  map.addOverlay(new GPolyline(points,'#ff00ff',5,0.7));

  //]]>
  </script>
  </body>
</html>




