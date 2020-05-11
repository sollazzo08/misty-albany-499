/******************************************************************************************
 * This is a simple "sleep detection" skill. When started, Misty will tell the staff member 
 * to verify that they are awake. 
 * 
 * We borrowed from https://github.com/MistySampleSkills/Misty-Concierge-Template/blob/master/JavaScript/conciergeBaseTemplate/conciergeBaseTemplate.js
 * in order to access Google Dialogflow API
*/

//function to set Misty in a "home" position, looking straight ahead, arms to the side, etc
function robotHomePosition() 
{
    misty.MoveHead(0, 0, 0, null, 1);
    misty.DisplayImage("e_DefaultContent.jpg");
    misty.MoveArmDegrees("both", 90, 100);
    misty.SetDefaultVolume(100);
}
robotHomePosition();

// Kicks everything off!
getAccessToken();

function initiateTokenRefresh() {
    misty.Set("googleAuthToken", "not updated yet", false);
    _getAuthToken();
    misty.RegisterTimerEvent("getAuthToken", 60000 * 15, true);
}
initiateTokenRefresh();

function _getAuthToken() {
    misty.SendExternalRequest("POST", misty.Get("cloudFunctionAuthTokenURL"), null, null, null, false, false, null, "application/json", "_UpdateAuthToken");
}

function _UpdateAuthToken(data) 
{
    misty.Set("googleAuthToken", JSON.parse(data.Result.ResponseObject.Data).authToken, false);
    misty.Debug("Updated Auth Token");
}

//credentials required to access Google Dialogflow 
function creds(){
    misty.Set("cloudFunctionAuthTokenURL", "https://us-central1-mistyvoicecommand-otapmj.cloudfunctions.net/get-access-token", false);
    misty.Set("GoogleCloudProjectID", "mistyvoicecommand-otapmj", false);
    misty.Set("langCodeForTTS", "en-US", false);
    misty.Set("genderCodeForTTS", "FEMALE", false);
}
creds();

