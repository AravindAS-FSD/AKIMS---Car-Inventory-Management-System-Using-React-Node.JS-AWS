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
    if (user.role !== 'admin') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ message: 'Only admin can view users' })
      };
    }

    const result = await dynamo.scan({ TableName: 'Users' }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.Items)
    };

  } catch (err) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ message: err.message })
    };
  }
};
