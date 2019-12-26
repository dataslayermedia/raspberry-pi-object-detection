const PiCamera = require('pi-camera');

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}


//setInterval(function(){

var imageName = getRandomInt(5000) + '.jpg';
var path = '/home/pi/guitar/pictures/' + imageName;
var publicPath = 'https://storage.googleapis.com/aicam/guitar/' + imageName;


const myCamera = new PiCamera({
	mode: 'photo',
	output: path,
	width: 1080,
	height: 720,
	nopreview: false,
});



var objectDetect = function () {

	myCamera.snap()
		.then((result) => {

			var exec = require('child_process').exec;
			var cmd = '/root/google-cloud-sdk/bin/gsutil cp ' + path + ' gs://aicam/guitar/';

			exec(cmd, function (error, stdout, stderr) {

				console.log(stdout);

				var request = require('request');

				var options = {
					uri: 'https://macgyver.services',
					method: 'POST',
					json: {
						key: "free",
						id: "4Y6s3S8P",
						data: {
							"image": publicPath
						}
					}
				};

				request(options, function (error, response, body) {
					if (!error && response.statusCode == 200) {

						console.log("Probability of Guitar In Frame: " + body.guitar)

						if (body.guitar > 0.3) {

							var cmd = 'omxplayer ./nice-guitar.mp3';
							console.log("Guitar Detected!");

						} else {

							var cmd = 'omxplayer ./show-me-your-guitar.mp3';
							console.log("No Guitar Detected.");
						}

						exec(cmd, function (error, stdout, stderr) {
							objectDetect();
						});

					}

				});

			});

			console.log(result);

		})
		.catch((error) => {
			console.log(error);
		});

}



objectDetect();