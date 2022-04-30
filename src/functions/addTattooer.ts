import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';
import Tattooer from '../types/Tattooer';

const docClient = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const parsedBody = JSON.parse(event.body || '');
    const tattooer = parsedBody as Tattooer[];

    const itemsArray = [];
    for (let i = 0; i < tattooer.length; i++) {
      itemsArray.push({
        PutRequest: {
          Item: tattooer[i],
        },
      });
    }

    const params = {
      RequestItems: {
        ['Tattooer']: itemsArray,
      },
    };

    await docClient.batchWrite(params).promise();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: `added Tattooer`,
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
