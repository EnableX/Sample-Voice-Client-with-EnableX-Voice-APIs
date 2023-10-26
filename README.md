# EnableX Programmable Voice APIs Sample Client: Outbound and Inbound Voice Calls Demo

EnableX Programmable Voice API Sample: Client Application and Walkthrough 

Explore this repository containing a sample application showcasing the capabilities of EnableX Programmable Voice APIs. This application provides demonstrations of various Programmable Voice API features, including: 
Outbound play prompt 
Outbound play voice menu 
Outbound play text 
Outbound call bridging 
Inbound call voice menu 
Inbound bridging 

Prerequisites: 
Obtain EnableX Application credentials. 
Acquire an EnableX phone number. 
Have a hosting environment, either in the cloud or on a local machine. 

## Installation
```
git clone https://github.com/EnableX/Sample-Voice-Client-with-EnableX-Voice-APIs.git --recursive
cd Sample-Voice-Client-with-EnableX-Voice-APIs
npm install
```

## Setting up the Application
1. Create a Enablex voice application using the Enablex portal.
1. Select Inbound or Outbound voice application you want to create.
1. Fill the details, event url properly so that your application server is notified of the call events.
1. For event url, the outbound application by default uses ngrok
1. For inbound, the event url of the voice service needs to be updated with the publicly reachable event url during the service creation. 
1. Purchase a number from Enablex portal (inbound or outbound) associate with inbound or outbound voice application created accordingly.
1. Now enter the app_id, app_key and other configurations in the configuration file, config.js.

## Starting the application
node "sample_name.js"

Replace `sample_name` with name respective scripts like `outgoing_bridging` etc.
