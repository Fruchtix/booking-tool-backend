import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';

const docClient = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const studioID = event.queryStringParameters?.studioID || '';
    const status = event.queryStringParameters?.status || '';

    const params = {
      TableName: 'Bookings',
      IndexName: 'studioIndex',
      KeyConditionExpression: '#studioID = :revieved_studioID AND #status = :status',
      ExpressionAttributeValues: {
        ':revieved_studioID': studioID,
        ':status': status,
      },
      ExpressionAttributeNames: {
        '#studioID': 'studioID',
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
