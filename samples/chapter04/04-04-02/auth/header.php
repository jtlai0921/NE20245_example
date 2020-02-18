<?php

	getheader();

	function getheader()
	{
		//取得表頭
		$headers = getallheaders();
		//全部輸出
		while ( list( $name , $value ) = each ($headers) ) 
		{
			echo "$name: $value<br>";
		}
	}

?>


