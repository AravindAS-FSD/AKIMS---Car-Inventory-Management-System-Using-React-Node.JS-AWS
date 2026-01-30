const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { verifyToken } = require('./verifyToken');

const dynamo = new AWS.DynamoDB.DocumentClient();
const tableName = 'Categories';

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
        body: JSON.stringify({ message: 'Only admin can add categories' })
      };
    }

    let name, subcategories, parentId;
    try {
      const parsedBody = JSON.parse(event.body);
      name = parsedBody.name;
      subcategories = parsedBody.subcategories || [];
      parentId = parsedBody.parentId || null;

      if (!name || typeof name !== 'string') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Invalid category name' })
        };
      }
    } catch (err) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Invalid JSON', error: err.message })
      };
    }

    // Validate parent category type
    let type = 'category';
    if (parentId) {
      try {
        const parentRes = await dynamo.get({
          TableName: tableName,
          Key: { id: parentId }
        }).promise();

        if (!parentRes.Item) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'Parent category not found' })
          };
        }

        if (parentRes.Item.type === 'category') {
          type = 'subcategory';
        } else {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: 'Cannot add subcategory under another subcategory' })
          };
        }
      } catch (err) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ message: 'Error validating parentId', error: err.message })
        };
      }
    }

    const newId = uuidv4();
    const timestamp = new Date().toISOString();

    const mainItem = {
      id: newId,
      name,
      type,
      parentId,
      createdBy: user.username,
      createdAt: timestamp
    };

    const items = [mainItem];

    // Handle subcategories
    if (Array.isArray(subcategories)) {
      subcategories.forEach(sub => {
        if (sub.name && typeof sub.name === 'string') {
          items.push({
            id: uuidv4(),
            name: sub.name,
            type: 'subcategory',
            parentId: newId,
            createdBy: user.username,
            createdAt: timestamp
          });
        }
      });
    }

    // Batch write to DynamoDB
    const batchParams = {
      RequestItems: {
        [tableName]: items.map(item => ({
          PutRequest: { Item: item }
        }))
      }
    };

    await dynamo.batchWrite(batchParams).promise();

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ message: 'Category and subcategories added successfully', id: newId })
    };

  } catch (err) {
    console.error('Unhandled Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: err.message || 'Internal Server Error' })
    };
  }
};
