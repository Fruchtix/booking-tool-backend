import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';
import dayjs from 'dayjs';

const docClient = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const studioId = event.queryStringParameters?.studioID || '';
    const rangeStartDate = event.queryStringParameters?.rangeStartDate || '';
    const rangeEndDate = event.queryStringParameters?.rangeEndDate || '';

    // TODO later: - return only timeslots in certain range
    //             - check if dayjs(start of timeslot in db) is between dayjs(rangeStartDate) and dayjs(rangeEndDate)
    //             - filterExpression: '',

    const params = {
      TableName: 'Timeslots',
      KeyConditionExpression: '#studioID = :revieved_studioID',
      ExpressionAttributeValues: { ':revieved_studioID': studioId },
      ExpressionAttributeNames: {
        '#studioID': 'studioID',
      },
    };

    let timeslotItems: any = [];

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
      body: 'An error occured' + String(err),
    };
  }
};
