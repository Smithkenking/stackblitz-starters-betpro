var SESSION_STATUS = Flashphoner.constants.SESSION_STATUS;
var STREAM_STATUS = Flashphoner.constants.STREAM_STATUS;
var PRELOADER_URL = "./dependencies/media/preloader.mp4";
var remoteVideo;
var resolution_for_wsplayer;
var stream;
var currentVolumeValue = 0;

var autoplay = getUrlParam("autoplay") || true;
var resolution = getUrlParam("resolution");
var mediaProvider = getUrlParam("mediaProvider") || null;
var mseCutByIFrameOnly = getUrlParam("mseCutByIFrameOnly");
// var serverURL = "wss://veronicalive.jamgroundfeed.com:8443";
// var streamTitle =  "channel_2_2";
var HostIp = "";
var ProAppName =  "";
var StreamNamePreFix =  "";
var streamTitle =  "";

var serverURL = "";
serverURL = HostIp;
var chnnelTitle = "";
if (streamTitle == "") {

    if (streamTitle == null) {
        alert("Reopen Channel")
        window.close();
    }

}
try {
    serverURL = serverURL;
}
catch (ex) {
    if (serverURL == "") {
        serverURL = serverURL;
    }
}

function init_page() {

    //init api
    HostIp = window.parent.document.getElementById('hdn_host').value;
    ProAppName = window.parent.document.getElementById('hdn_ProAppName').value;
    StreamNamePreFix = window.parent.document.getElementById('hdn_StreamNamePreFix').value;
    streamTitle = StreamNamePreFix + window.parent.document.getElementById('hdn_channelno').value;
    serverURL = HostIp;
       chnnelTitle = "";
       if (streamTitle == "") {

           if (streamTitle == null) {
               alert("Reopen Channel")
               window.close();
           }

       }
       try {
           serverURL = serverURL;
       }
       catch (ex) {
           if (serverURL == "") {
               serverURL = serverURL;
           }
       }
    try {
        Flashphoner.init({
            flashMediaProviderSwfLocation: './media-provider.swf',
            receiverLocation: '../dependencies/websocket-player/WSReceiver2.js',
            decoderLocation: '../dependencies/websocket-player/video-worker2.js',
            preferredMediaProvider: mediaProvider
        });
    } catch(e) {
        $("#notifyFlash").text("Your browser doesn't support Flash or WebRTC technology needed for this example");
        return;
    }

    $("#streamName").val(getUrlParam("streamName"));

    //video display
    remoteVideo = document.getElementById("remoteVideo");

    $("#url").val(setURL());
    $("#volumeControl").slider({
        range: "min",
        min: 0,
        max: 100,
        value: currentVolumeValue,
        step: 10,
        animate: true,
        slide: function(event, ui) {
            //WCS-2375. fixed autoplay in ios safari
            stream.unmuteRemoteAudio();
            currentVolumeValue = ui.value;
            stream.setVolume(currentVolumeValue);
        }
    }).slider("disable");
    if (Flashphoner.getMediaProviders()[0] == "Flash") {
        $("#fullScreen").hide();
    }
    onStopped();
    if (autoplay)
        $("#playBtn").click();
}

function onStarted(stream) {
    $("#playBtn").text("Stop").off('click').click(function(){
        $(this).prop('disabled', true);
        stream.stop();
    }).prop('disabled', false);
    $("#fullScreenBtn").off('click').click(function(){
        stream.fullScreen();
    }).prop('disabled', false);
    $("#volumeControl").slider("enable");
    stream.setVolume(currentVolumeValue);
}

function onStopped() {
    $("#playBtn").text("Start").off('click').click(playBtnClick).prop('disabled', false);
    $('#url').prop('disabled', false);
    $("#streamName").prop('disabled', false);
    $("#volumeControl").slider("disable");
    $("#fullScreenBtn").prop('disabled', true);
    $("#preloader").hide();
}

function playBtnClick() {
    if (validateForm()) {
        $(this).prop('disabled', true);
        $('#url').prop('disabled', true);
        $("#streamName").prop('disabled', true);
        if (Flashphoner.getMediaProviders()[0] === "WSPlayer") {
            Flashphoner.playFirstSound();
        } else if (Browser.isSafariWebRTC() || Flashphoner.getMediaProviders()[0] === "MSE") {
            Flashphoner.playFirstVideo(remoteVideo, false, PRELOADER_URL).then(function() {
                start();
            }).catch(function () {
                onStopped();
            });
            return;
        }
        start();
    }
}

