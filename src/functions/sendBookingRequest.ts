import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';
import Booking from '../types/Booking';
import { v4 as uuidv4 } from 'uuid';

const docClient = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const parsedBody = JSON.parse(event.body || '');

    const {
      studioID,
      userName,
      tattooerID,
      userSurname,
      email,
      age,
      tattooDescription,
      tattooPosition,
      tattooSize,
      alreadyCustomer,
      instaName,
    } = parsedBody as Booking;

    const params = {
      TableName: 'Bookings',
      Item: {
        bookingID: uuidv4(),
        status: 'open',
        studioID,
        tattooerID,
        userName,
        userSurname,
        email,
        age,
        tattooDescription,
        tattooPosition,
        tattooSize,
        alreadyCustomer,
        instaName,
      },
    };

    await docClient.put(params).promise();

    // TODO: send confirm mail

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: `added request`,
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
