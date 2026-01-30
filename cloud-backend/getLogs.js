const AWS = require('aws-sdk');
const { verifyToken } = require('./verifyToken');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization"
  };

  try {
    const user = verifyToken(event);
    
    if (!['admin', 'staff'].includes(user.role)) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ message: 'Access denied' })
      };
    }

    const result = await dynamo.scan({ TableName: 'Logs' }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.Items)
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: err.message })
    };
  }
};
