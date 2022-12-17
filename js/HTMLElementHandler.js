
// make sure that the model popup is going to be the original place
function openModal($modal) {
// Note: fixed elements will also need the margin 
// adjustment (like a fixed header, if you have one).
var scrollBarWidth = window.innerWidth - document.body.offsetWidth;
$('body')
    .css('margin-right', scrollBarWidth)
    .addClass('showing-modal');
$modal.show();
};

function closeModal($modal) {
    $('body')
    .css('margin-right', '')
    .removeClass('showing-modal');
    $modal.hide();
};

// I prefer to generate and dynamically insert the modal
// but for this demonstration it is already in the markup.
var $modal = $('#modal');

// Clicking outside the inner modal content should close it.
$modal
    .click(function () {
        closeModal($modal);
    })
.find('.modal-inner').click(function (event) {
    event.stopPropagation();
    });

// Open the modal when open button is pressed.
$('#open').click(function (event) {
event.preventDefault();
openModal($modal);
});

$(document).ready(function(){
        $("#modal_load").modal('show');
    });

dragElement(document.getElementById("satelliteLegend"));

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        /* if present, the header is where you move the DIV from:*/
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        /* otherwise, move the DIV from anywhere inside the DIV:*/
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }       
}

// stop the enter button being used in the entire project, this is stop the page refreshing when searching for a year
$(document).ready(function() {
    $(window).keydown(function(event){
      if(event.keyCode == 13) {
        // event.preventDefault();
        // return false;
        // get value of the box 
        if (document.getElementById('1yearsearch').value != null) {
          whichMap(1);
        } else {
          alert('You have not entered a year!');
        }
      }
    });
  });
  