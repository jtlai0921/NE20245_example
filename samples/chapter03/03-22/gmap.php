
<?php 

  // 開啟資料庫
  $db = sqlite_open('./db/mydb.db');
  $tableName = 'gmap_2';

  $data = "";
  if ( !$db ) { echo "無法連線資料庫"; }
  else {
    while ( list($key , $val ) = each( $_GET ) ){
      $data .= $key .",". $val .":::";
    }
    $time = date("Y.m.d H:i:s");

    // 消毒
    $data = sqlite_escape_string($data);
    // SQL處理 登錄資料
    $sql = "insert into $tableName values( Null,'test','$data','$time','');";
    echo($sql);
    $result = sqlite_query($db, $sql);
    sqlite_close($db);
  }

?>