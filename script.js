var files, currentPhoto;

var canvas, canvas2;
var context, context2;
var cameraMouseDown = false;
var cameraBufferMouseDown = false;
var bufferMouseMoving = false;
var translateBufferXVal = 0;
var translateBufferYVal = 0;

var cameraMouseDownX, cameraMouseDownY, mouseUpX, mouseUpY, camWinX, camWinY;
var blurValue;

var photoIds = 0;
var thumbnailDragSource;

$(document).ready(function () {

    blurValue = $("#blurVal").val();
    camWinX = $("#bufferX").val();
    camWinY = $("#bufferY").val();
    mouseUpX = camWinX / 2;
    mouseUpY = camWinY / 2;

    canvas = document.getElementById("camera");
    canvas2 = document.getElementById("camera-buffer");
    context = canvas.getContext("2d");
    context2 = canvas2.getContext("2d");

    $("#blurVal").on('input', function () {
        blurValue = $(this).val();
        drawBackground();
    })
    $("#bufferX").on('input', function () {
        camWinX = $(this).val();
        $("#camera-buffer").attr("width", camWinX);
        adjustBufferView();
        drawForeground();
    })
    $("#bufferY").on('input', function (ś) {
        camWinY = $(this).val();
        $("#camera-buffer").attr("height", camWinY);
        adjustBufferView();
        drawForeground();
    })

    $("#camera").on('drop', function (event) {
        event.preventDefault();
        event.stopPropagation();
        files = event.originalEvent.dataTransfer.files;

        currentPhoto = new Image;
        currentPhoto.src = URL.createObjectURL(files[0]);
        currentPhoto.onload = function () {
            drawBackground();
            drawForeground();
        }

        $(this).css("background-color", "black");
    });

    $("#camera").on("dragover", function (event) {
        event.preventDefault();
        event.stopPropagation();
        $(this).css("background-color", "gray");
        return false;
    });

    $("#camera").on("dragleave", function (event) {
        event.preventDefault();
        event.stopPropagation();
        $(this).css("background-color", "black");
    });

    $('#camera').on('mousedown', function (e) {
        if (cameraMouseDown === false) {

            cameraMouseDown = true;

            var pos = getMousePos(canvas, e.clientX, e.clientY);
            cameraMouseDownX = pos.x;
            cameraMouseDownY = pos.y;
        }
    })

    $('#camera-buffer').on('mousedown', function () {
        cameraBufferMouseDown = true;
    });

    $('#camera-buffer').mousemove(function (evt) {
        var pos = getMousePos(canvas, evt.pageX, evt.pageY);
        if (cameraBufferMouseDown) {
            mouseUpX = pos.x;
            mouseUpY = pos.y;
            adjustBufferView();
            drawForeground();
            bufferMouseMoving = true;
        }
    });
    $('#camera-buffer').on('mouseup', function () {
        cameraBufferMouseDown = false;
    });

    $('#camera-buffer').click(function () {
        if (!bufferMouseMoving) {
            createThumbnail(canvas2.toDataURL('png'));
        }
        bufferMouseMoving = false;
    });

    $(window).on('mouseup', function (e) {

        cameraBufferMouseDown = false;
        if (cameraMouseDown === true) {

            var pos = getMousePos(canvas, e.clientX, e.clientY);
            mouseUpX = pos.x;
            mouseUpY = pos.y;

            cameraMouseDown = false;
            adjustBufferView();
            drawForeground();

        }
    });

})

function drawBackground() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.filter = 'blur(' + blurValue + 'px)';
    context.drawImage(currentPhoto, 0, 0, canvas.width, canvas.height);
    context.filter = 'blur(0px)';
}

function drawForeground() {
    context2.clearRect(0, 0, canvas.width, canvas.height);
    context2.beginPath();
    context2.lineWidth = "6";
    context2.strokeStyle = "white";
    context2.drawImage(currentPhoto, (-mouseUpX + (camWinX / 2)), (-mouseUpY + (camWinY / 2)), canvas.width, canvas.height);
    context2.rect(0, 0, camWinX, camWinY);
    context2.stroke();
}

