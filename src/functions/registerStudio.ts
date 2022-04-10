import AWS from 'aws-sdk';

const docClient = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any, context: any) => {
  try {
    const params = {
      TableName: 'TattooStudio',
      Item: {
        studioID: event.request.userAttributes.sub,
        email: event.request.userAttributes.email,
      },
    };

    await docClient
      .put(params, (err, data) => {
        if (err) {
          console.error('Unable to add item. Error JSON:', JSON.stringify(err, null, 2));
        } else {
          console.log('Added item:', JSON.stringify(data, null, 2));
        }
      })
      .promise();

    context.done(null, event);
  } catch (err) {
    console.log('An error occured');
    context.done(null, event);
  }
};
