const AWS = require('aws-sdk');
const { verifyToken } = require('./verifyToken');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,OPTIONS"
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  try {
    const user = verifyToken(event);

    const result = await dynamo.scan({
      TableName: 'Products'
    }).promise();

    // Optional: sort products by createdAt descending
    const sortedItems = result.Items.sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(sortedItems)
    };

  } catch (err) {
    console.error('Get Products Error:', err);
    return {
      statusCode: err.message?.includes('Unauthorized') ? 401 : 500,
      headers,
      body: JSON.stringify({ message: err.message || 'Internal Server Error' })
    };
  }
};
