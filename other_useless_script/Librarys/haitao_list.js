jQuery( document ).ready(function( $ ) {

    // initialization
    var thisTag = $("#this-tag").html();
    var showJoyride = $("#showJoyride").html();
    var problemId = 0;
    var countDownSeconds = 9;
    var competeOrderId = 0;
    var competeLock = false;
    var updateLock = false;
    var switchStatus = false;
    var firstTimeLock = false;
    var idList = new Array(0);
    var isJapanList = getUrlParam("isJapanList") || false;
    $("#" + thisTag).addClass("chosen");

    var joyride = $.cookie('joyride');
    if (joyride != "1" && showJoyride) {
        $(document).foundation('joyride', 'start');
    }
    $(".joyride-close-tip, .joyride-next-tip").click(function(event){
        event.preventDefault();
        var date = new Date();
        date.setTime(date.getTime() + 365 * 24 * 3600 * 1000);
        document.cookie='joyride=1;expires=' + date.toGMTString();
    });

    // 改商品总金额取消按钮
    $(document).on('change', '#listenSwitch', function(event) {
        event.preventDefault();
        switchStatus = !switchStatus;
        if (switchStatus) {
            updateLock = true;
            popup("<span class='lightGreenText'>您已开启听单模式</span>",
                "<span class='lightGreyText'>系统会自动检测新订单。如有则会声音提示您。抢单结果会根据积分高低决定。</span>",
                4000);
        } else {
            updateLock = false;
            popup("<span class='lightRedText'>您已关闭听单模式</span>",
                "<span class='lightGreyText'>不会自动检测系统更新订单。</span>",
                2000);
        }
    });

    function update() {
        if ((updateLock && !competeLock) || !firstTimeLock) {
            $.ajax({
                url: "/hasNew?isJapanList=" + isJapanList,
                data: {"timed": new Date().getTime()},
                type: "POST",
                dataType : "json",
                timeout: 5000,
                error: function () {
                    setTimeout(function(){update();}, 2000);
                },
                success: function (result) {
                    if (result.success == true && hasNewOrder(result.orderIdList)) {
                        if (firstTimeLock) {
                            $("body").append('<iframe src="/music/alert" frameborder="0" id="alertIframe"></iframe>');
                            setTimeout(function(){location.reload();}, 1300);
                        }
                        firstTimeLock = true;
                    }
                    idList = result.orderIdList;
                    setTimeout(function(){update();}, 2000);
                }
            });
        } else {
            setTimeout(function(){update();}, 2000);
        }
    }
    update();

    function hasNewOrder(newIdList) {
        for (var id in newIdList) {
            if (idList.indexOf(newIdList[id]) == -1) {
                return true;
            }
        }
        return false;
    }

    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);  //匹配目标参数
        if (r !== null) return unescape(r[2]); return null; //返回参数值
    }

    $(".-order-take-button").click(function(event){
        event.preventDefault();
        var id = $(this).attr('id');
        var url = "/order/hold";
        $.post(url, {"id":id},
            function(result){
                if (result.success == true) {
                    $("#-order-take-" + id).hide();
                    $("#-order-release-" + id).show();
                    $("#order-" + id).css("background-color", "#43ac6a");
                    $(".-order-detail-" + id).hide();
                } else {
                    if (result.reason) {
                        alert(result.reason);
                    }
                    location.reload();
                }
            }, "json");
    });

    $(".-order-compete-button").click(function(event){
        event.preventDefault();
        if (competeLock) {
            return;
        }
        competeLock = true;
        var id = $(this).data('id');
        var url = "/order/holdwp";
        $.post(url, {"id":id},
            function(result){
                if (result.success == true) {
                    $("#order-" + id).css("background-color", "orange");
                    $(".-order-detail-" + id).hide();
                    competeOrderId = id;
                    countDownSeconds = 9;
                    popup("<span class='lightGreenText'>抢单中...</span>",
                        "<span class='lightGreyText'>注：抢单结果会根据积分高低决定。</span>",
                        4000);
                    countdown();
                } else {
                    if (result.reason) {
                        popup("<span class='lightRedText'>错误！</span>",
                            "<span class='lightGreyText'>" + result.reason + "</span>",
                            4000);
                        competeLock = false;
                    }
                }
            }, "json");
    });

    function popup(title, subTitle, fadeTime) {
        $("#popupTitle").html(title);
        $("#popupSubTitle").html(subTitle);
        $(".statusPopup").show();
        if (fadeTime !== 0) {
            setTimeout(function(){$(".statusPopup").hide();}, fadeTime);
        }
    }

    function countdown() {
        countDownSeconds -= 1;
        if (countDownSeconds < 0) {
            getCompeteResult();
            return;
        } else if (countDownSeconds > 0) {
            $("#-order-compete-button-" + competeOrderId).html(countDownSeconds);
        }
        setTimeout(countdown, 1000);
    }

    function getCompeteResult() {
        var url = "/order/isHoldSucc";
        $.post(url, {"id":competeOrderId},
            function(result){
                if (result.success === true) {
                    $("#-order-compete-" + competeOrderId).hide();
                    $("#-order-release-" + competeOrderId).show();
                    $("#order-" + competeOrderId).css("background-color", "#43ac6a");
                    $(".-order-detail-" + competeOrderId).hide();
                    competeLock = false;
                } else {
                    if (result.reason) {
                        console.log(result.reason);
                        $("#start").trigger("click");
                    }
                    location.reload();
                }
            }, "json");
    }

    $(".-order-info-button").click(function(event){
        event.preventDefault();
        $(".-order-detail-" + $(this).attr('id')).toggle();
    });

    // 报错
    $('.problem').change(function(event){
        event.preventDefault();
        event.preventDefault();
        var showId = $(this).data('id');
        var id = $(this).attr('id');
        var value = $(this).children('option:selected').val();
        var reason = $(this).children('option:selected').html();
        if (value == "OTHER") {
            problemId = id;
            $('#problemModal').foundation('reveal', 'open');
        } else if (confirm("确定订单\"" + showId + "\"" + reason + ", 无法下单？")) {
            sendProblemRequest(id, value, "");
        }
    });

    // 报错确认按钮
    $('.problem-confirm-button').click(function(event){
        event.preventDefault();
        var problemReasonInput = $('#problem-reason');
        var reason = problemReasonInput.val();
        problemReasonInput.val("");
        sendProblemRequest(problemId, "OTHER", reason);
    });

    // 报错取消按钮
    $('.problem-cancel-button').click(function(event){
        event.preventDefault();
        window.location.reload();
    });

    function sendProblemRequest(id, value, reason) {
        var url = "/order/problem";
        $.post(url, {"id": id, "verifyContent": value, "message": reason},
            function (result) {
                if (result.success === true) {
                    $('#problemModal').foundation('reveal', 'close');
                    $("#order-" + id).remove();
                    $(".-order-detail-" + id).remove();
                } else {
                    alert("报错失败！");
                }
            }, "json");
        setTimeout(function(){window.location.reload();}, 500);
    }

});

