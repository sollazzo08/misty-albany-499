// Kicks everything off!
getAccessToken();

function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function initiateTokenRefresh() 
{
    
    misty.Debug("Refreshing token...");
    misty.Pause(2000);
    misty.Set("googleAuthToken", "not updated yet", false);
    _getAuthToken();
    misty.RegisterTimerEvent("getAuthToken", 60000 * 15, true);
}
initiateTokenRefresh();

function _getAuthToken() 
{
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
    misty.Set("langCodeForTTS", "en-US", false);
    misty.Set("genderCodeForTTS", "FEMALE", false);
}
creds();

// Creates a unique session ID for opening a session with our Dialogflow
// agent.
function getSessionId(){
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Gets an access token for use with DialogFlow API
function getAccessToken() {
    misty.SendExternalRequest("POST",  _params.getAccessTokenUrl, null, null, null, false, false, null, "application/json", "SetAccessToken");
}

function SetAccessToken(data) {
    let response = JSON.parse(data.Result.ResponseObject.Data)
    misty.Set("googleAccessToken", response.accessToken);

    startToListen();
}

function startToListen() {
    misty.StartKeyPhraseRecognition(true);

    misty.RegisterEvent("VoiceRecord", "VoiceRecord", 1000, false);
    misty.Debug("Misty is listening, say 'Hey, Misty' to start!");
    misty.PlayAudio("s_Joy3.wav");

    animateDefault();
}

function _VoiceRecord(){
    misty.Debug("Speech captured.");
    misty.GetAudioFile("capture_HeyMisty.wav", "ProcessAudioFile");
    ProcessAudioFile("capture_HeyMisty.wav");
}

/**function keepListening() {
    misty.CaptureSpeech(false, true)

    misty.AddReturnProperty("SpeechCaptured", "Filename");
    misty.AddReturnProperty("SpeechCaptured", "Success");
    misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);

    animateDefault();
}**/

function _SpeechCaptured(data){
    misty.Debug("Your speech has been captured!");
    misty.Pause(5000);
    let filename = data.AdditionalResults[0];
    let success = data.AdditionalResults[1];
    misty.Debug("The file " + filename + "was a " + success);
    misty.Pause(5000);
    if(success == true){
        misty.PlayAudio(filename);
    }
    misty.Debug("Time to process " + filename);
    misty.Pause(3000);
    misty.GetAudioFile(filename, "ProcessAudioFile");
    ProcessAudioFile(filename);
}

function ProcessAudioFile(data){
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

function ProcessDialogFlowResponse(data){
    // Gets the intent and parameters from the response
    let response = JSON.parse(data.Result.ResponseObject.Data)
    let intent = response.queryResult.intent.displayName;
    let parameters = response.queryResult.parameters;

    // Prints some debug messages with contents of the response
    misty.Debug("Intent: " + intent);
    misty.Pause(2000);
    misty.Debug("Input text: " + response.queryResult.queryText);

    /**if(intent == 'Questionaire'){
        misty.Debug("Ready to start the questionaire.");
        misty.Pause(2000);
        misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
        speakTheText();
        misty.Pause(2000);
        keepListening();
    }

    else if(intent == 'Questionaire - good'){
        misty.Debug("Good! Let's see how well you have been sleeping today.");
        misty.Pause(2000);
        misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
        speakTheText();
        misty.Pause(2000);
        keepListening();
    }

    else if(intent == 'Questionaire - bad'){
        misty.Debug("That is too bad! Let's see if we can get a professional to help you.");
        misty.Pause(2000);
        misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
        speakTheText();
        misty.Pause(2000);
        keepListening();
    }

    else if (intent == 'Questionaire - good - good'){
        misty.Debug("All Done, thank you!");
        misty.Pause(2000);
        misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
        speakTheText();
        misty.Pause(2000);
        stopSkill();
    }**/

    switch(intent){
        case 'Questionaire':
            misty.Debug("Ready to start the questionaire.");
            misty.Pause(2000);
            misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
            speakTheText();
            misty.Pause(2000);
            animateInterest();
            misty.Pause(1000);
            keepListening();
            break;
        case 'Questionaire - good':
            misty.Debug("Good! Let's see how well you have been sleeping today.");
            misty.Pause(2000);
            misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
            speakTheText();
            misty.Pause(2000);
            keepListening();
            break;
        case 'Questionaire - bad':
            misty.Debug("That is too bad! Let's see if we can get a professional to help you.");
            misty.Pause(2000);
            misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
            speakTheText();
            misty.Pause(2000);
            keepListening();
        case 'Questionaire - good - good':
            misty.Debug("Good! Let's see how well you have been sleeping today.");
            misty.Pause(2000);
            misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
            speakTheText();
            misty.Pause(2000);
            stopSkill();
            break;
        case 'ChangeLED':
            let color = parameters.color;
            misty.Debug("Color: " + color);
            misty.Pause(2000);
            if(color == "Random"){
                misty.ChangeLED(getRandomInt(0, 255), getRandomInt(0, 255), getRandomInt(0, 255));
                misty.Pause(1000);
                misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
                speakTheText();
                misty.Pause(7000);
                misty.Speak("Go");
                misty.CaptureSpeech(false, true)
                misty.AddReturnProperty("SpeechCaptured", "Filename");
                misty.AddReturnProperty("SpeechCaptured", "Success");
                misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
            }
            else if(color == "Red"){
                misty.ChangeLED(255, 0, 0);
                misty.Pause(1000);
                misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
                speakTheText();
                misty.Pause(7000);
                misty.Speak("Go");
                misty.CaptureSpeech(false, true)
                misty.AddReturnProperty("SpeechCaptured", "Filename");
                misty.AddReturnProperty("SpeechCaptured", "Success");
                misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
                
            }
            else if(color == "Blue"){
                misty.ChangeLED(0, 0, 255);
                misty.Pause(1000);
                misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
                speakTheText();
                misty.Pause(7000);
                misty.Speak("Go");
                misty.CaptureSpeech(false, true)
                misty.AddReturnProperty("SpeechCaptured", "Filename");
                misty.AddReturnProperty("SpeechCaptured", "Success");
                misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
            }
            else if(color == "Green"){
                misty.ChangeLED(0, 255, 0);
                misty.Pause(1000);
                misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
                speakTheText();
                misty.Pause(7000);
                misty.Speak("Go");
                misty.CaptureSpeech(false, true)
                misty.AddReturnProperty("SpeechCaptured", "Filename");
                misty.AddReturnProperty("SpeechCaptured", "Success");
                misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
            }
            /**misty.CaptureSpeech(false, true)
            misty.AddReturnProperty("SpeechCaptured", "Filename");
            misty.AddReturnProperty("SpeechCaptured", "Success");
            misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);**/
            misty.Speak("Go");
            misty.CaptureSpeech(false, true)
            misty.AddReturnProperty("SpeechCaptured", "Filename");
            misty.AddReturnProperty("SpeechCaptured", "Success");
            misty.RegisterEvent("SpeechCaptured", "VoiceRecord", 1000, true);
            break;
        case 'ChangeLED - yes':
            animateCompliance();
            misty.Pause(2000);
            misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
            speakTheText();
            misty.Pause(5000);
            stopSkill();
            break;
        case 'Flashlight':
            misty.SetFlashlight(true);
            misty.Debug('Turning on flashlight');
            misty.Pause(2000);
            misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
            speakTheText();
            misty.Pause(3000);
            keepListening();
        default:
            misty.Set("textToSpeak", response.queryResult.fulfillmentText, false);
            speakTheText();
            misty.Pause(5000);
            keepListening();
            break;    
    }
}

function animateCompliance() {
    misty.MoveHeadDegrees(-15, 0, 0, 100);
    misty.PlayAudio("s_Acceptance.wav");
    misty.DisplayImage("e_Joy2.jpg");
    misty.MoveArms(0, -25, 100, 100);
}

function animateInterest() {
    misty.MoveHeadDegrees(30, -20, 80);
    misty.DisplayImage('e_SystemGearPrompt.jpg');
    misty.MoveArms(-25, 25, 100, 100);
}

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

function _Base64In(data) {
    misty.Debug("Audio(base64) in from Google TTS API");
    misty.Debug(JSON.stringify(data));

    misty.Set("playingAudio", true, false);

     // Saves and plays the Base64-encoded audio data 
     misty.SaveAudio("tts.wav", JSON.parse(data.Result.ResponseObject.Data).audioContent, true, true);

}

function stopSkill(){
    misty.Speak("Ending Skill. Goodbye.");
    misty.Debug("Skill is ending...");
    misty.Pause(3000);
    misty.CancelSkill('questionaire');
}


