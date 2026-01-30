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

    if (user.role !== 'admin' && user.role !== 'staff') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ message: 'Forbidden - Access denied' })
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Missing request body' })
      };
    }

    const { name } = JSON.parse(event.body);

    if (!name || typeof name !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Invalid supplier name' })
      };
    }

    const supplier = {
      id: uuidv4(),
      name,
      createdBy: user.username,         // ✅ Who added
      createdAt: new Date().toISOString() // 🕒 Timestamp
    };

    await dynamo.put({
      TableName: 'Suppliers',
      Item: supplier
    }).promise();

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: 'Supplier added successfully',
        supplier
      })
    };

  } catch (err) {
    console.error("Add Supplier Error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: err.message || 'Internal Server Error' })
    };
  }
};
