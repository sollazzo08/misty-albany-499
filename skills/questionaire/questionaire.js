misty.SetDefaultVolume(30);

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

function creds(){
    misty.Set("cloudFunctionAuthTokenURL", "https://us-central1-mistyvoicecommand-otapmj.cloudfunctions.net/get-access-token", false);
    misty.Set("GoogleCloudProjectID", "mistyvoicecommand-otapmj", false);
    misty.Set("langCodeForTTS", "en-AU", false);
}
creds();


// Creates a unique session ID for opening a session with our Dialogflow
// agent.
function getSessionId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Gets an access token for use with DialogFlow API
function getAccessToken() {
    misty.SendExternalRequest("POST",  _params.getAccessTokenUrl, null, null, null, false, false, null, "application/json", "SetAccessToken");
}

function startListeningToUser() {
    misty.StartKeyPhraseRecognition(true);

    misty.RegisterEvent("VoiceRecord", "VoiceRecord", 10, false);
    misty.Debug("Misty is listening, say 'Hey, Misty' to start!");
    misty.PlayAudio("s_Joy3.wav");

    animateDefault();
}

// Triggers when response data from getAccessToken call is ready.
// Stores token for use later with the DialogFlow API.
function SetAccessToken(data) {

    let response = JSON.parse(data.Result.ResponseObject.Data)
    misty.Set("googleAccessToken", response.accessToken);
    
    startListeningToUser();
}

// Callback for handling VoiceRecord event data. Prints a debug
// message and gets passes the captured speech file into the
// ProcessAudioFile() callback function. 
function _VoiceRecord() {
    misty.Debug("Speech captured.")
    misty.GetAudioFile("capture_HeyMisty.wav", "ProcessAudioFile");
}

// Sends speech recording to DialogFlow. Dialogflow uses 
// speech-to-text to match the recording with an "intent" we define in
// the DialogFlow project, then sends a response back with intent data.
// We use this response data to change Misty's LED.
function ProcessAudioFile(data) {

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
function ProcessDialogFlowResponse(data) {
    
    // Gets the intent and parameters from the response
    let response = JSON.parse(data.Result.ResponseObject.Data)
    let intent = response.queryResult.intent.displayName;
    let parameters = response.queryResult.parameters;

    // Prints some debug messages with contents of the response
    misty.Debug("Intent: " + intent);
    misty.Debug("Input text: " + response.queryResult.queryText);

    // Handles ChangeLED intents. If the color is red, green, or blue,
    // Misty plays a happy sound and changes her color. 
    if (intent == "ChangeLED") {
        switch(parameters.color) {
            case "red":
                misty.ChangeLED(255, 0, 0);
                animateCompliance();
                break;
            case "blue":
                misty.ChangeLED(0, 0, 255);
                animateCompliance();
                break;
            case "green":
                misty.ChangeLED(0, 255, 0);
                animateCompliance();
                break;
            case "yellow":
                misty.ChangeLED(255,255,51);
                animateCompliance();
                break;
            case "orange":
                misty.ChangeLED(255,128,0);
                animateCompliance();
                break;
            case "pink":
                misty.ChangeLED(255,51,187);
                animateComplaince();
                break;
            case "white":
                misty.ChangeLED(255, 255, 255);
                animateComplaince();
                break;
            default:
                animateConfusion();
                misty.Speak("Sorrt, I didn't catch that. Say it again?");
                misty.Debug("Sorry, I didn't catch that. Say it again?");
                misty.Pause(2000);
                startListeningToUser();
                return;
        }
    }
    else if(intent == "Name"){
        misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
        speakTheText();
    }
    // If Dialogflow couldn't match the recorded utterance to an
    // intent, Misty plays a confused sound and starts listening again.
    if (intent == "Default Welcome Intent") {
        misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
        speakTheText();
    }
    
    else {
        misty.PlayAudio("s_DisorientedConfused3.wav");
        misty.Debug("Sorry, I didn't catch that. Say it again?");
        misty.Pause(2000);
        startListeningToUser();
        return;
    }

    // Waits five seconds, then starts listening again.
    misty.Pause(5000);
    animateDefault();
    startListeningToUser();
}

function animateConfusion() {
    misty.MoveHeadDegrees(-10, 30, 0, 100);
    misty.PlayAudio("s_DisorientedConfused3.wav");
    misty.DisplayImage("e_ApprehensionConcerned.jpg");
    misty.MoveArms(-25, 90, 100, 100);
}

function animateDefault() {
    misty.MoveHeadDegrees(0, 0, 0, 100);
    misty.MoveArms(90, 90, 100, 100);
}

function animateCompliance() {
    misty.MoveHeadDegrees(-15, 0, 0, 100);
    misty.PlayAudio("s_Acceptance.wav");
    misty.DisplayImage("e_Joy2.jpg");
    misty.MoveArms(0, -25, 100, 100);
}

function speakTheText() {
    var arguments = JSON.stringify({
        'input': {
            'text': misty.Get("textToSpeak")
        },
        'voice': {
            'languageCode': misty.Get("langCodeForTTS"),
            'ssmlGender': "MALE"
        },
        'audioConfig': {
            'audioEncoding': "LINEAR16",
            "effectsProfileId": [
                "handset-class-device"
            ],
            "pitch": 0,
            "speakingRate": 0.91
        }
    });

    misty.Debug("Sending Data to Google");
    misty.SendExternalRequest("POST", "https://texttospeech.googleapis.com/v1beta1/text:synthesize", "Bearer", misty.Get("googleAccessToken"), arguments, false, false, null, "application/json", "_Base64In")
    misty.Debug("Text sent to Google Text to Speech API");
}

function _Base64In(data) {
    misty.Debug("Audio(base64) in from Google TTS API");
    misty.Debug(JSON.stringify(data));

    misty.Set("playingAudio", true, false);

     // Saves and plays the Base64-encoded audio data 
     misty.SaveAudio("tts.wav", JSON.parse(data.Result.ResponseObject.Data).audioContent, true, true);

}
