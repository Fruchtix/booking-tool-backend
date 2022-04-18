import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';
import Timeslot from '../types/Timeslot';

const docClient = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const parsedBody = JSON.parse(event.body || '');

    const timeslot = parsedBody.timeslot as Timeslot;

    const params = {
      TableName: 'Timeslots',
      Item: timeslot,
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

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: `Added timeslot`,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: 'An error occured',
    };
  }
};
