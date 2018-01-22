/**
 * Created by pawel on 25.12.2017.
 */

var files;
var currentPhoto;

var canvas, canvas2;
var context, context2;
var cameraMouseDown = false;
var cameraBufferMouseDown = false;
var cameraMouseDownX, cameraMouseDownY;

var translateBufferXVal = 0;
var translateBufferYVal = 0;

var mouseUpX;
var mouseUpY;
var blurValue;
var camWinX;
var camWinY;

var savedScreenshots = []

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
        $(this).css("background-color", "green");
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

    $('#camera-buffer').click(function () {
        savedScreenshots.push(canvas2.toDataURL('png'));
        $("#tutej").attr('src', savedScreenshots[0]);
    });

    $('#camera-buffer').mousemove(function (evt) {

        var pos = getMousePos(canvas, evt.pageX, evt.pageY);

        if(cameraBufferMouseDown) {

            mouseUpX = pos.x;
            mouseUpY = pos.y;
            adjustBufferView();
            drawForeground();
        }
    });
    $('#camera-buffer').on('mouseup',function () {
        cameraBufferMouseDown=false;
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
    context2.strokeStyle = "green";
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