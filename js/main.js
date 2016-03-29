/* POPUP */

var choosenSeats = [];
var movie = 1;
var movieData = {};
var currentPrice;
function showPopup(date, time, price){

	var seansData = movieData.dates[date];
	if ( !seansData){
		showSystemPopup("error", "Cеанс не найден");
		return;
	}
	seansData = seansData[time];
	if ( !seansData ){
		showSystemPopup("error", "Cеанс не найден");
		return;
	}
	var popup = document.querySelector('.seanse_popup');
	var underlay = document.querySelector('.underlay_popup');
	if (popup && underlay) {
		popup.classList.add('is-active');
		underlay.classList.add('is-active');
		popup.dataset.currentSeanse = seansData;
		popup.dataset.date = date;
		popup.dataset.time = time;
		popup.dataset.price = price;
		currentPrice = price;
		centerPopup(popup);
		initPopup(seansData);
		updateSeanseInfo(popup);
		updateChoosenSeats();
		updateTotalPrice();

		
	}

}
function closePopup(e){
	if (e) {
		e.preventDefault();
	}
	var popup = document.querySelector('.seanse_popup');
	var underlay = document.querySelector('.underlay_popup');
	if (popup && underlay) {
		popup.classList.remove('is-active');
		underlay.classList.remove('is-active');
	}
	destroyPopup();
}

function centerPopup(popup){
	popup.style.top = window.scrollY+'px';
}

function onSendData(e){
	var popup = document.querySelector(".seanse_popup");
	var number = document.querySelector(".cardNumber").value;
	console.log(number);
	var mail = document.querySelector(".email").value;
	console.log(mail);
	var paymentType = document.querySelectorAll(".radio_button__input");
	for (var i=0; i<paymentType.length; i++){
		if (paymentType[i].checked==true){
			choosenPayment=paymentType[i].value;
		}	
	}
	
	console.log(choosenPayment);
	var seansData = {seats_busy:{}};
	var date, time;
		if (popup){
			date = popup.dataset.date;
			time = popup.dataset.time;
			seansData = popup.dataset.currentSeanse || seansData;
		}
	if (choosenSeats.length>0) {
		ajax("POST","/cinema/buy.php", {
			movie: 1,
			date: date,
			time: time,
			seats: choosenSeats,
			cardNumber: number,
			email: mail,
			type: choosenPayment
		} , function(data){
			if (data.status == "success"){
				onBookingSuccess(data, seansData);
			} else {
				onBookingError(data);
			}
			
		})
	} else { 
		onBookingError({
			message: "Выберите места"
		})

	}
}

function onBookingSuccess(data, seansData){
	var elems = document.querySelectorAll(".seanse_scheme__seat--check");
	var elem;
	if (elems){
		for (var i=0; i<elems.length; i++){
			elem = elems[i];
			elem.classList.remove('seanse_scheme__seat--check');
			elem.classList.add('seanse_scheme__seat--busy');
		}
	}
	choosenSeats = [];
	showSystemPopup(data.status, "Спасибо за Ваш заказ!");

}

function onBookingError(data){
	alert(data.message);
}

function showSystemPopup(status, text){
	var popup = document.querySelector(".system_popup");
	if (popup){
		var content = popup.querySelector(".system_popup__content");
		content.innerHTML=text;
		popup.classList.remove("system_popup--success");
		popup.classList.remove("system_popup--error");
		popup.classList.add("system_popup--show");
		popup.classList.add("system_popup--"+status);
		popup.onclick = function(){
			popup.classList.remove("system_popup--show");
			closePopup();
		}
	}

}
/* EVENTS RELATED WITH POPUP*/
function init(data){
	movieData = data.movies[movie];
	console.log('inited');
	console.log(data);
	var list = document.querySelector('.schedule__list');
	if (list){
			list.addEventListener('click', function(e){
			var isCell = e.path.some(function(el){

				return el && el.classList.contains('schedule__cell');
			})
			if (isCell){
				var li = e.target.tagName.toLowerCase() == "li" ? e.target : e.target.parentNode;
				var time = li.dataset.time;
				var ul = li.parentNode;
				var date = ul.dataset.date;
				var price = li.dataset.price || 250;

				showPopup(date, time, price);
			}
		})
		}



var closeBtn = document.querySelector('.seanse_popup__header__close');
if (closeBtn){
	closeBtn.addEventListener('click', closePopup);
}
var underlay = document.querySelector('.underlay_popup');
if (underlay){
	underlay.addEventListener('click', closePopup);
}

var button = document.querySelector('.seance_popup__button');
if (button){
	button.addEventListener('click', onSendData);
}
}



