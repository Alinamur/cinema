<?php
	$data = file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/cinema/data.json");
	$data = json_decode($data, true);

	$seats = $_POST["seats"];
	$seats = json_decode($seats, true);
	$date = json_decode($_POST["date"]);
	$time = json_decode($_POST["time"]);
	$movie = json_decode($_POST["movie"]);

	if ( !isset($data["movies"][$movie]) ) {
			echo json_encode(array(
				"status" => "error",
				"message" => "Фильм не найден"
			));
			exit("");
	}

	if ( !isset($data["movies"][$movie]["dates"][$date]) ) {
			echo json_encode(array(
				"status" => "error",
				"message" => "Дата не найдена"
			));
			exit("");
	}

	if ( !isset($data["movies"][$movie]["dates"][$date][$time]) ) {
			echo json_encode(array(
				"status" => "error",
				"message" => "Время не найдено"
			));
			exit("");
	}

	if ( !isset($data["movies"][$movie]["dates"][$date][$time]["seats_busy"]) ) {
			echo json_encode(array(
				"status" => "error",
				"message" => "Ошибка данных"
			));
			exit("");
	}

	for ($i=0; $i<count($seats); $i++) {
		$elem = $seats[$i];
		$key = $elem["row"] . ":" . $elem["seat"];
		$data["movies"][$movie]["dates"][$date][$time]["seats_busy"][$key] = true;
	}

	$res = @file_put_contents($_SERVER["DOCUMENT_ROOT"] . "/cinema/data.json", json_encode($data));

	if ( !$res ) {
		echo json_encode(array(
			"status" => "error",
			"message" => "Ошибка записи"
		));
	}

	echo json_encode(array(
		"status" => "success"
	));
