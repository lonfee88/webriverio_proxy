var webdriverjs = require("webdriverjs")
	, Proxy = require('browsermob-proxy').Proxy
	, fs = require('fs')
	, proxyHost = 'localhost'
;

var proxy = new Proxy( { host: proxyHost });
proxy.start(function(err, data) {
	if (!err) {

		//set proxy : www.baidu.com -> z.cn
		proxy.remapHosts(data.port, {'www.baidu.com': '106.50.16.198'}, function(err){
			if(!err){
				console.log('success');
				// SET AND OVERRIDE HTTP REQUEST HEADERS IF YOU WANT TO
				var headersToSet = {
					'User-Agent': 'Bananabot/1.0',
					'custom-header1': 'custom-header1-value',
					'custom-header2': 'custom-header2-value'
				}
				proxy.addHeader(data.port, headersToSet, function (err,resp) {
					if(!err) {
						proxy.startHAR(data.port, 'http://localhost:8004', function (err, resp) {
							if (!err) {
								// DO WHATEVER WEB INTERACTION YOU WANT USING THE PROXY
								doSeleniumStuff(proxyHost + ':' +  data.port, function () {
									proxy.getHAR(data.port, function(err, resp) {
										if (!err) {
											console.log(resp);
											fs.writeFileSync('output.har', resp, 'utf8');
										} else {
											console.err('Error getting HAR file: ' + err);
										}
										proxy.stop(data.port, function() {
											console.log('shutting down after success.');
										});
									});
								});
							} else {
								console.error('Error starting HAR: ' + err);
								proxy.stop(data.port, function () {
									console.log('shutting down after err.');
								});
							}
						});
					} else {
						console.error('Error setting the custom headers');
						proxy.stop(data.port, function () {
						});
					}
				});
			}
			else
				console.log('error');
		});

	} else {
		console.error('Error starting proxy: ' + err);
	}
});


function doSeleniumStuff(proxy, cb) {
	var config = {
		desiredCapabilities: { browserName: 'chrome', proxy: { httpProxy: proxy, proxyType: 'MANUAL' } },
		coloredLogs: false,
		logLevel: 'silent',
		screenshotPath: './screenshots',
		host: '127.0.0.1',
		waitforTimeout: 1000
	};

	var browser = webdriverjs
	.remote(config)
	.init();

	browser
	.url("http://www.baidu.com")
	.pause(1000)
	.saveScreenshot('./z.jpg')
	.url("http://www.weibo.com")
	.pause(1000)
	.saveScreenshot('./w.jpg')
	.end(cb);
}
