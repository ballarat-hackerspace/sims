<?php

$WALKDISTANCE = 833; //Average distance a person can walk in 10 minutes (m)
$RIDEDISTANCE = 2583; //Average distance a person can ride in 10 minutes (m)
$DRIVEDISTANCE = 6666; //Distance that can be driven in 10 minutes based on a 40km/h average speed (m)


$BASEURL = "http://planr.ballarathackerspace.org.au/";
$CLIENTURL = $BASEURL."sims/web/";
$APIURL = $BASEURL."sims/api/";

// Kickstart the framework
$f3=require('lib/base.php');
$f3->set('CACHE','memcache=localhost');

$f3->set('DEBUG',1);
if ((float)PCRE_VERSION<7.9)
	trigger_error('PCRE version is out of date');

$db=new \DB\SQL('mysql:host=localhost;port=3306;dbname=sims','rat','2Jr8tKH6rHZt4jTf');

$CATEGORIES = $db->exec('SELECT DISTINCT category FROM points');
$NUMSERVICES = count($CATEGORIES);

// Load configuration
$f3->config('config.ini');

$f3->route('GET /',
	function($f3) {
		$classes=array(
			'Base'=>
				array(
					'hash',
					'json',
					'session'
				),
			'Cache'=>
				array(
					'apc',
					'memcache',
					'wincache',
					'xcache'
				),
			'DB\SQL'=>
				array(
					'pdo',
					'pdo_dblib',
					'pdo_mssql',
					'pdo_mysql',
					'pdo_odbc',
					'pdo_pgsql',
					'pdo_sqlite',
					'pdo_sqlsrv'
				),
			'DB\Jig'=>
				array('json'),
			'DB\Mongo'=>
				array(
					'json',
					'mongo'
				),
			'Auth'=>
				array('ldap','pdo'),
			'Bcrypt'=>
				array(
					'mcrypt',
					'openssl'
				),
			'Image'=>
				array('gd'),
			'Lexicon'=>
				array('iconv'),
			'SMTP'=>
				array('openssl'),
			'Web'=>
				array('curl','openssl','simplexml'),
			'Web\Geo'=>
				array('geoip','json'),
			'Web\OpenID'=>
				array('json','simplexml'),
			'Web\Pingback'=>
				array('dom','xmlrpc')
		);
		$f3->set('classes',$classes);
		$f3->set('content','welcome.htm');
		echo View::instance()->render('layout.htm');
	}
);

$f3->route('GET /userref',
	function($f3) {
		$f3->set('content','userref.htm');
		echo View::instance()->render('layout.htm');
	}
);

$f3->route('GET /services',
    function()
    {
        global $db, $f3;
        $name = $f3->get('POST.name');
        $rows=$db->exec('SELECT DISTINCT category FROM points');
        echo json_encode($rows);
    }
);


$f3->route('GET /services/@service',
    function() {
        global $db, $f3;
        $service = $f3->get('PARAMS.service');	
        $sql = "SELECT * FROM points WHERE category='$service'";
        $rows=$db->exec($sql);
        echo json_encode($rows);
    }
);

//Retrieve a list of the nearest services from a lat/lon 
//latlonran should be in the form of: latitude,longitude,range (in km)
$f3->route('GET /services/within10/walking/@latlon',
    function() {
        global $db, $f3, $WALKDISTANCE;
        $R=6371000; //Radius of the earth in m
        $ran = $WALKDISTANCE;

        list($lat, $lon) = explode(",",$f3->get('PARAMS.latlon'));
        // first-cut bounding box (in degrees)
        $maxLat = $lat + rad2deg($ran/$R);
        $minLat = $lat - rad2deg($ran/$R);
        // compensate for degrees longitude getting smaller with increasing latitude
        $maxLon = $lon + rad2deg($ran/$R/cos(deg2rad($lat)));
        $minLon = $lon - rad2deg($ran/$R/cos(deg2rad($lat)));
        $sql = "Select DISTINCT category
                From points
                Where lat Between $minLat And $maxLat
                And lon Between $minLon And $maxLon";
        $rows=$db->exec($sql,NULL,86400);
        echo json_encode($rows);
    }
);

$f3->route('GET /services/within10/riding/@latlon',
    function() {
        global $db, $f3, $RIDEDISTANCE;
        $R=6371000; //Radius of the earth in m
        $ran = $RIDEDISTANCE;

        list($lat, $lon) = explode(",",$f3->get('PARAMS.latlon'));
        // first-cut bounding box (in degrees)
        $maxLat = $lat + rad2deg($ran/$R);
        $minLat = $lat - rad2deg($ran/$R);
        // compensate for degrees longitude getting smaller with increasing latitude
        $maxLon = $lon + rad2deg($ran/$R/cos(deg2rad($lat)));
        $minLon = $lon - rad2deg($ran/$R/cos(deg2rad($lat)));
        $sql = "Select DISTINCT category
                From points
                Where lat Between $minLat And $maxLat
                And lon Between $minLon And $maxLon";
        $rows=$db->exec($sql,NULL,86400);
        echo json_encode($rows);
    }
);

