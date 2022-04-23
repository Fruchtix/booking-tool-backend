import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';
import Timeslot from '../types/Timeslot';
import dayjs from 'dayjs';
import de from 'dayjs/locale/de';
import weekday from 'dayjs/plugin/weekday';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.locale({
  ...de,
  weekStart: 1,
});

dayjs.extend(customParseFormat);
dayjs.extend(weekday);

const docClient = new AWS.DynamoDB.DocumentClient();

async function batchWrite(itemArray: any[], tableName: string) {
  let err, resp;
  let mainIndex = 0;
  let subIndex = 0;
  let arrayOf25: any[] = [];
  let arrayLength = itemArray.length;

  await asyncForEach(itemArray, async (item: any) => {
    arrayOf25.push(item);
    subIndex++;
    mainIndex++;

    //25 is as many as you can write in one time
    if (subIndex % 25 === 0 || mainIndex === arrayLength) {
      [err, resp] = await to(batchWrite25(arrayOf25, tableName));

      if (err) {
        console.log('batchWrite - error with batchWrite25 tableName ' + tableName + ', mainIndex ' + mainIndex);
      }

      subIndex = 0; //reset
      arrayOf25 = [];
    }
  });
}

async function batchWrite25(arrayOf25: any[], tableName: string) {
  let err, resp;

  //25 is as many as you can write in one time
  const itemsArray = [];
  for (let i = 0; i < arrayOf25.length; i++) {
    itemsArray.push({
      DeleteRequest: {
        Key: arrayOf25[i],
      },
    });
  }

  const params = {
    RequestItems: {
      [tableName]: itemsArray,
    },
  };

  [err, resp] = await to(docClient['batchWrite'](params).promise());

  if (err) {
    console.log('batchWrite25 - error with tableName ' + tableName);
    console.log(err);
  }
}

async function asyncForEach(array: any[], callback: Function) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function to(promise: Promise<any>) {
  return promise
    .then((data: any) => {
      //console.log('data is '+JSON.stringify(data));
      return [null, data];
    })
    .catch((err: any) => [err]);
}

const getItemsToDelete = async (timeslot: Timeslot) => {
  const params = {
    TableName: 'Timeslots',
    IndexName: 'seriesIndex',
    KeyConditionExpression: '#seriesID = :revieved_seriesID',
    ExpressionAttributeNames: {
      '#seriesID': 'seriesID',
    },
    ExpressionAttributeValues: { ':revieved_seriesID': timeslot.seriesID },
  };

  let itemsToDelete: any = [];
  const formattedItemsToDelete: any = [];

  await docClient
    .query(params, (err, data) => {
      if (err) {
        console.error('Error JSON:', JSON.stringify(err, null, 2));
      } else {
        itemsToDelete = data.Items;
      }
    })
    .promise();

  itemsToDelete.forEach((timeslot: Timeslot) => {
    formattedItemsToDelete.push({ timeslotID: timeslot.timeslotID, studioID: timeslot.studioID });
  });

  return formattedItemsToDelete;
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const parsedBody = JSON.parse(event.body || '');

    const timeslot = parsedBody.timeslot as Timeslot;

    if (!timeslot.seriesID) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: 'Timeslot has no seriesID',
      };
    }

    const itemsToDelete = await getItemsToDelete(timeslot);

    await batchWrite(itemsToDelete, 'Timeslots');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: `Deleted timeslots series`,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: 'An error occured ' + String(err),
    };
  }
};
