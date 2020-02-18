<?xml version="1.0" encoding="utf-8" ?> 
  <xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" >
  <xsl:template match="/"> 
    <HTML>
      <BODY>
        <TABLE border="0">
          <TR>
           <TD><xsl:apply-templates select="lists/item" /></TD>
          </TR>
        </TABLE>
      </BODY>
    </HTML>
  </xsl:template> 
  
  <xsl:template match="item">
  【<xsl:value-of select="info" />】<br />
  <TABLE border="1" width="100%">
    <TR>
      <TH>項目</TH><TH>data</TH>
    </TR>
    <TR>
      <TD>名稱</TD><TD><xsl:value-of select="name" /></TD>
    </TR>
    <TR>
      <TD>資訊</TD><TD><xsl:value-of select="info" /></TD>
    </TR>
    <TR>
      <TD>經度</TD><TD><xsl:value-of select="lon" /></TD>
    </TR>
    <TR>
      <TD>緯度</TD><TD><xsl:value-of select="lat" /></TD>
    </TR>
    </TABLE>
    </xsl:template>
  </xsl:stylesheet>