const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const dynamo = new AWS.DynamoDB.DocumentClient();
const JWT_SECRET = "your-very-secure-secret";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization"
  };

  try {
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Missing or malformed token' })
      };
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'admin') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ message: 'Only admin can create users' })
      };
    }

    const { username, password, role } = JSON.parse(event.body);

    const existing = await dynamo.scan({
      TableName: 'Users',
      FilterExpression: 'username = :u',
      ExpressionAttributeValues: { ':u': username }
    }).promise();

    if (existing.Items.length > 0) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ message: 'Username already exists' })
      };
    }

    const newUser = {
      id: uuidv4(),
      username,
      password,
      role: role || 'staff'
    };

    await dynamo.put({ TableName: 'Users', Item: newUser }).promise();

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: 'User created successfully',
        user: newUser
      })
    };

  } catch (err) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: err.message })
    };
  }
};
