// ================================================================
//  jkl-parsexml.js ---- JavaScript Kantan Library for Parse XML
//  Copyright 2005 Kawasaki Yusuke <u-suke@kawa.net>
// ================================================================
//  v0.01  2005/05/18  first release
//  v0.02  2005/05/20  Opera 8.0beta may be abailable but somtimes crashed
//  v0.03  2005/05/20  overrideMimeType( "text/xml" );
//  v0.04  2005/05/21  class variables: REQUEST_TYPE, RESPONSE_TYPE
//  v0.05  2005/05/22  use Msxml2.DOMDocument.5.0 for GET method on IE6
//  v0.06  2005/05/22  CDATA_SECTION_NODE
//  v0.07  2005/05/23  use Microsoft.XMLDOM for GET method on IE6
// ================================================================

if ( typeof(JKL) == 'undefined' ) JKL = function() {};

//  JKL.ParseXML constructor

JKL.ParseXML = function ( url, query ) {
    // debug.print( "new JKL.ParseXML( '"+url+"', '"+query+"' );" );
    this.url    = url;
    this.method = ( typeof(query) == "string" ) ? "POST" : "GET";
    this.query  = ( typeof(query) == "string" ) ? query : null;
    this.async_done = false;
    return this;
};

//  class variables

JKL.ParseXML.MAP_NODETYPE = [
    "",
    "ELEMENT_NODE",                 // 1
    "ATTRIBUTE_NODE",               // 2
    "TEXT_NODE",                    // 3
    "CDATA_SECTION_NODE",           // 4
    "ENTITY_REFERENCE_NODE",        // 5
    "ENTITY_NODE",                  // 6
    "PROCESSING_INSTRUCTION_NODE",  // 7
    "COMMENT_NODE",                 // 8
    "DOCUMENT_NODE",                // 9
    "DOCUMENT_TYPE_NODE",           // 10
    "DOCUMENT_FRAGMENT_NODE",       // 11
    "NOTATION_NODE"                 // 12
];

JKL.ParseXML.REQUEST_TYPE  = "application/x-www-form-urlencoded";
JKL.ParseXML.RESPONSE_TYPE = "text/xml";
JKL.ParseXML.ACTIVEX_XMLDOM  = "Microsoft.XMLDOM";  // Msxml2.DOMDocument.5.0
JKL.ParseXML.ACTIVEX_XMLHTTP = "Microsoft.XMLHTTP"; // Msxml2.XMLHTTP.3.0

//  define callback function (ajax)

JKL.ParseXML.prototype.async = function ( func, args ) {
    this.callback_func = func;       // callback function
    this.callback_arg  = args;       // first argument
};

JKL.ParseXML.prototype.onerror = function ( func, args ) {
    this.onerror_func = func;       // callback function
};

//  every child/children into array
JKL.ParseXML.prototype.setOutputArrayAll = function () {
    this.setOutputArray( true );
}
//  a child into scalar, children into array
JKL.ParseXML.prototype.setOutputArrayAuto = function () {
    this.setOutputArray( null );
}
//  every child/children into scalar (first sibiling only)
JKL.ParseXML.prototype.setOutputArrayNever = function () {
    this.setOutputArray( false );
}
//  specified child/children into array, other child/children into scalar
JKL.ParseXML.prototype.setOutputArrayElements = function ( list ) {
    this.setOutputArray( list );
}
//  specify how to treate child/children into scalar/array
JKL.ParseXML.prototype.setOutputArray = function ( mode ) {
    if ( typeof(mode) == "string" ) {
        mode = [ mode ];                // string into array
    }
    if ( mode && typeof(mode) == "object" ) {
        if ( mode.length < 0 ) {
            mode = false;               // false when array == [] 
        } else {
            var hash = {};
            for( var i=0; i<mode.length; i++ ) {
                hash[mode[i]] = true;
            }
            mode = hash;                // array into hashed array
            if ( mode["*"] ) {
                mode = true;            // true when includes "*"
            }
        } 
    } 
    this.usearray = mode;
}

//  Download a remote XML file and parse it.

JKL.ParseXML.prototype.parse = function () {

    var http = new JKL.ParseXML.HTTP( this.method );
    // debug.print( "JKL.ParseXML.HTTP: "+http );
    if ( ! http ) return;

    if ( this.onerror_func ) http.onerror = this.onerror_func;

    if ( this.callback_func ) {                             // async mode
        var copy = this;
        var proc = function() {
            var dom = http.documentElement();
            var d2j = new JKL.ParseXML.JSON( copy.usearray );
            var json = d2j.parseDocument( dom );
            copy.callback_func( json, copy.callback_arg );  // call back
        };
        http.load( this.url, this.query, proc );
    } else {                                                // sync mode
        http.load( this.url, this.query, null );
        var dom = http.documentElement();
        var d2j = new JKL.ParseXML.JSON( this.usearray );
        var json = d2j.parseDocument( dom );
        return json;
    }
};

