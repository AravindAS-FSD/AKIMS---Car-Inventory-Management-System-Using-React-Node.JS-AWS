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
        body: JSON.stringify({ message: 'Only admin can delete users' })
      };
    }

    const { id } = event.pathParameters;
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Missing user ID' })
      };
    }

    await dynamo.delete({
      TableName: 'Users',
      Key: { id }
    }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'User deleted successfully' })
    };
  } catch (err) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ message: err.message })
    };
  }
};
