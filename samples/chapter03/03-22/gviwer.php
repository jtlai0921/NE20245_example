<?php 
  // 將輸出設定為UTF-8
  #mb_http_output ( 'UTF-8' );
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
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

  if ( !$db ) {echo "無法連接資料庫";}
  else {
    // 從尾端取出最新的一筆
    $sql = "select * from $tableName where id = 48 order by id desc limit 1";
    $result = sqlite_query($db, $sql);
    while ($data = sqlite_fetch_array($result)){
      $newichi = $data[2];
    }
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
    

  // 從PHP傳遞資料給JavaScript
  var newichi = "<?php echo($newichi); ?>";
  var lon  = newichi.split(":::")[4].split(",")[1]
  var lat  = newichi.split(":::")[3].split(",")[1]
  var time = newichi.split(":::")[6].split(",")[1]
  lat100 = eval(lat)
  lon100 = eval(lon)
    
    
  var map = new GMap(document.getElementById("map"));
  map.addControl(new GLargeMapControl());
  map.addControl(new GMapTypeControl());
  map.centerAndZoom(new GPoint(lon100, lat100), 1);

  // 建立圖示
  var icon = new GIcon();
  icon.image = "./yazirusi.png";
  icon.shadow = "./shadow.png";
  icon.iconSize = new GSize(20, 34);
  icon.shadowSize = new GSize(37, 34);
  icon.iconAnchor = new GPoint(10,34);
  var marker = new GMarker(map.getCenterLatLng(), icon);
  
  // 疊合
  map.addOverlay(marker);
  
  //]]>
  </script>
顯示GPS手機的位置
  </body>
</html>




