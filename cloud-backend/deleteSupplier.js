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
    if (user.role !== 'admin' && user.role !== 'staff') {
      return { statusCode: 403, headers, body: JSON.stringify({ message: 'Forbidden' }) };
    }

    const { id } = event.pathParameters;

    await dynamo.delete({
      TableName: 'Suppliers',
      Key: { id }
    }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Supplier deleted successfully' })
    };
  } catch (err) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ message: err.message })
    };
  }
};