$f3->route('GET /services/within10/driving/@latlon',
    function() {
        global $db, $f3, $DRIVEDISTANCE;
        $R=6371000; //Radius of the earth in m
        $ran = $DRIVEDISTANCE;

        list($lat, $lon) = explode(",",$f3->get('PARAMS.latlon'));
        // first-cut bounding box (in degrees)
        $maxLat = $lat + rad2deg($ran/$R);
        $minLat = $lat - rad2deg($ran/$R);
        // compensate for degrees longitude getting smaller with increasing latitude
        $maxLon = $lon + rad2deg($ran/$R/cos(deg2rad($lat)));
        $minLon = $lon - rad2deg($ran/$R/cos(deg2rad($lat)));
        $sql = "Select DISTINCT category
                From points
                Where lat Between $minLat And $maxLat
                And lon Between $minLon And $maxLon";
        $rows=$db->exec($sql,NULL,86400);
        echo json_encode($rows);
    }
);

$f3->route('GET /services/heat/walking/@latlon',
    function() {
        global $db, $f3, $WALKDISTANCE, $NUMSERVICES;
        $R=6371000; //Radius of the earth in m
        $ran = $WALKDISTANCE;

        list($lat, $lon) = explode(",",$f3->get('PARAMS.latlon'));
        // first-cut bounding box (in degrees)
        $maxLat = $lat + rad2deg($ran/$R);
        $minLat = $lat - rad2deg($ran/$R);
        // compensate for degrees longitude getting smaller with increasing latitude
        $maxLon = $lon + rad2deg($ran/$R/cos(deg2rad($lat)));
        $minLon = $lon - rad2deg($ran/$R/cos(deg2rad($lat)));
        $sql = "Select DISTINCT category
                From points
                Where lat Between $minLat And $maxLat
                And lon Between $minLon And $maxLon";
        $rows=$db->exec($sql,NULL,86400);
        echo round((count($rows) / $NUMSERVICES)*100);
    }
);

$f3->route('GET /services/heat/riding/@latlon',
    function() {
        global $db, $f3, $RIDEDISTANCE, $NUMSERVICES;
        $R=6371000; //Radius of the earth in m
        $ran = $RIDEDISTANCE;

        list($lat, $lon) = explode(",",$f3->get('PARAMS.latlon'));
        // first-cut bounding box (in degrees)
        $maxLat = $lat + rad2deg($ran/$R);
        $minLat = $lat - rad2deg($ran/$R);
        // compensate for degrees longitude getting smaller with increasing latitude
        $maxLon = $lon + rad2deg($ran/$R/cos(deg2rad($lat)));
        $minLon = $lon - rad2deg($ran/$R/cos(deg2rad($lat)));
        $sql = "Select DISTINCT category
                From points
                Where lat Between $minLat And $maxLat
                And lon Between $minLon And $maxLon";
        $rows=$db->exec($sql,NULL,86400);
        echo round((count($rows) / $NUMSERVICES)*100);
    }
);

$f3->route('GET /services/heat/driving/@latlon',
    function() {
        global $db, $f3, $DRIVEDISTANCE, $NUMSERVICES;
        $R=6371000; //Radius of the earth in m
        $ran = $DRIVEDISTANCE;

        list($lat, $lon) = explode(",",$f3->get('PARAMS.latlon'));
        // first-cut bounding box (in degrees)
        $maxLat = $lat + rad2deg($ran/$R);
        $minLat = $lat - rad2deg($ran/$R);
        // compensate for degrees longitude getting smaller with increasing latitude
        $maxLon = $lon + rad2deg($ran/$R/cos(deg2rad($lat)));
        $minLon = $lon - rad2deg($ran/$R/cos(deg2rad($lat)));
        $sql = "Select DISTINCT category
                From points
                Where lat Between $minLat And $maxLat
                And lon Between $minLon And $maxLon";
        $rows=$db->exec($sql,NULL,86400);
        echo round((count($rows) / $NUMSERVICES)*100);
    }
);

//Returns a list of lat/lon coordinates in a grid based on a boudning box and the number of points required
//input is in the form lat1,lon1,lat2,lon2,x,y where
// lat1, lon1 are the latitude and longitude of the top left point of the bounding box
// lat2, lon2 are the latitude and longitude of the bottom right point of the boudning box
// x, y are the number of desired grid points along each axis
$f3->route('GET /utils/getGrid/@input',
    function() {
        global $f3;

        list($lat1, $lon1, $lat2, $lon2, $xSteps, $ySteps) = explode(",",$f3->get('PARAMS.input'));

        $latStep = abs(($lat2-$lat1)/$xSteps);
        $lonStep = abs(($lon2-$lon1)/$ySteps);

        for ($x=0; $x <= $xSteps; $x++) {
            $curX = $lat1 + ($x * $latStep);
            for ($y=0; $y <= $ySteps; $y++) {
                $curY = $lon1 + ($y * $lonStep);
                echo $curX.",".$curY."\n";
            }
        }
    }
);

$f3->run();
