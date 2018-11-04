(function (modules) {
    var installedModules = {};
    function _kitty_require(moduleId) {
        if(installedModules[moduleId]){
            return installedModules[moduleId].exports;
        }
        var module = installedModules[moduleId] = {
            exports:'',
            id:moduleId
        };
        modules[moduleId].call(module.exports,module,_kitty_require);
        return module.exports;
    }
    return _kitty_require('2');
})({"2":function(module,_kitty_require){var Util =_kitty_require("1");
chrome.runtime.onMessage.addListener(function () {
    var msg = arguments[0][0];
    var url = arguments[0][1];
    var cb = arguments[2];
    Build.build(msg,url,cb);
});

Build = {
    build:function(msg,url,cb){
        this.ajax = this._ajax;
        this.init(msg,url,cb);
    },

    init:function(msg,url,cb){
        if(!msg || !Util.isString(msg)){
            return;
        }
        this.msg = msg.trim().replace(/\n/g,'');
        this.url = url;
        this.cb = cb;
        this.start();
        Build.notice();
    },

    start:function(){
        var msg = this.msg;
        if(!Util.isJson(msg) && !Util.isJsonP(msg)){
            this.ajax();
        }else{
            this.parse();
        }
    },

    notice:function(){
        if(chrome.app){
            var storage = window.localStorage;
            var notice = storage.getItem('notice');
            if(notice!=="1"){
                storage.setItem('notice',"1");
                chrome.tabs.create({url:'http://tools.vkitty.org/jsonview?notice=1'});
            }
        }
    },

    _ajax:function(){
        $.ajax({
            url:this.url,
            dataType: 'text',
            async:false,
            success: function (result) {
                if(result){
                    Build.ajax = function(){};
                    Build.init(result,Build.url,Build.cb);
                }
            }
        })
    },

    parse:function(){
        var msg = this.msg;
        this.startMsg = '';
        this.endMsg = '';
        if(Util.isJsonP(msg)){
            var m = msg.match(/^(\w+\()(.+)\)$/);
            this.startMsg = m[1];
            msg = m[2];
            this.endMsg = '})';
        }

        try {
            var newMsg = JSON.parse(msg);
            var html = this.forMat(newMsg);
            if (this.startMsg) {
                html = '<div id="main">' + this.startMsg + html + this.endMsg + '</div>';
            } else {
                html = '<div id="main" class="distance">' + this.startMsg + html + this.endMsg + '</div>';
            }
            this.cb([html,this.msg]);
        } catch (e) {
            throw e;
        }
    },

    /**
     * 格式化数据
     * @param msg
     */
    forMat: function (msg) {
        var str = '';
        if (Util.isBaseType(msg)) {
            str += this.getBaseTypeStr(msg);
        }

        if (Util.isArray(msg)) {
            str += this.getArrayStr(msg);
        }

        if (Util.isObject(msg)) {
            str += this.getObjectStr(msg);
        }

        return str;
    },

    /**
     * 基础数据类型数据
     */
    getBaseTypeStr: function (val) {
        var msg = '', type = Util.getType(val);
        if (!Util.isBaseType(val)) {
            return false;
        }
        if (Util.isNull(val)) {
            msg = 'null';
        } else {
            msg = val.toString();
        }
        if (Util.isUrl(val)) {
            var imgUrlClass = '';
            if (Util.isgImgUrl(val)) {
                imgUrlClass = 'imgUrl';
            }
            msg = '"<a href="' + val + '" class="' + imgUrlClass + '">' + val + '</a>"';
        } else if (Util.isString(val)) {
            msg = val.split("<").join("&lt;").split(">").join("&gt;");
            msg = '"' + msg + '"';
        }
        return ' <span class="F' + type + '">' + msg + '</span>';
    },

    /**
     * 获取数值数据类型
     * @param val
     */
    getArrayStr: function (val) {
        if (!Util.isArray(val)) {
            return false;
        }
        var i = 0, len = val.length, str = '', comma = ',';
        if (!len) {
            return '[]';
        }
        str += '<span class="collapser"> -</span><span> [</span><div class="Farray">';
        for (; i < len; i++) {
            if (i === (len - 1)) {
                comma = '';
            }
            str += '<div class="distance J-hover">' + this.forMat(val[i]) + comma + '</div>';
        }
        str += '</div><span> ]</span>';
        return str;
    },

    /**
     * 获取对象字符串
     * @returns {boolean}
     */
    getObjectStr: function (val) {
        if (!Util.isObject(val)) {
            return false;
        }
        var i = 0, len = Util.getObjectLength(val), str = '', comma = ',';
        if (!len) {
            return '{}';
        }
        str += '<span class="collapser"> -</span><span> {</span><div class="Fobject">';
        for (var k in val) {
            i++;
            if (i === (len)) {
                comma = '';
            }
            str += '<div class="distance J-hover"> <span class="property">' + k + '</span>:' + this.forMat(val[k]) + comma + '</div>';
        }
        str += '</div><span> }</span>';
        return str;
    }
};},"1":function(module,_kitty_require){var toString = {}.toString;

var Util = {
    isFunction: function (it) {
        return toString.call(it) === "[object Function]";
    },

    isString: function (it) {
        return toString.call(it) === "[object String]";
    },

    isNumber:function(it){
        return toString.call(it) === "[object Number]";
    },

    isBoolean:function(it){
        return toString.call(it) === "[object Boolean]";
    },

    isNull:function(it){
        return (it === null);
    },

    isArray: function (it) {
        return toString.call(it) === "[object Array]";
    },

    isObject: function (it) {
        return toString.call(it) === "[object Object]";
    },

    isBaseType:function(it){
        return (!this.isArray(it) && !this.isObject(it));
    },

    isUrl:function(it){
        return (/^https{0,1}:\/\//i.test(it));
    },

    isgImgUrl:function(it){
        it = it.trim();
        return /\.(jpeg|jpg|gif|png|bmp|webp|ico)(\?.*)*$/i.test(it);
    },

    isJsonP:function(it){
        return /^[^\(]+\([\[\{].*[\}\]]\)$/.test(it);
    },

    isJson:function(it){
        return /^[\{\[].*[\}\]]$/.test(it);
    },
    /**
     * 获取数据类型 小写
     * @param it
     * @returns {*}
     */
    getType:function(it){
        var type = toString.call(it);
        var m = type.match(/\s(\w+)\]$/i);
        type = m[1].toLowerCase().trim();
        return type;
    },
    /**
     * 获取对象长度
     */
    getObjectLength:function(obj){
        var len = Object.keys(obj).length;
        return len;
    }
};

module.exports = Util;}});