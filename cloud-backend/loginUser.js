const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const dynamo = new AWS.DynamoDB.DocumentClient();

const JWT_SECRET = "your-very-secure-secret";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization"
  };

  try {
    const { username, password } = JSON.parse(event.body);

    const userData = await dynamo.scan({
      TableName: 'Users',
      FilterExpression: 'username = :u',
      ExpressionAttributeValues: { ':u': username }
    }).promise();

    if (!userData.Items.length) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'User not found' })
      };
    }

    const user = userData.Items[0];

    if (user.password !== password) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid password' })
      };
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Login successful',
        user: { username: user.username, role: user.role },
        token
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: err.message || 'Internal error' })
    };
  }
};
