import AWS from 'aws-sdk';

const docClient = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any, context: any) => {
  try {
    const params = {
      TableName: 'TattooStudios',
      Item: {
        studioID: event.request.userAttributes.sub,
        email: event.request.userAttributes.email,
      },
    };

    await docClient.put(params).promise();

    context.done(null, event);
  } catch (err) {
    console.log('An error occured');
    context.done(null, event);
  }
};
