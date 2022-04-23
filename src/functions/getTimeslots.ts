import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';

const docClient = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const studioId = event.queryStringParameters?.studioID || '';

    const params = {
      TableName: 'Timeslots',
      KeyConditionExpression: '#studioID = :revieved_studioID',
      ExpressionAttributeValues: { ':revieved_studioID': studioId },
      ExpressionAttributeNames: {
        '#studioID': 'studioID',
      },
    };

    let timeslotItems: any = [];

    await docClient
      .query(params, (err, data) => {
        if (err) {
          console.error('Error JSON:', JSON.stringify(err, null, 2));
        } else {
          timeslotItems = data.Items;
        }
      })
      .promise();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(timeslotItems),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: 'An error occured',
    };
  }
};
