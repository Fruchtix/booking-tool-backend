import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';

const docClient = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const studioUrl = event.queryStringParameters?.studioUrl || '';

    const params = {
      TableName: 'TattooStudio',
      IndexName: 'studioUrlIndex',
      KeyConditionExpression: '#studioUrl = :revieved_studioUrl',
      ExpressionAttributeNames: {
        '#studioUrl': 'studioUrl',
      },
      ExpressionAttributeValues: { ':revieved_studioUrl': studioUrl },
    };

    const { Items } = await docClient.query(params).promise();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(Items),
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
