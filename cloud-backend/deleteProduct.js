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

    if (user.role !== 'admin') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ message: 'Only admin can delete products' })
      };
    }

    const { id } = event.pathParameters;
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Missing product ID' })
      };
    }

    const existingProduct = await dynamo.get({
      TableName: 'Products',
      Key: { id }
    }).promise();

    const productName = existingProduct.Item?.name || 'Unknown';
    const quantity = existingProduct.Item?.quantity || 0;

    await dynamo.delete({
      TableName: 'Products',
      Key: { id }
    }).promise();

    await dynamo.put({
      TableName: 'Logs',
      Item: {
        id: uuidv4(),
        action: 'Deleted',
        product: productName,
        quantity,
        date: new Date().toISOString(),
        user: user.username
      }
    }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Product deleted successfully' })
    };

  } catch (err) {
    console.error('Delete Product Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: err.message || 'Internal Server Error' })
    };
  }
};