/* CHOICE */


function toogleSeat(e){
		if (!e.target.classList.contains('seanse_scheme__seat')){
			return;
		}
		if (e.target.classList.contains('seanse_scheme__seat--busy')){
			return;
		}
		var row, seat;
		row = e.target.dataset.row;
		seat = e.target.dataset.seat;
		if (e.target.classList.contains('seanse_scheme__seat--check')){
			var index = -1;
			for (i=0; i<choosenSeats.length; i++){
				if( choosenSeats[i].row === row && choosenSeats[i].seat === seat){

					index = i;
					break;
				}
			}
				if (index != -1){
					choosenSeats.splice(index, 1);
				}
		} else {
			choosenSeats.push({
			row: row,
			seat: seat
			})
		}
		e.target.classList.toggle('seanse_scheme__seat--check');

		updateTotalPrice();
		updateChoosenSeats();

}

function initPopup (seansData){

	var scheme = document.querySelector('.seanse_scheme');
	scheme.addEventListener('click', toogleSeat);
	var rows = scheme.querySelectorAll('.seanse_scheme__row');
	var seats_busy = seansData.seats_busy;
	for (i=0; i<rows.length; i++){
		var seats = rows[i].querySelectorAll('.seanse_scheme__seat');
		for (j=0; j<seats.length; j++){
			seats[j].dataset.row = i+1;
			seats[j].dataset.seat = j+1;
			if (seats_busy[i+1+":"+(j+1)]){
				seats[j].classList.add("seanse_scheme__seat--busy")
			} else {
				seats[j].classList.remove("seanse_scheme__seat--busy")
			}
		}
	}
}

function destroyPopup(){

		var scheme = document.querySelector('.seanse_scheme');
		scheme.removeEventListener('click', toogleSeat);
}


function updateChoosenSeats(){
	var heading = document.querySelector('.seance__choosen--heading');
	heading.innerHTML = pluralize(choosenSeats.length, 'Выбрано %d место', 'Выбрано %d места', 'Выбрано %d мест', 'Не выбрано ни одного места');
	var ul = document.querySelector('.choosen');
	var str = '';
	for (var i=0; i < choosenSeats.length; i++){
		str += '<li>Ряд ' + choosenSeats[i].row +
		 ' , место ' + choosenSeats[i].seat + '</li>';
	}

	ul.innerHTML = str;
}

function updateTotalPrice(){
	var count = choosenSeats.length;
	var total = currentPrice*count;
	var el = document.querySelector('.seance__total');
	var seatsText = pluralize(count, '%d место', '%d места', '%d мест', 'Ни одного места');
	var sumText = pluralize (total, 'на сумму %d рубль', 'на сумму %d рубля', 'на сумму %d рублей', '')
	el.innerHTML= seatsText + ' ' + sumText;
}
function updateSeanseInfo(popup){
	var price = document.querySelector(".seance_price");
	var date = document.querySelector(".seance_date");
	var time = document.querySelector(".seance_time");
	price.innerHTML = popup.dataset.price;
	time.innerHTML = popup.dataset.time;
	date.innerHTML = popup.dataset.date;

}

function pluralize (count, single, few, many, none){

	if (count == 0){
		return none.replace('%d', count);
	} else if (count%10 === 1){
		return single.replace('%d', count);
	} else if (count%10 >= 2 && count%10 <= 4){
		return few.replace('%d', count);
	} else {
		return many.replace('%d', count);
	}
}


function ajax(method, url, data, callback){
	var xhr = new XMLHttpRequest();
	xhr.open(method, url);
	var formData = new FormData();
	for (var key in data){
		formData.append(key, JSON.stringify(data[key]));
	}
	xhr.onreadystatechange = function(){
		if ( xhr.readyState != 4) return;
		if ( xhr.status == 200) {
			var data;
			try {
			data = JSON.parse(xhr.responseText);
			} catch (e){
				console.log(e);
				data = {};
			}
			console.log(data);
			callback(data);
		}
	};
	xhr.send(formData);
}

function loadData(callback) {

	ajax("GET", "/cinema/data.json", {}, callback);
}


loadData(init);

var mini = document.querySelector(".movie_frames__mini");
var miniList = document.querySelectorAll(".movie_frames__mini__image");
var bigFrame = document.querySelector(".movie_frames__big");

mini.addEventListener('click', function(e){
	var active = document.querySelector(".movie_frames__mini__image--active");
	active.classList.remove("movie_frames__mini__image--active");
	var img = e.target.src;
	bigFrame.innerHTML="<img src='"+img+"'>";
	e.target.parentNode.classList.add("movie_frames__mini__image--active");
})
