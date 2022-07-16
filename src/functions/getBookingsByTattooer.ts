import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';

const docClient = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const tattooerID = event.queryStringParameters?.tattooerID || '';
    const status = event.queryStringParameters?.status || '';

    const params = {
      TableName: 'Bookings',
      IndexName: 'tattooerIndex',
      KeyConditionExpression: '#tattooerID = :revieved_tattooerID AND #status = :status',
      ExpressionAttributeValues: {
        ':revieved_tattooerID': tattooerID,
        ':status': status,
      },
      ExpressionAttributeNames: {
        '#tattooerID': 'tattooerID',
        '#status': 'status',
      },
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
