const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.logAction = async ({ action, product, quantity, user }) => {
  const logItem = {
    id: uuidv4(),
    action,
    product,
    quantity,
    user,
    date: new Date().toISOString()
  };

  try {
    await dynamo.put({
      TableName: 'Logs',
      Item: logItem
    }).promise();
  } catch (err) {
    console.error("Log Error:", err.message);
  }
};
