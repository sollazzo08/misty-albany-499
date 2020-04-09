/*
    Inspired by https://github.com/MistySampleSkills/BlinkAndLookAround/blob/master/BlinkAndLookAround.js
    and https://github.com/MistyCommunity/JavaScript-SDK/blob/master/Sample%20Code/faceDetection/faceDetection.js
*/

misty.Debug("Moving head and hands to home position");
misty.MoveHeadDegrees(0, 0, 0, 100);
misty.Pause(3000);
misty.MoveArmDegrees("both", 0, 45);

//-------------------------Blink--------------------------------------------------------

// We use a global eyeMemory variable so that we can transition between different emotion like Angry, Sad and Happy through a blink instraed of a hard jump
misty.Set("eyeMemory", "Homeostasis.png");
misty.Set("blinkStartTime",(new Date()).toUTCString());
misty.Set("timeBetweenBlink",5);

function blink_now() {
    misty.Set("blinkStartTime",(new Date()).toUTCString());
    misty.Set("timeBetweenBlink",getRandomInt(2, 8));
    misty.DisplayImage("blinkMisty.png");
    misty.Pause(200);
    misty.DisplayImage(misty.Get("eyeMemory"));
}

misty.StartFaceRecognition();

function registerFaceRec() 
{
    misty.RegisterEvent("FaceRec", "FaceRecognition", 1000, false);
}

function _FaceRec(data) 
{
    var faceDetected = data.PropertyTestResults[0].PropertyParent.Label;

    misty.Debug(faceDetected);

    if (faceDetected == "unknown person") {
        misty.ChangeLED(255, 0, 0);
        misty.DisplayImage("e_Disgust.jpg");
        misty.MoveArmDegrees("right", 70, 50);
        misty.Pause(50);
        misty.MoveArmDegrees("left", 70, 50);
        misty.ClearDisplayText();
    } else if (faceDetected) {
        misty.ChangeLED(148, 0, 211);
        misty.PlayAudio("s_Joy.wav");
        misty.DisplayImage("e_Joy2.jpg");
        misty.MoveArmDegrees("right", -80, 50);
        misty.Pause(50);
        misty.MoveArmDegrees("left", -80, 50);
        misty.Pause(3000);
        misty.Speak("Hello " + faceDetected);
        misty.DisplayText(faceDetected);
    }
}

registerFaceRec();

//-------------------------Random Hand Movement--------------------------------------------
misty.Set("handsStartTime",(new Date()).toUTCString());
misty.Set("timeBetweenHandMotion",5);

function move_hands() {
    misty.Set("handsStartTime",(new Date()).toUTCString());
	misty.Set("timeBetweenHandMotion",getRandomInt(5, 10));
	misty.MoveArmDegrees("both", getRandomInt(0, 7), getRandomInt(50, 100));
}

//-------------------------Look Around-------------------------------------------------------
misty.Set("lookStartTime",(new Date()).toUTCString());
misty.Set("timeInLook",6.0);

function look_around() {
    misty.Set("lookStartTime",(new Date()).toUTCString());
    misty.Set("timeInLook",getRandomInt(5, 10));
    misty.MoveHeadDegrees(gaussianRandom(-40,26), gaussianRandom(-40,40), gaussianRandom(-81,81), 100);
}

//-------------------------Loop---------------------------------------------------------------
while (true) {
	misty.Pause(100);
    if (secondsPast(misty.Get("blinkStartTime")) > misty.Get("timeBetweenBlink")) {
        blink_now();
	}
    if (secondsPast(misty.Get("handsStartTime")) > misty.Get("timeBetweenHandMotion")) {
        move_hands();
	}
	if (secondsPast(misty.Get("lookStartTime")) > misty.Get("timeInLook")) {
		look_around();
	}
}

//-----------------------Support Functions------------------------------------------------
function secondsPast(value) {
	var timeElapsed = new Date() - new Date(value);
    timeElapsed /= 1000;
    return Math.round(timeElapsed); // seconds
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// We use Guassian Random so that a random point Misty chooses to look at stays pretty much in the forward facing cone
// Change Mean and Variance to move the Region of Interest
function gaussianRand() {
    var u = Math.random(); //mean 
    var v = Math.random(); // variance
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    num = num / 10.0 + 0.5; 
    //if (num > 1 || num < 0) gaussianRand(); 
    return num;
}

function gaussianRandom(start, end) {
    return Math.floor(start + gaussianRand() * (end - start + 1));
}

