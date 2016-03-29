 

var slider = document.querySelector(".main_slider");
var list = slider.querySelector('.main_slider__list'); 
var listElems = slider.getElementsByClassName('main_slider__item_wrap');
var width = list.style.width; 
var elemWidth = width/listElems.length;
var position = 0; 
// for (var i=0; i<listElems.length; i++){

//   listElems[i].style.width = elemWidth;
// }
    document.querySelector('.main_slider__controls__item--prev').addEventListener("click", function(e) {
      e.preventDefault();
     
      list.insertBefore(listElems[0], listElems[listElems.length])

    });

    document.querySelector('.main_slider__controls__item--next').addEventListener ("click", function(e) {
      e.preventDefault();
        list.appendChild(listElems[0])
    });