// Creates a unique session ID for opening a session with our Dialogflow agent.
function getSessionId(){
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Gets an access token for use with DialogFlow API
function getAccessToken(){
    misty.SendExternalRequest("POST",  _params.getAccessTokenUrl, null, null, null, false, false, null, "application/json", "SetAccessToken");
}

function SetAccessToken(data){
    let response = JSON.parse(data.Result.ResponseObject.Data)
    misty.Set("googleAccessToken", response.accessToken);

    startToListen();
}

//This function makes Misty ask the staff member to make a sound if they are awake, and listens for any soudn response.
function startToListen() {
  
   misty.PlayAudio("sleep_detect.wav", 90);
   misty.Pause(7000);
   processResponse(); 
}


//In this function, the audio file of audio input is processed.
function _VoiceRecord(){
    misty.Debug("Speech captured.")
    misty.GetAudioFile("capture_HeyMisty.wav", "ProcessAudioFile");
    ProcessAudioFile("capture_HeyMisty.wav");
}

//This was for testing purposes, to make sure that Misty was recording an audio file we had her play it back for 
//before continuing on in the conversation
function _SpeechCaptured(data) {
    misty.Debug("SpeechCaptured!");
    let filename = data.AdditionalResults[0];
    let success = data.AdditionalResults[1];
    misty.Debug(filename);
    misty.Debug("Success = " + success);
    if (success == true && filename == "capture_Dialogue.wav"){
            misty.Debug("captured recording after wake word - " + filename);
            misty.Debug("Time to Process " + filename);
            misty.GetAudioFile(filename, "ProcessAudioFile");
    }
    else{
        misty.Debug("Going to wake up");
        wakeUp();
    }
}

// Sends speech recording to DialogFlow. Dialogflow uses 
// speech-to-text to match the recording with an "intent" we define in
// the DialogFlow project, then sends a response back with intent data.
// We use this response data to change Misty's LED.
function ProcessAudioFile(data) {
    misty.Debug("Process Audio File: " + data);
    // Set variable with base64 data for capture_HeyMisty audio file
    let base64 = data.Result.Base64;

    // Set up params for request to DialogFlow
    let sessionId = getSessionId();
	let url = "https://dialogflow.googleapis.com/v2/projects/" + _params.projectID + "/agent/sessions/" + sessionId + ":detectIntent";
    let authorizationType =  "Bearer";
    let dialogFlowParams = JSON.stringify({
        "queryInput": {
            "audioConfig": {
                "audioEncoding": "AUDIO_ENCODING_LINEAR_16",
                "languageCode": "en-US",
                "sampleRateHertz": 16000
            }
        },
        "inputAudio": base64
    });

    let accessToken = misty.Get("googleAccessToken");

    misty.SendExternalRequest("POST", url, authorizationType, accessToken, dialogFlowParams, false, false, null, "application/json", "ProcessDialogFlowResponse");
}

// Handles response from Dialogflow agent
// This was heavily inspired by the code found here  https://github.com/MistySampleSkills/Misty-Concierge-Template/blob/master/JavaScript/conciergeBaseTemplate/conciergeBaseTemplate.js
// Checks to see if the staff member has made any sound, if yes Misty prompts them to put their face in front of her camera to face recognise
// Otherwise, Misty plays an alarm (in an attempt to wake them up) and prompts the user to make a sound again, like she did initially.
function ProcessDialogFlowResponse(data) {
    if(data == 'no response'){
        misty.Debug("there is no data");
        intent = 'sleep';
    }
    // Gets the intent and parameters from the response
    let response = JSON.parse(data.Result.ResponseObject.Data)
    let intent = response.queryResult.intent.displayName;
    let parameters = response.queryResult.parameters;

    // Prints some debug messages with contents of the response
    misty.Debug("Intent: " + intent);
    misty.Debug("Input text: " + response.queryResult.queryText);
    
    //response.queryResult.queryText checks if there is any value for that in the JSON object returned from Dialogflow
    if(response.queryResult.queryText){
        //Misty makes a happy face and moves her arms to show she's happy.
        animateCompliance();
        misty.Debug("Good! You're awake!");
        misty.Pause(4000);
        misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
        speakTheText();
       
        misty.Pause(7000);

        misty.MoveHead(0, 0, 0, null, 1);
        
        //Uncomment the line below to cancel the skill
        //misty.CancelSkill("1cde7616-1f78-49e2-9cb1-de7827e98dee");
        misty.ChangeLED(255, 0, 0);
        misty.StartFaceRecognition();
        registerFaceRec();

    }
    else{
        //calls wakeUp function 
        wakeUp();
    }
}

//this function makes Misty play an alarm sound in an attempt to wake up the staff member
function wakeUp(){
    //maybe this'll work *shrug*
    misty.PlayAudio("Warning Siren.mp3", 10);
    misty.Pause(7000);
    misty.PlayAudio("sleep_detect.wav", 90);
    misty.Pause(5000);
    misty.Debug("Misty didn't hear user or didn't understand response. Please try again.")
    //listens for response again.
    processResponse();
}

//function to add some personality to Misty
function animateCompliance() {
    misty.MoveHeadDegrees(-15, 0, 0, 100);
    misty.PlayAudio("s_Acceptance.wav");
    misty.DisplayImage("e_Joy2.jpg");
    misty.MoveArms(0, -25, 100, 100);
}

// This uses the TTS API and gets Misty to read out the text that was produced by DialogFlow.
function speakTheText() {
    var arguments = JSON.stringify({
        'input': {
            'text': misty.Get("textToSpeak")
        },
        'voice': {
            'languageCode': misty.Get("langCodeForTTS"),
            'ssmlGender': misty.Get("genderCodeForTTS")
        },
        'audioConfig': {
            'audioEncoding': "LINEAR16",
            "effectsProfileId": [
                "handset-class-device"
            ],
            "pitch": 5,
            "speakingRate": 0.91
        }
    });

    misty.Debug("Sending Data to Google");
    misty.SendExternalRequest("POST", "https://texttospeech.googleapis.com/v1beta1/text:synthesize", "Bearer", misty.Get("googleAccessToken"), arguments, false, false, null, "application/json", "_Base64In")
    misty.Debug("Text sent to Google Text to Speech API");
}

// Turn the audio file to Base64.
function _Base64In(data) {
    misty.Debug("Audio(base64) in from Google TTS API");
    misty.Debug(JSON.stringify(data));

    misty.Set("playingAudio", true, false);
    
    //This one works, go back to this one if anything
    // Saves and plays the Base64-encoded audio data 
    misty.SaveAudio("tts.wav", JSON.parse(data.Result.ResponseObject.Data).audioContent, true, true);
}

//Helper function for Misty to process a response in the conversation
function processResponse() {
    //Misty starts listening, overwrites previous recording audio file
    //Does NOT require Misty's key phrase to start speaking
    misty.Debug("Misty is listening for a response!")
    misty.CaptureSpeech(false, true, 5000, 7000);
    misty.Pause(2000);
    misty.AddReturnProperty("SpeechCaptured", "Filename");
    misty.AddReturnProperty("SpeechCaptured", "Success");
    misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
}
/*
    The following facial recognition code was Inspired by
     https://github.com/MistySampleSkills/BlinkAndLookAround/blob/master/BlinkAndLookAround.js
    and https://github.com/MistyCommunity/JavaScript-SDK/blob/master/Sample%20Code/faceDetection/faceDetection.js
*/
function registerFaceRec() {
    misty.RegisterEvent("FaceRec", "FaceRecognition", 1000, false);
}

function _FaceRec(data) {
    var faceDetected = data.PropertyTestResults[0].PropertyParent.Label;

    misty.Debug(faceDetected);

    //if face is unknown, made a questioning face
    if (faceDetected == "unknown person") {
        misty.ChangeLED(255, 0, 0);
        misty.DisplayImage("e_Disgust.jpg");
        misty.MoveArmDegrees("right", 70, 50);
        misty.Pause(50);
        misty.MoveArmDegrees("left", 70, 50);
        misty.ClearDisplayText();
    } 
    //if face is recognized make a happy face, say "Hello <insert name here>", and cancel the skill overall
    else if (faceDetected) 
    {
        misty.ChangeLED(148, 0, 211);
        misty.PlayAudio("s_Joy.wav");
        misty.DisplayImage("e_Joy2.jpg");
        misty.MoveArmDegrees("right", -80, 50);
        misty.Pause(50);
        misty.MoveArmDegrees("left", -80, 50);
        misty.Pause(3000);
        misty.Speak("Hello " + faceDetected);
        misty.DisplayText(faceDetected);
        //Since person is recognized we end the skill
        misty.CancelSkill("1cde7616-1f78-49e2-9cb1-de7827e98dee");
    }
}