// ================================================================

JKL.ParseXML.HTTP = function( method ) {
    this.req = null;
    this.method = method;
    this.xmlhttp = false;
    this.xmldom = false;
    this.onerror = null;

    if ( window.ActiveXObject ) {
        if ( method == "GET" ) {                    // IE GET
            // debug.print( 'new ActiveXObject( "'+JKL.ParseXML.ACTIVEX_XMLDOM+'" )' );
            this.req = new ActiveXObject( JKL.ParseXML.ACTIVEX_XMLDOM );
            if ( this.req ) this.xmldom = true;
        } else {                                    // IE POST
            // debug.print( 'new ActiveXObject( "'+JKL.ParseXML.ACTIVEX_XMLHTTP+'" )' );
            this.req = new ActiveXObject( JKL.ParseXML.ACTIVEX_XMLHTTP );
            if ( this.req ) this.xmlhttp = true;
        }
//  } else if ( method == "GET" &&
//              document.implementation && 
//              document.implementation.createDocument ) {
//      // debug.print( "document.implementation.createDocument()" );
//      this.req = document.implementation.createDocument("", "", null);
//      if ( this.req ) this.xmldom = true;
    } else if ( window.XMLHttpRequest ) {           // Firefox, Opera
        // debug.print( "new XMLHttpRequest()" );
        this.req = new XMLHttpRequest();
        if ( this.req ) this.xmlhttp = true;
    }
    return this;
};

JKL.ParseXML.HTTP.prototype.load = function( url, query, func ) {

    // async mode when call back function is specified
    var async = func ? true : false;
    // debug.print( "async: "+ async );

    if ( this.xmlhttp ) {
        // open
        // debug.print( "open( '"+this.method+"', '"+url+"', "+async+" );" );
        this.req.open( this.method, url, async );

        // response Content-Type: text/xml (override)
        if ( typeof(this.req.overrideMimeType) != "undefined" ) {
            // debug.print( "Content-Type: "+JKL.ParseXML.RESPONSE_TYPE+" (response)" );
            this.req.overrideMimeType( JKL.ParseXML.RESPONSE_TYPE );
        }

        // request Content-Type: application/x-www-form-urlencoded
        if ( typeof(this.req.setRequestHeader) != "undefined" ) {
            // debug.print( "Content-Type: "+JKL.ParseXML.REQUEST_TYPE+" (request)" );
            this.req.setRequestHeader("content-type", JKL.ParseXML.REQUEST_TYPE );
        }
    }

    // set call back handler when async mode
    if ( async ) {
        var copy = this;
        copy.already_done = false;                  // not parsed yet
        var callback = function () {
            if ( copy.req.readyState != 4 ) return;
            // debug.print( "readyState: "+copy.req.readyState );
            if ( copy.xmlhttp ) {
                // debug.print( "status: "+copy.req.status+" (async mode)" );
                if ( copy.req.status != 200 && copy.req.status != 304 ) {
                    if ( copy.onerror ) copy.onerror( copy.req.status );
                    return;
                }
            }
            if ( copy.xmldom ) {
                // parseError on Microsoft.XMLDOM
                if ( copy.req.parseError && copy.req.parseError.errorCode != 0 ) {
                    // debug.print( "parseError: "+copy.req.parseError.reason );
                    if ( copy.onerror ) copy.onerror( copy.req.parseError.reason );
                    return;
                }
            }
            if ( copy.already_done ) return;        // parse only once
            copy.already_done = true;               // already parsed
            func();                                 // call back
        };
        this.req.onreadystatechange = callback;
        // this.req.onload = func;  // document.implementation.createDocument
    }

    if ( this.xmldom ) {
        this.req.async = async;

        //  send the request and query string
        // debug.print( "load( '"+url+"' );" );
        this.req.load( url );
    }

    if ( this.xmlhttp ) {
        // send the request and query string
        // debug.print( "send( '"+query+"' );" );
        this.req.send( query );
    }

    // just return when async mode
    if ( async ) return;

    if ( this.xmldom ) {
        // parseError on Microsoft.XMLDOM
        if ( this.req.parseError && this.req.parseError.errorCode != 0 ) {
            // debug.print( "parseError: "+this.req.parseError.reason );
            if ( this.onerror ) this.onerror( this.req.parseError.reason );
            return;
        }
    }

    if ( this.xmlhttp ) {
        // debug.print( "status: "+this.req.status+" (sync mode)" );
        if ( this.req.status != 200 && this.req.status != 304 ) {
            if ( this.onerror ) this.onerror( this.req.parseError.reason );
            return;
        }
    }
}