function start() {
    var url = serverURL;// $('#url').val();
    //check if we already have session
    if (Flashphoner.getSessions().length > 0) {
        var session = Flashphoner.getSessions()[0];
        if (session.getServerUrl() == url) {
            playStream(session);
            return;
        } else {
            //remove session DISCONNECTED and FAILED callbacks
            session.on(SESSION_STATUS.DISCONNECTED, function(){});
            session.on(SESSION_STATUS.FAILED, function(){});
            session.disconnect();
        }
    }
    //create session
    console.log("Create new session with url " + url);
    Flashphoner.createSession({urlServer: url}).on(SESSION_STATUS.ESTABLISHED, function(session){
        setStatus(session.status());
        //session connected, start playback
        playStream(session);
    }).on(SESSION_STATUS.DISCONNECTED, function(){
        setStatus(SESSION_STATUS.DISCONNECTED);
        onStopped();
    }).on(SESSION_STATUS.FAILED, function(){
        setStatus(SESSION_STATUS.FAILED);
        onStopped();
    });

}

function playStream(session) {
    var streamName = streamTitle; //$('#streamName').val();
    var options = {
        name: streamName,
        display: remoteVideo,
        flashShowFullScreenButton: true
    };
    if (Flashphoner.getMediaProviders()[0] === "MSE" && mseCutByIFrameOnly) {
        options.mediaConnectionConstraints = {
            cutByIFrameOnly: mseCutByIFrameOnly
        }
    }
    if (resolution_for_wsplayer) {
        options.playWidth = resolution_for_wsplayer.playWidth;
        options.playHeight = resolution_for_wsplayer.playHeight;
    } else if (resolution) {
        options.playWidth = resolution.split("x")[0];
        options.playHeight = resolution.split("x")[1];
    }
    stream = session.createStream(options).on(STREAM_STATUS.PENDING, function (stream) {
        $("#preloader").show();
        var video = document.getElementById(stream.id());
        if (!video.hasListeners) {
            video.hasListeners = true;
            video.controls = true;
            video.autoplay = true;
            //don't resize html5 video
            if (video.nodeName.toLowerCase() !== "video") {
                video.addEventListener('resize', function (event) {
                    var streamResolution = stream.videoResolution();
                    console.log("Stream resolution " + streamResolution);
                    if (Object.keys(streamResolution).length === 0) {
                        resizeVideo(event.target);
                    } else {
                        // Change aspect ratio to prevent video stretching
                        var ratio = streamResolution.width / streamResolution.height;
                        var newHeight = Math.floor(options.playWidth / ratio);
                        resizeVideo(event.target, options.playWidth, newHeight);
                    }
                });
            } else {
                //WCS-2375. fixed autoplay in ios safari
                video.addEventListener('playing', function () {
                    if (autoplay && stream.isRemoteAudioMuted()) {
                        $("#volumeControl").slider('value', 0);
                    }
                });
            }
        }
    }).on(STREAM_STATUS.PLAYING, function (stream) {
        $("#preloader").hide();
        setStatus(stream.status());
        onStarted(stream);
    }).on(STREAM_STATUS.STOPPED, function () {
        $("#preloader").hide();
        setStatus(STREAM_STATUS.STOPPED);
        onStopped();
    }).on(STREAM_STATUS.FAILED, function(stream) {
        $("#preloader").hide();
        setStatus(STREAM_STATUS.FAILED, stream);
        onStopped();
    }).on(STREAM_STATUS.NOT_ENOUGH_BANDWIDTH, function(stream){
        console.log("Not enough bandwidth, consider using lower video resolution or bitrate. Bandwidth " + (Math.round(stream.getNetworkBandwidth() / 1000)) + " bitrate " + (Math.round(stream.getRemoteBitrate() / 1000)));
    });
    stream.play();
}

//show connection or remote stream status
function setStatus(status, stream) {
    var statusField = $("#status");
    var infoField = $("#info");
    statusField.text(status).removeClass();
    if (status == "PLAYING") {
        statusField.attr("class","text-success");
        infoField.text("");
    } else if (status == "DISCONNECTED" || status == "ESTABLISHED" || status == "STOPPED") {
        statusField.attr("class","text-muted");
    } else if (status == "FAILED") {
        statusField.attr("class","text-danger");
        if (stream) {
            infoField.text(stream.getInfo()).attr("class","text-muted");
        }
    }
}

function validateForm() {
    var valid = true;
    $('#form :text').each(function(){
        if (!$(this).val()) {
            highlightInput($(this));
            valid = false;
        } else {
            removeHighlight($(this));
        }
    });
    return valid;

    function highlightInput(input) {
        input.closest('.form-group').addClass("has-error");
    }
    function removeHighlight(input) {
        input.closest('.form-group').removeClass("has-error");
    }
}