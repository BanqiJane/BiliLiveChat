$(function () {
    var socket;
    var timer;
    var list = [];
    var ttts = [];
    method.data.setSocket(socket);
    method.data.setTimer(timer);
    method.data.setAudio($("#au")[0]);
    method.danmus.set(list);
    method.tts.set(ttts);
    $(document).on('click', '#connect-btn', function () {
        if (!method.data.getSocket()) {
            openSocket(method.data.getSocket(), "wss://broadcastlv.chat.bilibili.com:2245/sub", $("#roomid").val(), method.data.getTimer());
            $(this).html('断开');
        } else {
            method.tts.removeAll();
            clearInterval(method.data.getTimer());
            method.data.setTimer(null);
            method.data.getSocket().close();
            method.data.setSocket(null);
            $(this).html('连接');
        }
    });
    danmuku();
    tts();
});
window.addEventListener("resize", function () {
    if ($(".danmu-list").find('.danmu-item').length > 0) {
        var top = $("div[class='danmu-item']:last").offset().top;
        var top = $("div[class='danmu-item']:last").offset().top;
        var h = $("div[class='danmu-item']:last").height() + 6;
        $(".danmu-list").scrollTop(top);
        $(".danmu-list").children('.danmu-item').each(function () {
            if ($(this).offset().top < h) {
                $(this).remove();
            }
        });
    }
});
const danmuku = async () => method.danmuSpeedAdd();
const tts = async () => method.ttsSpeedAdd();
const method = {
    data: {
        timer: null,
        socket: null,
        audio: null,
        getTimer: function () {
            return this.timer;
        },
        setTimer: function (timer) {
            return this.timer = timer;
        },
        getSocket: function () {
            return this.socket;
        },
        setSocket: function (socket) {
            return this.socket = socket;
        },
        getAudio: function () {
            return this.audio;
        },
        setAudio: function (audio) {
            return this.audio = audio;
        },
    },
    danmus: {
        list: [],
        get: function () {
            return this.list;
        },
        set: function (list) {
            this.list = list;
        },
        push: function (o) {
            this.list.push(o);
        },
        remove: function () {
            this.list.splice(0, 1);
        }
    },
    tts: {
        list: [],
        get: function () {
            return this.list;
        },
        set: function (list) {
            this.list = list;
        },
        push: function (o) {
            this.list.push(o);
        },
        remove: function () {
            this.list.splice(0, 1);
        },
        removeAll: function () {
            this.list.splice(0, this.list.length);
        }
    },
    stringToTTS: function (str) {
        var url = "https://fanyi.baidu.com/gettts?lan=zh&spd=5&source=web&text=" + str;
        var n = new Audio(url)
        n.src = url;
        n.play();
    },
    danmuWindowMove: function () {
        var h = $("div[class='danmu-item']:last").height();
        var top = $("div[class='danmu-item']:last").offset().top + h + 6;
        $(".danmu-list").scrollTop($(".danmu-list").scrollTop() + top);
        $(".danmu-list").children('.danmu-item').each(function () {
            if ($(this).offset().top < 0) {
                $(this).remove();
                // $("div[class='danmu-item']:first").addClass('hidden');
            }
        });
    },
    //弹幕限速
    danmuSpeedAdd: function () {
        setInterval(() => {
            if (method.danmus.get().length) {
                method.addDanmuItem(method.danmus.get()[0]);
                method.addDanmuItem(method.danmus.remove());
            }
        }, 10); //10毫秒
    },
    ttsSpeedAdd: function () {
        setInterval(() => {
            if (method.data.getAudio().paused) {
                if (method.tts.get().length) {
                    $("#au").attr('src', "https://fanyi.baidu.com/gettts?lan=zh&spd=5&source=web&text=" + method.tts.get()[0]);
                    method.data.getAudio().play()
                    //	  var player=$("#au")[0];
                    //	 if (player.paused){ /*如果已经暂停*/
                    //            player.play(); /*播放*/
                    //        }else {
                    //            player.pause();/*暂停*/
                    //        }
                    method.addDanmuItem(method.tts.remove());
                }
            }
        }, 10); //10毫秒
    },
    //need jq //分类弹幕信息
    parseDanmuMessage: function (jsons) {
        jsons = JSON.parse(jsons);
        if (jsons.cmd.startsWith("DANMU_MSG")) {
            //			  console.log(jsons);
            const danmu = {
                name: '',
                message: ''
            };
            danmu.name = jsons.info[2][1];
            danmu.message = jsons.info[1];
            method.danmus.push(danmu);
            method.tts.push(danmu.message);
        } else {
            //			  console.log("new data:"+jsons);
        }
    },
    //need jq  添加弹幕ui
    addDanmuItem: function (object) {
        if (!object) {
            return;
        }
        $(".danmu-list").append('<div class="danmu-item"><div class="danmu-content"><span class="danmu-author-name">' + object.name + '</span>：<span class="danmu-message">' + object.message + '</span></div></div>');
        this.danmuWindowMove();
        // var top = $("div[class='danmu-item']:last").offset().top;
        // var h = $("div[class='danmu-item']:last").height() + 8;
        // $(".danmu-list").scrollTop(top);
        // $(".danmu-list").children('.danmu-item').each(function () {
        //     if ($(this).offset().top < h) {
        //         $(this).remove();
        //     }
        // });
        //    method.stringToTTS(object.message);
        //    $(".danmu-list").children('.danmu-item').each(function () {
        //      if (method.getDanmuListH() > $(".danmu-list").height()) {
        //        $("div[class='danmu-item']:first").remove();
        //      }
        //    });
    },
    //need jq // 获取弹幕集合高度
    getDanmuListH: function () {
        var a = 0
        $(".danmu-list").children('.danmu-item').each(function () {
            a = a + $(this).height() + 8;
        });
        return a;
    },
    //字符串转Uint8Array
    stringToUint: function (s) {
        const charList = s.split('');
        const uintArray = [];
        for (let i = 0; i < charList.length; i++) {
            uintArray.push(charList[i].charCodeAt(0));
        }
        return new Uint8Array(uintArray);
    },
    //Uint8Array转字符串
    uintToString: function (uintArray) {
        return decodeURIComponent(escape(String.fromCodePoint.apply(null, uintArray)));
    },
    //用于合成心跳包和验证包 返回arraybuffer 16均为包头长度
    sendData: function (data, p, o, s) {
        let dataUint8Array = method.stringToUint(data);
        let buffer = new ArrayBuffer(dataUint8Array.byteLength + 16);
        let dv = new DataView(buffer);
        //包长
        dv.setUint32(0, dataUint8Array.byteLength + 16);
        //头部长度 固定16
        dv.setUint16(4, 16);
        //协议版本号
        dv.setUint16(6, parseInt(p, 10));
        //协议类型
        dv.setUint32(8, parseInt(o, 10));
        //序列号 通常为1
        dv.setUint32(12, parseInt(s, 10));
        for (let i = 0; i < dataUint8Array.byteLength; i++) {
            dv.setUint8(16 + i, dataUint8Array[i]);
        }
        return buffer;
    },
    //处理不用解压的arraybuffer
    handleData: function (data) {
        const dv = new DataView(data);
        //包长
        const packageLen = dv.getUint32(0);
        //头部长度 固定16
        const headerLen = dv.getUint16(4);
        //协议版本号
        const protover = dv.getUint16(6);
        //协议类型
        const operation = dv.getUint32(8);
        //序列号 通常为1
        const sequence = dv.getUint32(12);
        data = data.slice(headerLen, packageLen);
        switch (protover) {
            case 0:
                //广播信息
                const str = method.uintToString(new Uint8Array(data));
                //        console.log(str);
                method.parseDanmuMessage(str);
                break;
            case 1:
                const dataV = new DataView(data);
                if (operation === 3) {
                    console.log("人气值为：" + dataV.getUint32(0));
                } else if (operation === 8) {
                    //连接成功返回{code:0}
                    const str = method.uintToString(new Uint8Array(data));
                    console.log(str);
                } else {
                    console.log("unknown data")
                }
                break;
            case 2:
                if (operation === 5) {
                    //解压
                    //          try {
                    method.unzip(pako.inflate(new Uint8Array(data)).buffer);
                    //          } catch (err) {
                    //            console.log(err);
                    //          }

                } else {
                    console.log("unknown data");
                }
                break;
            default:
                console.log("unknown data");
                break;
        }
    },
    //处理解压后的arraybuffer
    unzip: function (data) {
        var offect = 0;
        var len = 0
        const maxLength = data.byteLength;
        while (offect < maxLength) {
            data = data.slice(len, maxLength);
            const dv = new DataView(data);
            const packageLen = dv.getUint32(0);
            const headerLen = dv.getUint16(4);
            const protover = dv.getUint16(6);
            const operation = dv.getUint32(8);
            const sequence = dv.getUint32(12);
            var datas = data.slice(headerLen, packageLen)
            switch (protover) {
                case 0:
                    //处理解压后一般数据
                    const str = method.uintToString(new Uint8Array(datas));
                    method.parseDanmuMessage(str);
                    //          console.log(str);
                    break;
                case 1:
                    const dataV = new DataView(datas);
                    if (operation === 3) {
                        console.log("人气值为：" + dataV.getUint32(0));
                    } else if (operation === 8) {
                        //连接成功返回{code:0}
                        const str = method.uintToString(new Uint8Array(datas));
                        console.log(str);
                    } else {
                        console.log("unknown data")
                    }
                    break;
                case 2:
                    if (operation === 5) {
                        //解压
                        try {
                            console.log(pako.inflate(new Uint8Array(datas), {
                                to: 'string'
                            }));
                        } catch (err) {
                            console.log(err);
                        }

                    } else {
                        console.log("unknown data");
                    }
                    break;
                default:
                    console.log("unknown data");
                    break;
            }
            offect += packageLen;
            len = packageLen;
        }
    },
};

