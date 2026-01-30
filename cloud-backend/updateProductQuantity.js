const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
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
        body: JSON.stringify({ message: 'Unauthorized access' })
      };
    }

    const { id } = event.pathParameters;
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Product ID is required' })
      };
    }

    const { quantity } = JSON.parse(event.body);
    if (quantity == null || typeof quantity !== 'number' || quantity < 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Invalid quantity value' })
      };
    }

    const productData = await dynamo.get({
      TableName: 'Products',
      Key: { id }
    }).promise();

    const productName = productData.Item?.name || 'Unknown';

    await dynamo.update({
      TableName: 'Products',
      Key: { id },
      UpdateExpression: 'set quantity = :q',
      ExpressionAttributeValues: { ':q': quantity },
    }).promise();

    await dynamo.put({
      TableName: 'Logs',
      Item: {
        id: uuidv4(),
        action: 'Updated',
        product: productName,
        quantity,
        date: new Date().toISOString(),
        user: user.username,
      }
    }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Quantity updated successfully' })
    };

  } catch (err) {
    console.error('Update Quantity Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: err.message || 'Internal Server Error' })
    };
  }
};