function getMousePos(canvas, x, y) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: x - rect.left,
        y: y - rect.top
    };
}

function adjustBufferView() {
    translateBufferXVal = mouseUpX - (camWinX / 2);
    translateBufferYVal = mouseUpY - (camWinY / 2);

    if (mouseUpX + (camWinX / 2) > canvas.width) {
        translateBufferXVal = canvas.width - camWinX;
        mouseUpX = canvas.width - (camWinX / 2);
    }
    if (mouseUpX - (camWinX / 2) < 0) {
        translateBufferXVal = 0;
        mouseUpX = (camWinX / 2);
    }

    if ((mouseUpY - (camWinY / 2)) < 0) {
        translateBufferYVal = 0;
        mouseUpY = (camWinY / 2);
    }
    if ((mouseUpY + (camWinY / 2)) > canvas.height) {
        translateBufferYVal = canvas.height - camWinY;
        mouseUpY = canvas.height - (camWinY / 2);
    }

    $('#camera-buffer').css("transform", "translate(" + translateBufferXVal + "px, " + translateBufferYVal + "px)");
}

function thumbnailDragStart(evt) {
    thumbnailDragSource = evt.currentTarget;
    evt.dataTransfer.setData("text", evt.currentTarget.id);
    evt.dataTransfer.effectAllowed = "move";
    evt.target.style.opacity = "0.4";
}

function thumbnailDragOver(evt) {
    evt.preventDefault();
}

function thumbnailDragDrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    var separators = separatorFactory();

    if (evt.target.nextElementSibling && !(thumbnailDragSource.id == evt.target.nextElementSibling.id)) {
        thumbnailDragSource.previousSibling.remove();
        evt.target.parentNode.insertBefore(separators.upSep, evt.target);
        evt.target.parentNode.insertBefore(thumbnailDragSource, evt.target);
    } else if (!evt.target.nextElementSibling && evt.target.previousElementSibling && !(thumbnailDragSource.id == evt.target.previousElementSibling.id)) {
        thumbnailDragSource.previousSibling.remove();
        evt.target.parentNode.insertBefore(separators.upSep, evt.target);
        evt.target.parentNode.insertBefore(thumbnailDragSource, evt.target);
    }

    $(evt.target).toggleClass("dragHover", false);
}

function thumbnailDragEnd(evt) {
    evt.target.style.opacity = "1";
}

function dividerUpDragOver(e) {
    e.preventDefault();
    $(e.target).toggleClass("dragHover", true);
    e.dataTransfer.dropEffect = "move";
}
function dividerUpDragLeave(e) {
    $(e.target).toggleClass("dragHover", false);
    e.dataTransfer.dropEffect = "none";
}

function createThumbnail(content) {
    var div = document.createElement("div");
    var img = document.createElement("img");
    img.className = "photo";
    img.src = content;
    div.id = "photoThumb" + photoIds;
    div.setAttribute("draggable", "true");
    photoIds++;
    div.setAttribute("ondragstart", "thumbnailDragStart(event)");
    div.setAttribute("ondragover", "thumbnailDragOver(event)");
    div.setAttribute("ondragend", "thumbnailDragEnd(event)");
    div.appendChild(img);

    var separators = separatorFactory();

    $(".container-area")[0].appendChild(div);
    $(".container-area")[0].appendChild(separators.upSep);
    $(".container-area").animate({
        scrollTop: $(".container-area")[0].scrollHeight
    }, 1000, function() {});
}


function separatorFactory() {
    var separatorDivUp = document.createElement("div");
    separatorDivUp.className = "photo-divider-up";
    separatorDivUp.setAttribute("ondragover", "dividerUpDragOver(event)");
    separatorDivUp.setAttribute("ondragleave", "dividerUpDragLeave(event)");
    separatorDivUp.setAttribute("ondrop", "thumbnailDragDrop(event)");

    return {
        upSep: separatorDivUp
    };
}