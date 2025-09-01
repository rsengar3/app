import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Amplify} from 'aws-amplify';
import { PubSub } from '@aws-amplify/pubsub';
import { fetchAuthSession } from 'aws-amplify/auth';
//import {AwSIoTProvider} from 'aws-amplify/auth';
import outputs from './amplify_outputs.json'; // Import the generated configuration
import { AWSIoTProvider } from '@aws-amplify/pubsub';
import { useEffect } from 'react';



Amplify.configure(outputs);

console.log('identityPoolId candidates:',
  outputs?.auth?.identity_pool_id)
  //outputs?.auth?.identityPoolId)
  //outputs?.identityPoolId,
  //outputs?.auth?.aws_cognito_identity_pool_id?.length);
// pubsub //
/*
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: outputs.auth.user_pool_id,
      userPoolClientId: outputs.auth.user_pool_client_id,
      identityPoolId: outputs.auth.identity_pool_id,
      region: outputs.auth.aws_region,
    },
  },
});
*/
export default function App() {
  
// Apply plugin with configuration
// ... inside your component
/*
useEffect(() => {
  // Add a single PubSub plugin configuration at the start
  Amplify.addPluggable(
    new AWSIoTProvider({
      aws_pubsub_region: outputs.auth.aws_region,
      aws_pubsub_endpoint: 'wss://acucg63h9dm0g-ats.iot.ap-south-1.amazonaws.com/mqtt',
      clientId: client_id + "_app"
    })
  );
}, []);
*/

const pubsub = new PubSub ({
  endpoint: 'wss://acucg63h9dm0g-ats.iot.ap-south-1.amazonaws.com/mqtt',
  region : 'ap-south-1',
  clientId: 'amplifycheck'
})

const fetch_id = async () => {
  console.log("Calling fetchAuthSession...");
  try {
    const info = await fetchAuthSession();
    console.log("Auth session:", info);
    console.log("Cognito Identity Id:", info.credentials);
    console.log("Accesskey is:", info.credentials.accessKeyId);
    // message publish 
    const identityId = info.identityId;
    return identityId;
  } catch (err) {
    console.error("fetchAuthSession error:", err);
  }
};
const client_id = "amplifycheck";

const attach_policy = async() => {
  try{
  const iden_id = await fetch_id();
  console.log("Fetched ID is:", iden_id);
  const response = await fetch("https://ury60it7ad.execute-api.ap-south-1.amazonaws.com/production/Policy_creator", {
    method:"POST",
    headers:{
    'Content-Type':"application/json"  
    },
    body:JSON.stringify({
      "policy_Name":client_id,
      "cognitoIdentityId":iden_id
    })
  });
  const out = await response.json();
  console.log("Response from JSON is:", out);
}catch(error){
  console.log("Error in fetching id and policy publication:", error);
}
}

let subscription;
/*
useEffect(()=> {
  async function subscribe() {
  subscription = pubsub.subscribe('amplifycheck/request').subscribe({
    next: (data) => {
      console.log('Received message:', data);
    },
    error: (err) => {
      console.error('Subscription error:', err);
    },
    close: () => {
      console.log('Subscription closed. Reconnecting...');
      setTimeout(() => {
        subscribe(); // reconnect after a short delay
      }, 1000);
    },
  });
}
subscribe();
},[]);
*/


const publish_msg = async () => {
  try {

      pubsub.subscribe({ topics: 'amplifycheck/request' }).subscribe({
      next: (data) => console.log('Message received', data),
      error: (error) => console.error(error),
      complete: () => {
      console.log('Socket closed, reconnecting...');
      setTimeout(() => publish_msg(), 1000);
    },
      });
   //const subsout = pubsub.subscribe({topics:'amplifycheck/request'}).subscribe({});
   // console.log("Subscribed to", subsout);
   // console.log("Publishing Starting:");
    pubsub
    .publish({
        topics:'amplifycheck/status', 
        message: {msg:`hello there I am rohit how are you?`}
      })
      .catch((err)=> console.error(err));
    /*
    // No need to instantiate a new PubSub object every time
    
    const pubinfo = await PubSub.publish({ 
      topics: client_id + '/request',
      message: { msg: 'Hello to all subscribers!' },
      // No need for the options.provider line if configured correctly
    });
    console.log("Publishing done", pubinfo);
    */
  } catch (error) {
    console.error("Error during publishing:", error);
  }
};


//pubsub.subscribe({ topics: client_id + '/status' }).subscribe({
//  next: (data) => console.log('Message received', data),
//  error: (error) => console.error(error),
//  complete: () => console.log('Done')
//});



  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <TouchableOpacity style={{width:"50%", height:"10%", backgroundColor:"blue", borderRadius:10}} onPress={attach_policy}/>
      <TouchableOpacity style={{width:"50%", height:"10%", backgroundColor:"green", borderRadius:10}} onPress={publish_msg}/>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
