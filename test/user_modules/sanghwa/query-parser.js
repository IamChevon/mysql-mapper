/**
 * Created by ddavid on 2015-08-11.
 */
var queryStorage     =    require('./query-storage');

var qp = function(){

    this.prePath = 'query';

    this.setPath = function(prePath){
        this.prePath = prePath;
    }

    this.start = function (arr){
        for(var i =0; i<arr.length; i++){
            var fileName = arr[i];
            var fs = require('fs');
            var data = fs.readFileSync(this.prePath+'/'+ fileName, 'utf8');

            this.parsing(data);
        }
    }

    /**
     * divding queries by Category name, id
     */
    this.parsing = function (data){

        var map = [];

        var id = [];

        var startIndex = -1;
        var colonIndex = -1;
        var endIndex = -1;

        var lastStartIndex = -1;
        var lastEndIndex = -1;

        // remove comment
        console.log('comment : ' + data);
        data = this.removeComment(data);
        console.log('removed comment : ' + data);

        for(var i = 0;i < data.length;i++){

            if(startIndex == -1){
                if(data[i] == '{'){
                    startIndex = i;
                }
            }else{
                if(data[i] == ':'  ){
                    colonIndex = i;
                }else if(data[i] == '}'){
                    endIndex =i;
                }else if(data[i] == '{'){
                    if(data[i+1] == '/'){
                        lastStartIndex = i;
                        lastEndIndex = i+2;
                        i = i+2;

                        // doing action
                        //console.log("startIndex", startIndex);
                        //console.log("colonIndex", colonIndex);
                        //console.log("endIndex", endIndex);
                        //console.log("lastStartIndex", lastStartIndex);
                        //console.log("lastEndIndex", lastEndIndex);
                        //
                        //console.log(data.substring(startIndex+1, colonIndex));
                        //console.log(data.substring(colonIndex+1, endIndex));
                        //console.log(data.substring(endIndex+1, lastStartIndex));
                        var menu = data.substring(startIndex+1, colonIndex).trim();
                        var id = data.substring(colonIndex+1, endIndex).trim();
                        var content  = data.substring(endIndex+1, lastStartIndex).trim();

                        console.log(menu);

                        if(queryStorage.queryMap[menu] == null){
                            queryStorage.queryMap[menu] = [];
                        }
                        var ids = queryStorage.queryMap[menu];
                        ids[id] = content;
                        // 초기화
                        startIndex = -1;
                        colonIndex = -1;
                        endIndex = -1;

                        lastStartIndex = -1;
                        lastEndIndex = -1;

                        continue;
                    }else{
                        console.log('Query grammar is not proper');
                    }
                }
            }
        }
        return;
    },


    /**
     * filtering query if it exist finding [] [/] tags
     */
    this.parsingQuery = function(data, filed){
        var startIndex = -1;
        var endIndex = -1;

        // 다음내용이 list 인지 체크
        var isList = false;

        var lastStartIndex = -1;
        var lastEndIndex = -1;

        var currentPosition =0;

        var realQuery = '';

        console.log(data);
        for(var i = 0;i < data.length;i++){
            if(startIndex == -1){
                if(data[i] == '['){
                    if(data[i+1] =='@' ){
                        isList = true;
                    }
                    startIndex = i;
                    realQuery += data.substring(currentPosition, i);
                }
            }else{
                if(data[i] == ']'){
                    endIndex =i;
                }else if(data[i] == '['){
                    if(data[i+1] == '/'){
                        lastStartIndex = i;
                        lastEndIndex = i+2;
                        i = i+2;

                        // doing action
                        //console.log("startIndex", startIndex);
                        //
                        //console.log("endIndex", endIndex);
                        //console.log("lastStartIndex", lastStartIndex);
                        //console.log("lastEndIndex", lastEndIndex);
                        //
                        //console.log(data.substring(startIndex+1, endIndex));
                        //console.log(data.substring(endIndex+1, lastStartIndex));





                            if(isList){
                                var checkVal = data.substring(startIndex+2, endIndex);
                                var seperator = checkVal.substring(checkVal.lastIndexOf('@')+1, data.length);
                                checkVal = checkVal.substring(0, checkVal.indexOf('@'));

                                if(filed[checkVal] != null){

                                var array = filed[checkVal];
                                if(array instanceof Array){
                                    var middleData = data.substring(endIndex+1, lastStartIndex);
                                    for(var k=0; k<array.length; k++){
                                        var indexData = array[k];
                                        var subField = [];
                                        subField[checkVal] = indexData;
                                        realQuery +=  this.replacingQuery(middleData, subField);
                                        if(k != array.length-1){
                                            realQuery += seperator;
                                        }
                                    }
                                }else{
                                    console.log('this is not array instacne');
                                }
                            }
                        }else{
                        // 만약에 null 이면 모두 짜른다
                             var checkVal = data.substring(startIndex+1, endIndex);
                            if(filed[checkVal] != null){
                                realQuery += data.substring(endIndex+1, lastStartIndex);
                            }
                        }
                        // 초기화
                        startIndex = -1;
                        endIndex = -1;

                        lastStartIndex = -1;
                        lastEndIndex = -1;

                        currentPosition = i+2;
                        isList = false;
                        continue;
                    }else{
                        console.log('error');
                    }
                }
            }
        }
        realQuery += data.substring(currentPosition, data.length);

        // console.log("input : " + data);
        // console.log("output : " + realQuery);

        return realQuery;
    },


    /**
     * this replace #variable with real value
    */
    this.replacingQuery = function(data, filed){
        var realQuery = '';
        var currentIndex =0;

        for(var i=0; i<data.length; i++){
            if(data[i] == '#'){
                var startIndex =i+1;
                realQuery += data.substring(currentIndex, i);
                while(true){
                    i++;
                    if(data[i] =="'" || data[i] ==' ' ||data[i] == '\n' || data[i] =='\t'){
                        var key = data.substring(startIndex, i);
                        //console.log("realQuery  before: " + realQuery);
                        //console.log("key : " + key);
                        //console.log("filed[key] : " + filed[key]);
                        if(filed[key] != null){
                            realQuery +=filed[key];
                            currentIndex =i;
                        }else{
                            console.error('#parameter error');
                            //throw new Error('#parameter error');
                        }
                        break;
                    }else if(i == data.length){
                        var key = data.substring(startIndex, i);
                        if(filed[key] != null){
                            realQuery +=filed[key];
                            currentIndex =i;
                        }else{
                            console.error('#parameter error');
                            //throw new Error('#parameter error');
                        }
                        break;
                    }
                }
            }
        }
        realQuery += data.substring(currentIndex, data.length);
        //console.log('real : ' + realQuery);
        return realQuery;
    }

    /**
     * remove comment    style is --
     * @param data
     * @returns {*}
     */
    this.removeComment = function(data){
        var dataNew = '';
        var startIndex =0;


        for(var i=0; i<data.length; i++){

            if(data[i] == '-'){
                if(i+1< data.length && data[i+1] == '-'){
                    dataNew += data.substring(startIndex, i);
                    // 주석이라는 말, 이전까지의 데이터를 dataNew에 더한다
                    i= i+2;

                    if(i>=data.length){
                        startIndex = i;
                    }else{
                        while(i<data.length){
                            if(data[i] =='\n' || data[i] == '\r' || data[i] == '\r\n') {  // newline
                                startIndex = i;
                                break;
                            }
                            startIndex = i;
                            i++;
                        }
                    }
                }
            }
        }

        dataNew += data.substring(startIndex,  data.length);
        return dataNew;
    }
};
module.exports = new qp();