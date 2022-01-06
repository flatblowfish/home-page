var jsUtil = {
    mobile: /mobile/i.test(window.navigator.userAgent),
    /* 页面加载，元素缓慢上升的动画 */
    moveUp: (function () {
        var time = 0;
        var duration = 100;
        var up = function (e, className) {
            setTimeout(function () {
                e.classList.add(className);
            }, time);
            time += duration;
        };
        return up;
    })(),
}
console.log(jsUtil);
(function () {
    /* 解决移动端浏览器100vh，页面高度大于视口的问题 */
    var appHeight = (function () {
        var f = function () {
            document.documentElement.style.setProperty('--vh', (window.innerHeight * .01) + 'px');
        }
        f();
        return f;
    })();
    window.addEventListener('resize', appHeight);
    /* 音乐按钮，音乐自动播放 */
    const playBtn = document.getElementById('music');
    const myAudio = document.getElementById('audio');
    playBtn.addEventListener('click', () => {
        let isPlaying = playBtn.classList.contains('play');
        if (isPlaying) {
            playBtn.classList.remove('play');
            myAudio.pause();
        } else {
            playBtn.classList.add('play');
            myAudio.play();
        }
    });
    document.addEventListener('DOMContentLoaded', function () {
        var cue_timer = setInterval(function () {
            // 浏览器自动播放被禁用，需要用户交互后才能播放
            // 音频资源没有加载，myAudio.currentTime=0
            if (myAudio.currentTime == 0) {
                playBtn.classList.add('play');
                myAudio.play();
            } else {
                clearInterval(cue_timer);
            }
        }, 500);
    });
})();
/* 背景图片自动切换 */
var bgChange = (function () {
    // 在localStorage的key
    const lastVisitedTime = 'last-visited-time';
    const backgroundImage = 'background-image';
    var preBackgroundImage = localStorage.getItem(backgroundImage) || '';
    var backgroundArr = [];
    var changeInterval = 15;
    var render = function () {};
    var setRender = function (f) {
        render = f;
        start();
        return this;
    }
    var setBackgroundArr = function (arr) {
        backgroundArr = arr;
        return this;
    }
    var setChangeInterval = function (c) {
        changeInterval = c;
        return this;
    }
    var checkTime = function (interval) {
        var lastVisitedTimeLS = localStorage.getItem(lastVisitedTime); // 超过了refreshtime，需要刷新图片
        if (Math.floor((new Date().getTime() - lastVisitedTimeLS) / (1000)) >= interval) {
            return true;
        } else {
            return false;
        }
    }
    var loadImage = function (url, callback) {
        var img = new Image();
        img.src = url;
        img.onload = function () {
            img.onload = null;
            callback(url);
        }
    }
    var getRandomBackground = function () {
        var background = backgroundArr[Math.floor(Math.random() * backgroundArr.length)];
        while (background === preBackgroundImage) {
            background = backgroundArr[Math.floor(Math.random() * backgroundArr.length)];
        }
        return background;
    }
    var start = function () {
        // 效果：用户第一次打开网站，会加载新的图片，用户超过600秒再次打开网站，会加载新图片。用户在600秒中浏览网站，会在后台静默加载图片显示。
        // 1. 第一次浏览网站
        if (!localStorage.hasOwnProperty(lastVisitedTime)) {
            localStorage.setItem(lastVisitedTime, new Date().getTime());
            localStorage.setItem(backgroundImage, backgroundArr[0]);
            loadImage(localStorage.getItem(backgroundImage), render);
            // 2. 不是第一次访问，但是间隔上次访问的时间已经超过了600秒
        } else if (checkTime(600)) {
            localStorage.setItem(lastVisitedTime, new Date().getTime());
            localStorage.setItem(backgroundImage, getRandomBackground());
            loadImage(localStorage.getItem(backgroundImage), render);
            // 3. 不是第一次访问，间隔上次访问的时间也没有超过600秒
        } else {
            loadImage(localStorage.getItem(backgroundImage), render);
        }
        // 4. 总是轮询
        setInterval(function () {
            if (checkTime(changeInterval)) {
                localStorage.setItem(lastVisitedTime, new Date().getTime());
                preBackgroundImage = localStorage.getItem(backgroundImage);
                localStorage.setItem(backgroundImage, getRandomBackground());
                loadImage(localStorage.getItem(backgroundImage), render);
            }
        }, 5000);
    }
    return {
        setBackgroundArr: setBackgroundArr,
        setChangeInterval: setChangeInterval,
        setRender: setRender
    }
})();
var fadeRender = (function () {
    var pageOnload = true;
    var afterOnload = function () {};
    var setAfterOnload = function (f) {
        afterOnload = f;
        return this;
    }
    const divBg1 = document.createElement('div');
    const divBg2 = document.createElement('div');
    var createDom = function () {
        divBg1.setAttribute('style', 'background-repeat:no-repeat;background-attachment:fixed;background-position:50% 50%;background-size:cover;position:fixed;left:0;right:0;top:0;bottom:0;z-index: -999;');
        divBg2.setAttribute('style', 'background-repeat:no-repeat;background-attachment:fixed;background-position:50% 50%;background-size:cover;position:fixed;left:0;right:0;top:0;bottom:0;z-index: -998;');
        document.querySelector('body').appendChild(divBg1);
        document.querySelector('body').appendChild(divBg2);
    }
    var f = function () {
        var backgroundImage = Array.prototype.shift.call(arguments);
        console.log(backgroundImage);
        console.log(pageOnload);
        if (pageOnload) {
            pageOnload = false;
            createDom();
            $(divBg1).css({
                'background-image': 'url(' + backgroundImage + ')',
                opacity: 0
            });
            $(divBg1).animate({
                opacity: 1
            }, 1000, function () {
                $(divBg2).css({
                    'background-image': 'url(' + backgroundImage + ')',
                    opacity: 1
                });
            });
            afterOnload();
        } else {
            // box1在box2后面
            // 切换图片的时候，先把box1的图片换掉
            // 然后box2的旧图片 opacity 在 3000ms 的时间段中变成 0
            // 然后在设置box2的图片为新图片
            // 这样就造成了，旧图片缓慢消失的结果
            divBg1.style.backgroundImage = 'url(' + backgroundImage + ')';
            $(divBg2).animate({
                opacity: 0
            }, 3000, function () {
                $(divBg2).css({
                    'background-image': 'url(' + backgroundImage + ')',
                    opacity: 1
                });
            });
        }
    }
    f.setAfterOnload = setAfterOnload;
    return f;
})();
var rippleRender = (function () {
    var pageOnload = true;
    var rippleComplete = false;
    var afterOnload = function () {};
    var setAfterOnload = function (f) {
        afterOnload = f;
        return this;
    }
    const jqRipplesWidth = document.querySelector('.main').clientWidth;
    const jqRipplesHeight = document.querySelector('.main').clientHeight;
    var jqRipplesDropRadius = 10;
    const divBg1 = document.createElement('div');
    const divBg2 = document.createElement('div');
    var createDom = function () {
        divBg1.setAttribute('style', 'background-repeat:no-repeat;background-attachment:fixed;background-position:50% 50%;background-size:cover;position:fixed;left:0;right:0;top:0;bottom:0;z-index: -999;');
        divBg2.setAttribute('style', 'background-repeat:no-repeat;background-attachment:fixed;background-position:50% 50%;background-size:cover;position:fixed;left:0;right:0;top:0;bottom:0;z-index: -998;');
        document.querySelector('body').appendChild(divBg1);
        document.querySelector('body').appendChild(divBg2);
    }
    var f = function () {
        var backgroundImage = Array.prototype.shift.call(arguments);
        console.log(backgroundImage);
        console.log(pageOnload);
        rippleComplete = false;
        // 注意：虽然这个if-else有很多的重复代码，但是由于第一次加载和其后加载中操作两个dom参数有很多不同，所以不需要重构，重构对易于理解毫无帮助。
        if (pageOnload) {
            pageOnload = false;
            createDom();
            $(divBg1).css({
                'background-image': 'url(' + backgroundImage + ')',
                opacity: 0
            });
            $(divBg1).animate({
                opacity: 1
            }, 1000, function () {
                $(divBg2).css({
                    'background-image': 'url(' + backgroundImage + ')',
                    opacity: 1
                });
                $(divBg2).ripples({
                    resolution: 512, //The width and height of the WebGL texture to render to. The larger this value, the smoother the rendering and the slower the ripples will propagate.
                    dropRadius: jqRipplesDropRadius, //The size (in pixels) of the drop that results by clicking or moving the mouse over the canvas.
                    perturbance: 0.04 //Basically the amount of refraction caused by a ripple. 0 means there is no refraction.
                });
                // 每次加载背景，都点击一次水波
                // ripple插件没有提供，canvas完成后的回调函数，所以等待500ms
                setTimeout(function () {
                    rippleComplete = true;
                    $(divBg2).ripples('drop', Math.floor(Math.random() * jqRipplesWidth), Math.floor(Math.random() * jqRipplesHeight), 1.5 * jqRipplesDropRadius, 0.14);
                }, 500);
            });
            // 事件只绑定一遍
            // radius的系数1，1.5是从源码中获取的，10是默认的radius配置值
            // 也就是radius，点击的时候，是滑动时候的1.5倍
            $('body').on('mousemove', function (e) {
                    if (!rippleComplete) return;
                    $(divBg2).ripples('drop', e.clientX, e.clientY, 1 * jqRipplesDropRadius, 0.01);
                })
                .on('touchmove touchstart', function (e) {
                    if (!rippleComplete) return;
                    var touches = e.originalEvent.changedTouches;
                    for (var i = 0; i < touches.length; i++) {
                        $(divBg2).ripples('drop', touches[i].clientX, touches[i].clientY, 1 * jqRipplesDropRadius, 0.01);
                    }
                })
                .on('mousedown', function (e) {
                    if (!rippleComplete) return;
                    $(divBg2).ripples('drop', e.clientX, e.clientY, 1.5 * jqRipplesDropRadius, 0.14);
                });
            // 每间隔5秒，点击一次水波
            setInterval(function () {
                if (!rippleComplete) return;
                $(divBg2).ripples('drop', Math.floor(Math.random() * jqRipplesWidth), Math.floor(Math.random() * jqRipplesHeight), 1.5 * jqRipplesDropRadius, 0.14);
            }, 5000);
            // 回调函数
            afterOnload();
        } else {
            // box1在box2后面
            // 切换图片的时候，先把box1的图片换掉
            // 然后box2的旧图片 opacity 在 3000ms 的时间段中变成 0
            // 然后在设置box2的图片为新图片
            // 这样就造成了，旧图片缓慢消失的结果

            // ripples创建的canvas元素在box2下面，所以box2的opacity动画可以应用到canvas
            divBg1.style.backgroundImage = 'url(' + backgroundImage + ')';
            $(divBg2).animate({
                opacity: 0
            }, 3000, function () {
                $(divBg2).ripples('destroy');
                $(divBg2).css({
                    'background-image': 'url(' + backgroundImage + ')',
                    opacity: 1
                });
                $(divBg2).ripples({
                    resolution: 512, //The width and height of the WebGL texture to render to. The larger this value, the smoother the rendering and the slower the ripples will propagate.
                    dropRadius: 10, //The size (in pixels) of the drop that results by clicking or moving the mouse over the canvas.
                    perturbance: 0.04 //Basically the amount of refraction caused by a ripple. 0 means there is no refraction.
                });
                // 每次加载背景，都点击一次水波
                // ripple插件没有提供，canvas完成后的回调函数，所以等待500ms
                setTimeout(function () {
                    rippleComplete = true;
                    $(divBg2).ripples('drop', Math.floor(Math.random() * jqRipplesWidth), Math.floor(Math.random() * jqRipplesHeight), 1.5 * jqRipplesDropRadius, 0.14);
                }, 500);
            });
        }
    }
    f.setAfterOnload = setAfterOnload;
    return f;
})();
var backgroundArr = [
    "background-image/c30666fd.jpg",
    "background-image/00040f35.jpg",
    "background-image/347cd503.jpg",
    "background-image/47b0bda9.jpg",
    "background-image/5100af4d.jpg",
    "background-image/93ee856b.jpg",
    "background-image/9983d3dc.jpg",
    "background-image/aa75535e.jpg",
    "background-image/cf662f1c.jpg",
    "background-image/e19747ce.jpg",
    "background-image/e85e231b.jpg",
    "background-image/f3d0a31a.jpg"
];
var backgroundMobileArr = [
    "background-image-mobile/000c6bca.jpg",
    "background-image-mobile/135f8ef7.jpg",
    "background-image-mobile/1b3c6bca.jpg",
    "background-image-mobile/400d87a5.jpg",
    "background-image-mobile/4da30c89.jpg",
    "background-image-mobile/5a2554e2.jpg",
    "background-image-mobile/5af4754e.jpg",
    "background-image-mobile/5bf8e947.jpg",
    "background-image-mobile/62b546ae.jpg",
    "background-image-mobile/6e8a2aac.jpg",
    "background-image-mobile/7fa51f4f.jpg",
    "background-image-mobile/913815df.jpg",
    "background-image-mobile/beeb561b.jpg",
    "background-image-mobile/f8112954.jpg"
];
/* 页面加载完毕后的回调 */
var pageOnload = function () {
    document.querySelectorAll('.container, .container > div.moveup').forEach(function (e) {
        jsUtil.moveUp(e, 'up');
    });
    document.querySelectorAll('.lovebear-container').forEach(function (e) {
        jsUtil.moveUp(e, 'lovebear-up');
    });
    document.querySelectorAll('.lovedog-container').forEach(function (e) {
        jsUtil.moveUp(e, 'lovedog-up');
    });
    document.querySelectorAll('.lovecactus-container').forEach(function (e) {
        jsUtil.moveUp(e, 'lovecactus-up');
    });
}
fadeRender.setAfterOnload(pageOnload);
rippleRender.setAfterOnload(pageOnload);
if (jsUtil.mobile) {
    bgChange.setBackgroundArr(backgroundMobileArr).setChangeInterval(15).setRender(fadeRender);
} else {
    bgChange.setBackgroundArr(backgroundArr).setChangeInterval(25).setRender(rippleRender);
}
