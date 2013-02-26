<?php
/**
 * Memlog class: store log values in file
 * @author ZiJuà
 * @copyright Toppi Giovanni Manuel
 */
class Memlog
{
	private $filepath;
	
	public function __construct($filepath)
	{
		$this->filepath = $filepath;
		if ( !is_readable($this->filepath) && !touch($this->filepath) && !chmod($this->filepath, 0664) )
		{
			throw new Exception("File or directory not readable. Memlog can't continue", 1);
		}
	}
	/*
	 * UTF8 encoding to insert messages inside JSON string
	 * Without this a field could be set to a null value
	 */
	private function escape_json_string($value) { 
		return utf8_encode($value);	
	}
	
	public function mem($message, $url, $line, $userAgent = "")
	{
		$json = file_get_contents($this->filepath);
		$log  = json_decode($json);
		if ( !$log )
		{
			$log = array();
		}
		print_r($message);
		$log[] = array(
			'date' => date('Y-m-d H:i:s'),
			'message' => $this->escape_json_string($message), 
			'url' => $this->escape_json_string($url),
			'line' => $this->escape_json_string($line),
			'userAgent' => $this->escape_json_string($userAgent)
		);
		$json = json_encode($log);
		if ( !is_writable($this->filepath) && !chmod($this->filepath, 0664) )
		{
			throw new Exception("File not writable. Unable to save log entry.", 1);
		}
		file_put_contents($this->filepath, $json);
		return true;
	}
}


$message = isset($_REQUEST['message']) ? $_REQUEST['message'] : "";
$url = isset($_REQUEST['url']) ? $_REQUEST['url'] : "";
$line = isset($_REQUEST['line']) ? $_REQUEST['line'] : "";
$userAgent = isset($_REQUEST['userAgent']) ? $_REQUEST['userAgent'] : "";

try
{
	$log = new Memlog(__DIR__.'/log/log.jsn');
	$status = $log->mem($message, $url, $line, $userAgent);
	if($status == true)
	{
		echo "OK";
	}
	else
	{
		echo "NO";
	}
}
catch(Exception $e)
{
	echo $e->getMessage();
}
?>