JKL.ParseXML.HTTP.prototype.documentElement = function() {
    if ( ! this.req ) return;
    if ( this.xmlhttp && this.req.responseXML ) {
        return this.req.responseXML.documentElement;
    }
    if ( this.xmldom ) {
        return this.req.documentElement;
    }
}

// ================================================================

JKL.ParseXML.JSON = function( usearray ) {
    this.usearray = usearray;
    return this;
}

//  convert from DOM to JSON 

JKL.ParseXML.JSON.prototype.parseDocument = function ( root ) {
    // debug.print( "parseDocument: "+root );
    if ( ! root ) return;

    var ret = this.parseElement( root );            // parse root node
    // debug.print( "parsed: "+ret );

    if ( this.usearray == true ) {                  // always into array
        ret = [ ret ];
    } else if ( this.usearray == false ) {          // always into scalar
        //
    } else if ( this.usearray == null ) {           // automatic
        //
    } else if ( this.usearray[root.nodeName] ) {    // specified tag
        ret = [ ret ];
    }

    var json = {};
    json[root.nodeName] = ret;                      // root nodeName
    return json;
};

//  convert from DOM Element to JSON 

JKL.ParseXML.JSON.prototype.parseElement = function ( elem ) {
    // debug.print( "nodeType: "+JKL.ParseXML.MAP_NODETYPE[elem.nodeType]+" <"+elem.nodeName+">" );

    //  COMMENT_NODE

    if ( elem.nodeType == 7 ) {
        return;
    }

    //  TEXT_NODE CDATA_SECTION_NODE

    if ( elem.nodeType == 3 || elem.nodeType == 4 ) {
        var bool = elem.nodeValue.match( /[^\u0000-\u0040]/ );
        if ( bool == null ) return;     // ignore white spaces
        // debug.print( "TEXT_NODE: "+elem.nodeValue.length+ " "+bool );
        return elem.nodeValue;
    }

    var retval;
    var cnt = {};

    //  parse attributes

    if ( elem.attributes && elem.attributes.length ) {
        retval = {};
        for ( var i=0; i<elem.attributes.length; i++ ) {
            var key = elem.attributes[i].nodeName;
            if ( typeof(key) != "string" ) continue;
            var val = elem.attributes[i].nodeValue;
            if ( ! val ) continue;
            if ( typeof(cnt[key]) == "undefined" ) cnt[key] = 0;
            cnt[key] ++;
            this.addNode( retval, key, cnt[key], val );
        }
    }

    //  parse child nodes (recursive)

    if ( elem.childNodes && elem.childNodes.length ) {
        var textonly = true;
        if ( retval ) textonly = false;        // some attributes exists
        for ( var i=0; i<elem.childNodes.length && textonly; i++ ) {
            var ntype = elem.childNodes[i].nodeType;
            if ( ntype == 3 || ntype == 4 ) continue;
            textonly = false;
        }
        if ( textonly ) {
            if ( ! retval ) retval = "";
            for ( var i=0; i<elem.childNodes.length; i++ ) {
                retval += elem.childNodes[i].nodeValue;
            }
        } else {
            if ( ! retval ) retval = {};
            for ( var i=0; i<elem.childNodes.length; i++ ) {
                var key = elem.childNodes[i].nodeName;
                if ( typeof(key) != "string" ) continue;
                var val = this.parseElement( elem.childNodes[i] );
                if ( ! val ) continue;
                if ( typeof(cnt[key]) == "undefined" ) cnt[key] = 0;
                cnt[key] ++;
                this.addNode( retval, key, cnt[key], val );
            }
        }
    }
    return retval;
};

JKL.ParseXML.JSON.prototype.addNode = function ( hash, key, cnts, val ) {
    if ( this.usearray == true ) {              // into array
        if ( cnts == 1 ) hash[key] = [];
        hash[key][hash[key].length] = val;      // push
    } else if ( this.usearray == false ) {      // into scalar
        if ( cnts == 1 ) hash[key] = val;       // only 1st sibling
    } else if ( this.usearray == null ) {
        if ( cnts == 1 ) {                      // 1st sibling
            hash[key] = val;
        } else if ( cnts == 2 ) {               // 2nd sibling
            hash[key] = [ hash[key], val ];
        } else {                                // 3rd sibling and more
            hash[key][hash[key].length] = val;
        }
    } else if ( this.usearray[key] ) {
        if ( cnts == 1 ) hash[key] = [];
        hash[key][hash[key].length] = val;      // push
    } else {
        if ( cnts == 1 ) hash[key] = val;       // only 1st sibling
    }
};

// ================================================================
// http://msdn.microsoft.com/library/en-us/xmlsdk/html/d051f7c5-e882-42e8-a5b6-d1ce67af275c.asp
// ================================================================