function openSocket(socket, ip, roomid, timer) {
    const firstData = {
        'uid': 0,
        'roomid': parseInt(roomid, 10),
        'protover': 2,
        'platform': 'web',
        'clientver': '1.8.5',
        'type': 2,
    };
    const heartData = '[object Object]';
    if (typeof (WebSocket) == "undefined") {
        alert("您的浏览器不支持WebSocket，显示弹幕功能异常，请升级你的浏览器版本，推荐谷歌，连接弹幕服务器失败");
    } else {
        console.log("弹幕服务器正在连接");
        var socketUrl = ip;
        if (socket != null) {
            socket.close();
            socket = null;
        }
        try {
            socket = new WebSocket(socketUrl);
        } catch (err) {
            console.log(err);
        }
        // 打开事件
        socket.onopen = function () {
            console.log("连接已打开");
            socket.send(method.sendData(JSON.stringify(firstData), 1, 7, 1));
            socket.send(method.sendData(heartData, 1, 2, 1));
            //发送心跳包
            timer = setInterval(function () {
                socket.send(method.sendData(heartData, 1, 2, 1))
            }, 30000);
            method.data.setSocket(socket);
            method.data.setTimer(timer);
        };
        // 获得消息事件
        socket.onmessage = function (msg) {
            // 发现消息进入 开始处理前端触发逻辑
            var reader = new FileReader();
            reader.readAsArrayBuffer(msg.data); //把blob对象变成arraybuffer
            reader.onload = function (event) {
                var content = reader.result;
                method.handleData(content); // 处理
            };
        };
        // 关闭事件
        socket.onclose = function () {
            console.log("连接已关闭，网页显示弹幕失败");
        };
        // 发生了错误事件
        socket.onerror = function () {
            console.log("连接到弹幕服务器发生了错误，网页显示弹幕失败");
        }
    }
}
