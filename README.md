# Senior Capstone
## University at Albany 
####	Made by:
####		* Michael Sollazzo
####		* Kyle Welch
####		* Gabriel Mesidor

## Project :robot:
#### Program Personal Assistant Robot to help Developmentally Disabled Individuals

## Use Cases 

1. Questionnaire
    - Misty starts Questionnaire with the resident 
2. Facial Detection 
    - Misty looks around for familiar faces 
3. Sleep Prevention 
    - Misty prevents staff members from sleeping 

### Sponsor
 Steve Harding, Living Resources

## Skills recommended for this project
 - Vanilla JavaScript (good understanding of JavaScript will help ALOT!)
 - mongoose.js
 - express.js
 - node.js
 - Bootstrap
 - Knowledge of MongoDB (No-SQL)
 - Knowledge of Google's DialogFlow API
 - Misty SDK [Misty Documentation](https://docs.mistyrobotics.com/)

Note: Misty can be developed with .NET SDK which requires C# knowledge

# Instructions 

### To run project locally:

1. Clone this project to your computer
2. Open the repo with VScode
3. In the root of the Database folder install all dependencies with npm install
3. Go to `index.html` file inside the staffdashRestAPI folder and open it on a local server
4. To run it on local server use VScode's Go Live extenstion or any other live-server plugins

NOW, you have to configure some settings with MongoDB Atlas and Dialogflow

### MongoDB Atlas Instructions

1. Create a MongoDB atlas account [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a project
3. Build a cluster
4. Connect to cluster 
    - Whitelist a connection IP address 
    - Create a MongoDB User
    - Copy the connection string which should look something like this: 
       mongodb+srv://test:<password>@cluster0-hcuzi.mongodb.net/test?retryWrites=true&w=majority
5. Copy and paste string into `config.js`
6. You can now run the server/database by running command `node app.js` in the root of Database folder

### DialogFlow Instructions

[DialogFlow](https://dialogflow.com/) is Google's Machine Learning API that makes it easier to create a user-product conversation. The API will detect the input, and will use their Machine Learning to associate the input with an intent, and match the input to the intent's training phrase, which will output a fulfillment message. We will go over how to set up DialogFlow with Misty, convert the audio input to text, find the appropriate intent, and send the audio response back to Misty.  

Note: A good thing to read would be the [DialogFlow documentation](https://cloud.google.com/dialogflow/docs/), it's a really good read to help you fully understand DialogFlow as it can be quite confusing.

1. Go to DialogFlow and login/sign up. 
2. Go to the console, and click on *Create Agent*, and name it whatever you want to. Choose *Create a new Google project*.
3. Click *Intents*, and click on *Create Intent*. Name the intent whatever you want.
4. Fill in the Training Phrase with whatever you want to use to start the intent. Then, you can fill in the responses with what you want to use to respond to the training phrases. Click *Save*, and wait for the gear on the left subbar to finish turning. Then, you can test it out in the console on the right.
5. If you want your intent to branch into another intent appropriately, create a Context Variable in the *Context* section in your DialogFlow intent. Make the starting intent are the *input* and *output*, and to the next intent use the same variable name as the input. 

Thanks to Misty Robotics, they already had a way to easily connect to DialogFlow with their [Misty Conceirge Template](https://github.com/MistySampleSkills/Misty-Concierge-Template). However, the *testingAudio.js*, *autismQuestionaire.js*, and *sleepDetect.js* were modified to our needs while we used the connection that was made in the conceirge template.

DialogFlow doesn't do direct matching input, since it's all Machine Learning it will feed the intent into the engine and will match to anything relatively close to the training phrase it's associated with. 

We will now go over how to grab the credentials from Google Cloud Services, and putting them into files to create a connection and let Misty listen and talk with DialogFlow. 

1. In your DialogFlow agent, click on the gear wheel on the left next to your agent's name. 
2. Click on the link that is in *Service Account*.
3. Click on the triple dots under *Action* on the account that has the label, *Dialogflow Integration*, and choose *Create key*. Choose json, and go to the .json file it generated. Keep this safe, you will need it and you can't get another one. 
4. Create a *credentials* function, and use *misty.Set()* to give your credentials a name and a way for Misty to get them. Put in your *auth_uri* and your *project_id*. 

You are now all set and are connected to DialogFlow! You are now also able to use the TTS API to generate the audio file into text to work with DialogFlow. 


### How to use the Misty Interface

The Misty Interface was designed for staff members at Living Resources to use along side Misty and residents. 
Staff members can: 

- Add a resident to the MongoDB Database 
- Get a residents information and display it on screen
- Connect to Misty 
- Demonstate Use Cases

### How to use: 

### If working with new resident:
 1. Connect to Misty with her IP Address
 2. Add resident information with the add resident form 
 3. Ask resident to look at misty
 4. Enter residents name into get resident field 
 5. Allow 20-25 seconds for misty to train residents face
 5. Misty now knows the resdient by face and the resident info will be posted on screen

### If working with existing resident: 
 1. Connect to Misty with her IP Address  
 2. Ask resident to look at misty
 3. Enter residents name into get resident field 
 4. Resident information will display on screen 
 








