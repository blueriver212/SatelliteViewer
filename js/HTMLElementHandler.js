
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

