/**
 * Created by bruceliu on 16/7/18.
 */
'use strict';

var log4js = require('../applog').logger;

var httpRequest = require('../service/httpRequest');
var http = require('http');
var url = require('url');
var xml2js = require('xml2js');

function paramatizeXML(params, operationName) { //20160616153240062152622，20160616153240，15332149966，0,3,5,0
    var xmlrequest = '';
    if (params.length === 2) {
        var xmlrequest = '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:quer="http://query.billing.ctnc.lianchuang.com">' +
            '<soapenv:Header/>' +
            '<soapenv:Body>' +
            '<quer:' + operationName + ' soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
            '  <string xsi:type="xsd:string"></string> ' +
            '<string0 xsi:type="xsd:string">' + params[0] + '</string0>' +
            '<string1 xsi:type="xsd:string">' + params[1] + '</string1>' +
            '</quer:' + operationName + '>' +
            '</soapenv:Body>' +
            '</soapenv:Envelope>';
    } else {

        var xmlrequest = '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ocs="ocs.server">' +
            '<soapenv:Header/>' +
            '<soapenv:Body>' +
            '<ocs:' + operationName + ' soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' + //AccountQuery
            '<in0 xsi:type="cli:AccountQueryRequest" xmlns:cli="http://client.ocs.com">' +
            '<requestId xsi:type="xsd:string">' + params[0] + '</requestId>' +
            '<requestTime xsi:type="xsd:string">' + params[1] + '</requestTime>' +
            '<destinationId xsi:type="xsd:string">' + params[2] + '</destinationId>' +
            '<destinationAttr xsi:type="xsd:int">' + params[3] + '</destinationAttr>' +
            '<objType xsi:type="xsd:int">' + params[4] + '</objType>' +
            '<balanceType xsi:type="xsd:int">' + params[5] + '</balanceType>' +
            '<balanceQueryFlag xsi:type="xsd:int">' + params[6] + '</balanceQueryFlag>' +
            '</in0>' +
            '</ocs:AccountQuery>' +
            '</soapenv:Body>' +
            '</soapenv:Envelope>';
    }
    return xmlrequest;
}


function execGet(apiurl, taskid, api_method, operationname, params) {

   // params = "15332149966, 0";

    var urljson = url.parse(apiurl);
    if (!(urljson.port)) urljson.port = 80;
    var xml = '';

    //log4js.debug('长度：' + params.length);

    //log4js.debug('operation' + operationname + ' params = ' + params);
    if (params) {

        //if (params.length === 2) http_options.headers.remove(2);
        params = params.split(',');

        xml = paramatizeXML(params, operationname);
        //console.log(xml);
    }
    var soapaction = '';
    if (params) {

        if (params.length > 2) {

            //log4js.debug('是否能够新增呢？' + taskid + ' ' + params.length);

            soapaction = ',"SOAPAction":"AccountQuery"';
        }
    }
    var http_options = '{"hostname": "' + urljson.hostname + '","port"' + ':"' + urljson.port + '",' +
        '"path":' + '"' + urljson.path + '","method":' + '"' + api_method + '",' +
        '"headers": { ' +
            //'"Connection": "Keep-Alive",' +
            //"Content-Type": 'text/xml;charset=utf-8',
            //'"Content-Type": "application/x-www-form-urlencoded",' +
        '"Content-Type": "text/xml;charset=utf-8",' +
        '"Content-Length":"' + xml.length + '"' +
        soapaction + //',"SOAPAction":"AccountQuery"' +
        '}}';

    http_options = JSON.parse(http_options);

    //'136.74.100.232',//'/webTelecom-web-services/WebTelecom?wsdl',//'GET',

    log4js.debug('任务开始：' + taskid + " " + Date());

    // do the GET request
    var time = process.hrtime();
    // [ 1800216, 25 ]

    var currentTime = new Date().getTime();
    var xmlresponse = '';
    var reqGet = http.request(http_options, //http_options,
        function (res) {
            log4js.debug("statusCode: ", res.statusCode + ' taskid=' + taskid + ' ' + Date());

            //setTimeout(() =>
            //{
            var diff = process.hrtime(time);
            // [ 1, 552 ]
            var responseTime = ((diff[0] * 1e9 + diff[1]) / 1000000).toFixed(2); //000
            log4js.debug('耗时 %d 毫秒' + ' ' + taskid, responseTime);
            //写入数据库


            if (res.statusCode >= 200 && res.statusCode < 300) {
                var availrate = 1, correctrate = 1;
            } else {

                var availrate = 1, correctrate = 0;


            }

            //console.log('STATUS: ' + res.statusCode);
            //console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                //console.log(chunk);
                xmlresponse = xmlresponse + chunk;

            });

            res.on('end', () => {
                console.log('No more data in response.')
                console.log(xmlresponse);
                xml2js.parseString(xmlresponse, {explicitArray: false, ignoreAttrs: true}, function (err, jsonres) { //{explicitArray : false},
                    //console.log();
                    var jsonstr = JSON.stringify(jsonres);
                    //jsonstr = jsonstr.replace(/env:/, "env_").replace(/env:/, "env_").replace(/env:/, "env_");
                    console.log(jsonstr);
                    //jsonstr = JSON.stringify(jsonstr);
                    //console.log(jsonstr);
                    //jsonstr = JSON.parse(jsonstr);
                    //console.log(jsonstr);
                    console.log('______');
                    //jsonstr = JSON.stringify(jsonstr.env_Envelope.env_Body).replace(/m:/, "m_");
                    //console.log(jsonstr);
                    //jsonstr = JSON.parse(jsonstr);
                    //console.log(JSON.stringify(jsonstr.m_getDisctResponse.result));

                });
            })

            httpRequest.httpPost(currentTime, res.statusCode, responseTime, taskid, availrate, correctrate, '');


        }); //.bind(null,connection,taskid)
    if (api_method.toUpperCase() === 'POST') {
        //log4js.debug('write xml :' + xml);
        reqGet.write(xml);
    }
    reqGet.end();
    reqGet.on('error', function (e) {
            httpRequest.httpPost(currentTime, 0, 0, taskid, 0, 0, e.message);
            console.error('网络问题:' + e.message + ' taskid = ' + taskid); // + res.statusCode);
        }
    );

    log4js.debug("调用结束 " + taskid);
}


module.exports.execGet = execGet;


