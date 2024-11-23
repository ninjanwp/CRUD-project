<?php
$serverName = "NP-ITX-12"; // e.g., "localhost" or "192.168.1.1"
$connectionOptions = array(
    "Database" => "Shop",
    "Uid" => "root",
    "PWD" => ""
);

// Establishes the connection
$conn = sqlsrv_connect($serverName, $connectionOptions);

if ($conn === false) {
    die(print_r(sqlsrv_errors(), true));
}

echo "Connection successful!";
?>