import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';
import Studio from '../types/Studio';

const docClient = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const parsedBody = JSON.parse(event.body || '');

    const { studioID, studioUrl } = parsedBody as Studio;

    const params = {
      TableName: 'TattooStudios',
      Item: {
        studioID: studioID,
        studioUrl: studioUrl,
      },
    };

    await docClient.put(params).promise();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: `added studio`,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: 'An error occured' + String(err),
    };
  }
};
