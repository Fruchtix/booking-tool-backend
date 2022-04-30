import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';
import Studio from '../types/Studio';

const docClient = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const studioUrl = event.queryStringParameters?.studioUrl || '';

    const params = {
      TableName: 'TattooStudios',
      Key: {
        studioUrl: studioUrl,
      },
    };

    const { Item } = await docClient.get(params).promise();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(Item),
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
