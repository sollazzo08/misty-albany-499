misty.SetDefaultVolume(30);

// Kicks everything off!
getAccessToken();

function initiateTokenRefresh() 
{
    misty.Set("googleAuthToken", "not updated yet", false);
    _getAuthToken();
    misty.RegisterTimerEvent("getAuthToken", 60000 * 15, true);
}
initiateTokenRefresh();

function _getAuthToken() {
    misty.SendExternalRequest("POST", misty.Get("cloudFunctionAuthTokenURL"), null, null, null, false, false, null, "application/json", "_UpdateAuthToken");
}

function _UpdateAuthToken(data) {
    misty.Set("googleAuthToken", JSON.parse(data.Result.ResponseObject.Data).authToken, false);
    misty.Debug("Updated Auth Token");
}

function creds(){
    misty.Set("cloudFunctionAuthTokenURL", "https://us-central1-mistyvoicecommand-otapmj.cloudfunctions.net/get-access-token", false);
    misty.Set("GoogleCloudProjectID", "mistyvoicecommand-otapmj", false);
    misty.Set("langCodeForTTS", "en-AU", false);
    misty.Set("genderForTTS", "MALE", false);
}
creds();

// Creates a unique session ID for opening a session with our Dialogflow
// agent.
function getSessionId(){
    let subOne = Math.random().toString(36).substring(2, 15);
    let subTwo = Math.random().toString(36).substring(2, 15);
    return subOne + subTwo;
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
}

function SetAccessToken(data) {

    let response = JSON.parse(data.Result.ResponseObject.Data)
    misty.Set("googleAccessToken", response.accessToken);
    
    startListeningToUser();
}

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

    misty.Debug("Intent: " + intent);
    misty.Debug("Input text: " + response.queryResult.queryText);

    switch(intent){
        case "ChangeLED":
            let color = parameters.color;
            misty.Debug("Color: " + color);
            switch(color){
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
                    misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
                    speakTheText();
                    return;
            }
    }

    misty.Pause(5000);
}

function speakTheText() {
    var arguments = JSON.stringify({
        'input': {
            'text': misty.Get("textToSpeak")
        },
        'voice': {
            'languageCode': misty.Get("langCodeForTTS"),
            'ssmlGender': misty.Get("genderForTTS")
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

function _Base64In(data) {
    misty.Debug("Audio(base64) in from Google TTS API");
    misty.Debug(JSON.stringify(data));

    misty.Set("playingAudio", true, false);

     // Saves and plays the Base64-encoded audio data 
     misty.SaveAudio("tts.wav", JSON.parse(data.Result.ResponseObject.Data).audioContent, true, true);

}