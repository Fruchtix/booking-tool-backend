import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';
import Timeslot from '../types/Timeslot';
import dayjs from 'dayjs';
import de from 'dayjs/locale/de';
import weekday from 'dayjs/plugin/weekday';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { v4 as uuidv4 } from 'uuid';

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
      PutRequest: {
        Item: arrayOf25[i],
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

const generateTimeslotSeries = (timeslot: Timeslot) => {
  const repeatingEnd = dayjs(timeslot.repeatingEnd);
  let repeatingEndReached = false;
  let start = dayjs(timeslot.repeatingStartDate);
  let end = dayjs(timeslot.end);
  let currentWeekDay = 0;
  const startPlusTwoMonth = start.add(2, 'month');

  const timeslotSeriesItems: Timeslot[] = [];
  const timeslotsToReturn: Timeslot[] = [];

  while (!repeatingEndReached) {
    timeslot.repeatingDays!.forEach(daysFromCurrentDay => {
      if (daysFromCurrentDay < currentWeekDay) return;

      const newTimeslotStart = start.add(daysFromCurrentDay, 'day');
      const newTimeslotEnd = end.add(daysFromCurrentDay, 'day');

      if (repeatingEnd.isBefore(newTimeslotStart)) {
        repeatingEndReached = true;
        return;
      }

      const newTimeslot: Timeslot = {
        ...timeslot,
        timeslotID: uuidv4(),
        start: newTimeslotStart.format(),
        end: newTimeslotEnd.format(),
        ttl: newTimeslotEnd.unix(),
      };

      timeslotSeriesItems.push(newTimeslot);

      // only return items within the next two month
      if (newTimeslotStart.isBefore(startPlusTwoMonth)) {
        timeslotsToReturn.push(newTimeslot);
      }
    });

    start = start.add(7, 'day');
    currentWeekDay = -10;
  }

  return [timeslotSeriesItems, timeslotsToReturn];
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const parsedBody = JSON.parse(event.body || '');
    const timeslot = parsedBody.timeslot as Timeslot;
    const updateSeries = parsedBody.updateSeries;

    if (timeslot.repeats && updateSeries) {
      const [timeslotSeriesItems, timeslotsToReturn] = generateTimeslotSeries(timeslot);

      await batchWrite(timeslotSeriesItems, 'Timeslots');

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(timeslotsToReturn),
      };
    }

    const ttl = dayjs(timeslot.end).unix();

    const params = {
      TableName: 'Timeslots',
      Item: { ...timeslot, ttl: ttl },
    };

    await docClient.put(params).promise();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify([timeslot]),
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
