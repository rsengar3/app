#!/bin/bash

# Run the Amplify pull command to get the latest configuration
npx amplify pull --appId d24v1jvku7637n --envName dev --yes

# Run the EAS build command
eas build --profile production --platform android